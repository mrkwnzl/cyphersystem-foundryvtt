import {
  diceRoller,
  payPoolPoints,
  itemRollMacroQuick
} from "./macro-helper.js"
import {
  allInOneRollDialogString,
  spendEffortString
} from "./macro-strings.js";

export function quickRollMacro(title) {
  diceRoller(game.i18n.localize("CYPHERSYSTEM.StatRoll"), "", 0, 0)
}

export function easedRollMacro() {
  let d = new Dialog({
    title: game.i18n.localize("CYPHERSYSTEM.EasedStatRoll"),
    content: `<div align="center"><label style='display: inline-block; text-align: right'><b>${game.i18n.localize("CYPHERSYSTEM.EasedBy")}: </b></label>
    <input style='width: 50px; margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=1 data-dtype='Number'/></div>`,
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Roll"),
        callback: (html) => diceRoller(game.i18n.localize("CYPHERSYSTEM.StatRoll"), "", html.find('input').val(), 0)
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
        callback: () => { }
      }
    },
    default: "roll",
    close: () => { }
  });
  d.render(true);
}

export function hinderedRollMacro() {
  let d = new Dialog({
    title: game.i18n.localize("CYPHERSYSTEM.HinderedStatRoll"),
    content: `<div align="center"><label style='display: inline-block; text-align: right'><b>${game.i18n.localize("CYPHERSYSTEM.HinderedBy")}: </b></label>
    <input style='width: 50px; margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=1 data-dtype='Number'/></div>`,
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Roll"),
        callback: (html) => diceRoller(game.i18n.localize("CYPHERSYSTEM.StatRoll"), "", html.find('input').val()*-1, 0)
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
        callback: () => { }
      }
    },
    default: "roll",
    close: () => { }
  });
  d.render(true);
}

export function diceRollMacro(dice) {
  // Check whether the dice formula is "1dX" or "dX" to assure that both ways work
  if (dice.charAt(0) == "d") dice = "1" + dice;

  // Roll dice
  let roll = new Roll(dice).roll();

  // Send chat message
  roll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: "<b>" + dice + " " + game.i18n.localize("CYPHERSYSTEM.Roll") + "</b>"
  });
}

export function recoveryRollMacro(actor) {
  // Check for PC actor
  if (!actor || actor.data.type != "PC") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  // Roll recovery roll
  let roll = new Roll(actor.data.data.recoveries.recoveryRoll).roll();

  // Send chat message
  roll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: "<b>" + game.i18n.localize("CYPHERSYSTEM.RecoveryRoll") + "</b>"
  });
}

export function spendEffortMacro(actor) {
  // Check for PC actor
  if (!actor || actor.data.type != "PC") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  // Check for debilitated status
  if (actor.data.data.damage.damageTrack == "Debilitated") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.DebilitatedPCEffort"));

  // Create dialog
  let d = new Dialog({
    title: game.i18n.localize("CYPHERSYSTEM.SpendEffort"),
    content: spendEffortString(),
    buttons: {
      roll: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Apply"),
        callback: (html) => applyToPool(html.find('select').val(), html.find('input').val())
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
        callback: () => { }
      }
    },
    default: "roll",
    close: () => { }
  });
  d.render(true);

  // Apply points to pools
  function applyToPool(pool, level) {
    // Set penalty when impaired
    let penalty = (actor.data.data.damage.damageTrack == "Impaired") ? level : 0;

    // Determine point cost including penalty due to armor
    let cost = (pool == "Speed") ?
    (level * 2) + 1 + (level * actor.data.data.armor.speedCostTotal) + parseInt(penalty) :
    (level * 2) + 1 + parseInt(penalty);

    // Pay pool points
    payPoolPoints(actor, cost, pool);
  }
}

export function allInOneRollMacro(actor, title, info, cost, pool, modifier) {
  // Check for PC actor
  if (!actor || actor.data.type != "PC") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  // Check for debilitated status
  if (actor.data.data.damage.damageTrack == "Debilitated") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.DebilitatedPCEffort"))

  // Pay pool points
  const pointsPaid = payPoolPoints(actor, cost, pool);

  // If points are paid, roll dice
  if (pointsPaid == true) diceRoller(title, info, modifier);
}

export function allInOneRollDialog(actor, pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE) {
  // Check for PC actor
  if (!actor || actor.data.type != "PC") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  // Check for debilitated status
  if (actor.data.data.damage.damageTrack == "Debilitated") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.DebilitatedPCEffort"));

  // Set defaults for damage and damagePerLOE
  if (!damage) damage = 0;
  if (!damagePerLOE) damagePerLOE = 3;

  // Create All-in-One dialog
  let d = new Dialog({
    title: game.i18n.localize("CYPHERSYSTEM.AllInOneRoll"),
    content: allInOneRollDialogString(actor, pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE),
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Roll"),
        callback: (html) => {
          applyToMacro(html.find('#pool').val(), html.find('#skill').val(), html.find('#assets').val(), html.find('#effort1').val(), html.find('#effort2').val(), html.find('#additionalCost').val(), html.find('#additionalSteps').val(), html.find('#stepModifier').val(), title, html.find('#damage').val(), html.find('#effort3').val(), html.find('#damagePerLOE').val());
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
        callback: () => { }
      }
    },
    default: "roll",
    close: () => { }
  });
  d.render(true);

  // Prepare data and parse to allInOneRollMacro
  function applyToMacro(pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE) {
    // Title information
    let poolRoll = {
      "Might": game.i18n.localize("CYPHERSYSTEM.MightRoll"),
      "Speed": game.i18n.localize("CYPHERSYSTEM.SpeedRoll"),
      "Intellect": game.i18n.localize("CYPHERSYSTEM.IntellectRoll")
    };
    title = (title == "") ? (poolRoll[pool] || poolRoll["Might"]) : title;

    // Skill information
    let skillRating = {
      "-1": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Inability")}<br>`,
      "0": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Practiced")}<br>`,
      "1": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Trained")}<br>`,
      "2": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Specialized")}<br>`
    };
    let skillInfo = (skillRating[skill] || skillRating[0]);

    // Asset information
    let assetInfo = `${game.i18n.localize("CYPHERSYSTEM.Assets")}: ${assets}<br>`;

    // Point(s) cost information
    let costInfo = "";

    // -- Effort verification
    let effort = parseInt(effort1) + parseInt(effort2) + parseInt(effort3);

    if (effort > actor.data.data.basic.effort) {
      allInOneRollDialog(actor, pool, skillRating, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier);
      return ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.SpendTooMuchEffort"));
    };

    // -- Cost calculation
    let impaired = (actor.data.data.damage.damageTrack == "Impaired") ? effort : 0;
    let armorCost = (pool == "Speed") ? parseInt(effort) * parseInt(actor.data.data.armor.speedCostTotal) : 0;
    let cost = (effort > 0) ? (effort * 2) + 1 + parseInt(additionalCost) + parseInt(armorCost) + parseInt(impaired) : parseInt(additionalCost);

    let edgeType = {
      "Might": actor.data.data.pools.mightEdge,
      "Speed": actor.data.data.pools.speedEdge,
      "Intellect": actor.data.data.pools.intellectEdge
    };
    let edge = (edgeType[pool] || 0);
    edge = (edge < 0 && (cost == 0 || cost == "")) ? 0 : edge;

    let totalCost = (cost > edge) ? cost - edge : 0;

    // -- Cost verification
    let poolVerification = {
      "Might": function () { return (totalCost > actor.data.data.pools.might.value) ? false : true; },
      "Speed": function () { return (totalCost > actor.data.data.pools.speed.value) ? false : true; },
      "Intellect": function () { return (totalCost > actor.data.data.pools.intellect.value) ? false : true; }
    };

    // -- Information
    let poolTypeInfo = {
      "Might": function () {
        return (totalCost != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${totalCost} ${game.i18n.localize("CYPHERSYSTEM.MightPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${totalCost} ${game.i18n.localize("CYPHERSYSTEM.MightPoint")}`;
      },
      "Speed": function () {
        return (totalCost != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${totalCost} ${game.i18n.localize("CYPHERSYSTEM.SpeedPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${totalCost} ${game.i18n.localize("CYPHERSYSTEM.SpeedPoint")}`;
      },
      "Intellect": function () {
        return (totalCost != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${totalCost} ${game.i18n.localize("CYPHERSYSTEM.IntellectPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${totalCost} ${game.i18n.localize("CYPHERSYSTEM.IntellectPoint")}`;
      }
    }

    if (poolVerification[pool]()) {
      costInfo = poolTypeInfo[pool]();
    } else {
      allInOneRollDialog(actor, pool, skillRating, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier);
      return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.NotEnoughPoint", {pool: pool}));
    }

    // Effort to ease the task information
    let effortTaskInfo = (effort1 != 1) ?
    `${game.i18n.localize("CYPHERSYSTEM.EffortForTask")}: ${effort1} ${game.i18n.localize("CYPHERSYSTEM.levels")}<br>` :
    `${game.i18n.localize("CYPHERSYSTEM.EffortForTask")}: ${effort1} ${game.i18n.localize("CYPHERSYSTEM.level")}<br>`;

    // Effort for other use information
    let effortOtherInfo = (effort2 != 1) ?
    `${game.i18n.localize("CYPHERSYSTEM.EffortForOther")}: ${effort2} ${game.i18n.localize("CYPHERSYSTEM.levels")}<br>` :
    `${game.i18n.localize("CYPHERSYSTEM.EffortForOther")}: ${effort2} ${game.i18n.localize("CYPHERSYSTEM.level")}<br>`;

    // Damage information
    let damageEffort = parseInt(damagePerLOE) * parseInt(effort3);
    let totalDamage = parseInt(damage) + parseInt(damageEffort);
    let damageInfo = `${game.i18n.localize("CYPHERSYSTEM.Damage")}: ${totalDamage} (${damage}+${damageEffort})<hr style='margin-top: 1px; margin-bottom: 2px;'>`;

    // Attack modifier information
    let attackModifierInfo = "<hr style='margin-top: 1px; margin-bottom: 2px;'>";
    if (damage > 0 || effort3 > 0) {
      if (effort3 != 1) {
        attackModifierInfo = `<hr style='margin-top: 1px; margin-bottom: 2px;'>${game.i18n.localize("CYPHERSYSTEM.EffortForDamage")}: ${effort3} ${game.i18n.localize("CYPHERSYSTEM.levels")}<br>${damageInfo}`;
      } else {
        attackModifierInfo = `<hr style='margin-top: 1px; margin-bottom: 2px;'>${game.i18n.localize("CYPHERSYSTEM.EffortForDamage")}: ${effort3} ${game.i18n.localize("CYPHERSYSTEM.level")}<br>${damageInfo}`
      }
    }

    // Additional step(s) information
    additionalSteps = parseInt(additionalSteps);

    let additionalInfo = "";
    if (stepModifier != "hindered") {
      if (additionalSteps > 1) {
        additionalInfo = `${game.i18n.format("CYPHERSYSTEM.EasedByExtraSteps", {amount: additionalSteps})}<br>`;
      } else if (additionalSteps == 1) {
        additionalInfo = `${game.i18n.format("CYPHERSYSTEM.EasedByExtraStep", {amount: additionalSteps})}<br>`;
      }
    } else {
      if (additionalSteps > 1) {
        additionalInfo = `${game.i18n.format("CYPHERSYSTEM.HinderedByExtraSteps", {amount: additionalSteps})}<br>`;
      } else if (additionalSteps == 1) {
        additionalInfo = `${game.i18n.format("CYPHERSYSTEM.HinderedByExtraStep", {amount: additionalSteps})}<br>`;
      }
      additionalSteps = additionalSteps * -1;
    }

    // Put it all together for info
    let info = skillInfo + assetInfo + effortTaskInfo + effortOtherInfo + attackModifierInfo + additionalInfo + costInfo;

    // Put it all together for total modifier
    let modifier = parseInt(skill) + parseInt(assets) + parseInt(effort1) + parseInt(additionalSteps);

    // Parse everything to allInOneRollMacro
    allInOneRollMacro(actor, title, info, cost, pool, modifier);
  }
}

export function itemRollMacro(actor, itemID, pool, skill, assets, effort1, effort2, additionalSteps, additionalCost, damage, effort3, damagePerLOE) {
  // Find actor based on item ID
  const owner = game.actors.find(actor => actor.items.get(itemID));

  // Check for actor that owns the item
  if (!actor || actor.data.type != "PC") return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.MacroOnlyUsedBy", {name: owner.name}));

  // Determine the item based on item OD
  const item = actor.getOwnedItem(itemID);

  // Check whether the item still exists on the actor
  if (item == null) return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.MacroOnlyUsedBy", {name: owner.name}));

  // Prepare data for All-in-One Dialog
  if (game.settings.get("cyphersystem", "itemMacrosUseAllInOne")) {
    // Prepare defaults in case none are set by users in the macro
    if (!skill) skill = "Practiced";
    if (!assets) assets = 0;
    if (!effort1) effort1 = 0;
    if (!effort2) effort2 = 0;
    if (!effort3) effort3 = 0;
    if (!additionalCost) additionalCost = 0;
    if (!additionalSteps) additionalSteps = 0;
    if (!damage) damage = 0;
    if (!pool) pool = "Might";
    if (!damagePerLOE) damagePerLOE = 3;

    // Set the step modifier for the difficulty
    let stepModifier = (additionalSteps < 0) ? "hindered" : "eased";

    // Overwrite defaults for some item types
    if (item.type == "skill" || item.type == "teen Skill") {
      skill = item.data.data.skillLevel;
    } else if (item.type == "attack" || item.type == "teen Attack") {
      skill = item.data.data.skillRating;
      additionalSteps = item.data.data.modifiedBy;
      stepModifier = item.data.data.modified;
      damage = item.data.data.damage;
    } else if (item.type == "ability" || item.type == "teen Ability") {
      pool = item.data.data.costPool;
      let checkPlus = item.data.data.costPoints.slice(-1)
      if (checkPlus == "+") {
        let cost = item.data.data.costPoints.slice(0, -1);
        additionalCost = parseInt(cost);
      } else {
        let cost = item.data.data.costPoints;
        additionalCost = parseInt(cost);
      }
    } else if (item.type == "power Shift") {
      additionalSteps = item.data.data.powerShiftValue;
    }

    // Parse data to All-in-One Dialog or Quick Roll macro
    allInOneRollDialog(actor, pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, item.name, damage, effort3, damagePerLOE)
  } else {
    itemRollMacroQuick(actor, itemID);
  }
}

export function toggleDragRuler(token) {
  if (!game.modules.get("drag-ruler").active) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ActivateDragRuler"));
  if (!token) {
    return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.SelectAToken"))
  }

  if (!token.data.flags.cyphersystem.toggleDragRuler) {
    token.setFlag("cyphersystem", "toggleDragRuler", true);
    ui.notifications.info(game.i18n.format("CYPHERSYSTEM.EnabledDragRuler", {name: token.name}));
  } else if (token.data.flags.cyphersystem.toggleDragRuler) {
    token.setFlag("cyphersystem", "toggleDragRuler", false);
    ui.notifications.info(game.i18n.format("CYPHERSYSTEM.DisabledDragRuler", {name: token.name}));
  }
}

export function resetDragRulerDefaults() {
  if (!game.modules.get("drag-ruler").active) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ActivateDragRuler"));
  for (let t of canvas.tokens.objects.children) {
    if (t.actor.data.type !== "Token" && t.actor.data.type !== "Vehicle") {
      t.setFlag("cyphersystem", "toggleDragRuler", true);
    } else {
      t.setFlag("cyphersystem", "toggleDragRuler", false);
    }
  }
  ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.AllTokenDragRuler"));
}
