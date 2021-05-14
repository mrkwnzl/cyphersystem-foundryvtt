import {
  diceRoller,
  payPoolPoints
} from "./macro-helper.js"
import {
  itemMacroString,
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
  if (!actor || actor.data.type != "PC") {
    return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"))
  }

  if (actor.data.data.damage.damageTrack == "Debilitated") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.DebilitatedPCEffort"))

  if (!damage) damage = 0;
  if (!damagePerLOE) damagePerLOE = 3;

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

  function applyToMacro(pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE) {
    let cost = parseInt(additionalCost);
    let effort = parseInt(effort1) + parseInt(effort2) + parseInt(effort3);
    if (stepModifier == "hindered") additionalSteps = parseInt(additionalSteps) * -1;
    let modifier = parseInt(skill) + parseInt(assets) + parseInt(effort1) + parseInt(additionalSteps);
    let skillRating = game.i18n.localize("CYPHERSYSTEM.Practiced");
    let steps = " " + game.i18n.localize("CYPHERSYSTEM.Steps");
    let points = " " + game.i18n.localize("CYPHERSYSTEM.Points");
    let rollEffort = " " + game.i18n.localize("CYPHERSYSTEM.levels");
    let otherEffort = " " + game.i18n.localize("CYPHERSYSTEM.levels");
    let damageEffortLevel = " " + game.i18n.localize("CYPHERSYSTEM.levels");
    let attackModifier = "";
    let damageEffort = parseInt(damagePerLOE) * parseInt(effort3);
    let totalDamage = parseInt(damage) + parseInt(damageEffort);
    let stepModifierString = (stepModifier == "hindered") ? game.i18n.localize("CYPHERSYSTEM.Hindered") : game.i18n.localize("CYPHERSYSTEM.Eased");

    if (skill == 2) skillRating = game.i18n.localize("CYPHERSYSTEM.Specialized");
    if (skill == 1) skillRating = game.i18n.localize("CYPHERSYSTEM.Trained");
    if (skill == -1) skillRating = game.i18n.localize("CYPHERSYSTEM.Inability");

    if (effort > actor.data.data.basic.effort) {
      additionalSteps = Math.abs(additionalSteps);
      allInOneRollDialog(actor, pool, skillRating, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier);
      return ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.SpendTooMuchEffort"));
    }

    let armorCost = 0;

    if (pool == "Speed") armorCost = parseInt(effort) * parseInt(actor.data.data.armor.speedCostTotal);

    let edge = 0;

    if (pool == "Might") {
      edge = actor.data.data.pools.mightEdge;
    } else if (pool == "Speed") {
      edge = actor.data.data.pools.speedEdge;
    } else if (pool == "Intellect") {
      edge = actor.data.data.pools.intellectEdge;
    }

    let impaired = 0;

    if (actor.data.data.damage.damageTrack == "Impaired") impaired = effort;

    if (effort > 0) {
      cost = (effort * 2) + 1 + parseInt(additionalCost) + parseInt(armorCost) + parseInt(impaired);
    } else {
      cost = parseInt(additionalCost);
    }

    let totalCost = cost - edge;
    if (totalCost < 0) totalCost = 0;

    if (pool == "Might" && totalCost > actor.data.data.pools.might.value || pool == "Speed" && totalCost > actor.data.data.pools.speed.value || pool == "Intellect" && totalCost > actor.data.data.pools.intellect.value) {
      additionalSteps = Math.abs(additionalSteps);
      allInOneRollDialog(actor, pool, skillRating, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier);
      return ui.notifications.notify(game.i18n.format("CYPHERSYSTEM.NotEnoughPoint", {pool: pool}));
    }

    if (additionalSteps == 1 || additionalSteps == -1) steps = " " + game.i18n.localize("CYPHERSYSTEM.Step");

    if (cost == 1) points = " " + game.i18n.localize("CYPHERSYSTEM.Point");

    if (title == "") {
      switch (pool) {
        case "Might":
        title = game.i18n.localize("CYPHERSYSTEM.MightRoll");
        break;
        case "Speed":
        title = game.i18n.localize("CYPHERSYSTEM.SpeedRoll");
        break;
        case "Intellect":
        title = game.i18n.localize("CYPHERSYSTEM.IntellectRoll");
        break;
        default:
        title = game.i18n.format("CYPHERSYSTEM.AdditionalPoolRoll", {pool: pool});
        break;
      }
    };

    if (effort1 == 1) rollEffort = " " + game.i18n.localize("CYPHERSYSTEM.level");

    if (effort2 == 1) otherEffort = " " + game.i18n.localize("CYPHERSYSTEM.level");

    if (damageEffort == 1) damageEffortLevel = " " + game.i18n.localize("CYPHERSYSTEM.level");

    if (damage != 0 || effort3 != 0) {
      attackModifier = "<hr style='margin-top: 1px; margin-bottom: 2px;'>" + game.i18n.localize("CYPHERSYSTEM.EffortForDamage") + ": " + effort3 + damageEffortLevel + "<br>" + game.i18n.localize("CYPHERSYSTEM.Damage") + ": " + totalDamage + " (" + damage + "+" + damageEffort + ")" + "<hr style='margin-top: 1px; margin-bottom: 2px;'>";
    } else {
      attackModifier = "<hr style='margin-top: 1px; margin-bottom: 2px;'>"
    }

    let info = game.i18n.localize("CYPHERSYSTEM.SkillLevel") + ": " + skillRating + "<br>" + game.i18n.localize("CYPHERSYSTEM.Assets") + ": " + assets + "<br>" + game.i18n.localize("CYPHERSYSTEM.EffortForTask") + ": " + effort1 + rollEffort + "<br>" + game.i18n.localize("CYPHERSYSTEM.EffortForOther") + ": " + effort2 + otherEffort + attackModifier + game.i18n.localize("CYPHERSYSTEM.Difficulty") + ": " + stepModifierString + " " + game.i18n.localize("CYPHERSYSTEM.By") + " " + Math.abs(additionalSteps) + " " + game.i18n.localize("CYPHERSYSTEM.Additional") + " " + steps + "<br>" + game.i18n.localize("CYPHERSYSTEM.TotalCost") + ": " + totalCost + " " + pool + points

    allInOneRollMacro(actor, title, info, cost, pool, modifier);
  }
}
