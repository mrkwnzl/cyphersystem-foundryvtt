import {
  renameTag
} from "./macro-helper.js";
import {
  spendEffortString,
  calculateAttackDifficultyString,
  renameTagString,
  itemMacroString
} from "./macro-strings.js";
import {
  chatCardProposeIntrusion,
  chatCardAskForIntrusion
} from "../utilities/chat-cards.js";
import {
  useRecoveries,
  payPoolPoints
} from "../utilities/actor-utilities.js";
import {barBrawlData} from "../utilities/token-utilities.js";
import {
  rollEngineMain,
  useEffectiveDifficulty
} from "../utilities/roll-engine/roll-engine-main.js";
import {taggingEngineMain} from "../utilities/tagging-engine/tagging-engine-main.js";
import {updateRollDifficultyForm} from "../forms/roll-difficulty-sheet.js";

/* -------------------------------------------- */
/*  Roll Macros                                 */
/* -------------------------------------------- */

export function quickRollMacro(title) {
  rollEngineMain({title: title});
}

export function easedRollMacro() {
  let d = new Dialog({
    title: game.i18n.localize("CYPHERSYSTEM.EasedStatRoll"),
    content: `<div align="center"><label style="display: inline-block; text-align: right"><b>${game.i18n.localize("CYPHERSYSTEM.EasedBy")}: </b></label>
    <input style="width: 50px; margin-left: 5px; margin-bottom: 5px;text-align: center" type="number" value=1 /></div>`,
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Roll"),
        callback: (html) => rollEngineMain({title: game.i18n.localize("CYPHERSYSTEM.StatRoll"), difficultyModifier: parseInt(html.find('input').val()), easedOrHindered: "eased"})
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
        callback: () => {}
      }
    },
    default: "roll",
    close: () => {}
  });
  d.render(true);
}

export function hinderedRollMacro() {
  let d = new Dialog({
    title: game.i18n.localize("CYPHERSYSTEM.HinderedStatRoll"),
    content: `
    <div align="center">
    <label style="display: inline-block; text-align: right">
    <b>${game.i18n.localize("CYPHERSYSTEM.HinderedBy")}: </b>
    </label>
    <input style="width: 50px; margin-left: 5px; margin-bottom: 5px;text-align: center" type="number" value=1 /></div>`,
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Roll"),
        callback: (html) => rollEngineMain({title: game.i18n.localize("CYPHERSYSTEM.StatRoll"), difficultyModifier: parseInt(html.find('input').val()), easedOrHindered: "hindered"})
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
        callback: () => {}
      }
    },
    default: "roll",
    close: () => {}
  });
  d.render(true);
}

export async function selectedTokenRollMacro(actor, title) {
  // Check for actorUuid
  if (!actor) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.SelectAToken"));

  let actorUuid = actor.uuid;

  // Set default for difficulty
  let lastChatMessage = game.messages.contents[game.messages.contents.length - 1];
  let difficulty = (lastChatMessage?.flags?.difficulty) ? lastChatMessage.flags.difficulty : "-1";

  let skipDialog = (game.keyboard.isModifierActive('Alt')) ? game.settings.get("cyphersystem", "itemMacrosUseAllInOne") : !game.settings.get("cyphersystem", "itemMacrosUseAllInOne");

  let d = new Dialog({
    title: game.i18n.localize("CYPHERSYSTEM.StatRoll"),
    content: `
    <div align="center">
      <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}:</label>
      <select name="baseDifficulty" id="baseDifficulty" class="dialog-select roll-engine-select" style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
        <option value="-1" ${(difficulty == "-1" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.None")}</option>
        <option value="0" ${(difficulty == 0 ? "selected" : "")}>0</option>
        <option value="1" ${(difficulty == 1 ? "selected" : "")}>1</option>
        <option value="2" ${(difficulty == 2 ? "selected" : "")}>2</option>
        <option value="3" ${(difficulty == 3 ? "selected" : "")}>3</option>
        <option value="4" ${(difficulty == 4 ? "selected" : "")}>4</option>
        <option value="5" ${(difficulty == 5 ? "selected" : "")}>5</option>
        <option value="6" ${(difficulty == 6 ? "selected" : "")}>6</option>
        <option value="7" ${(difficulty == 7 ? "selected" : "")}>7</option>
        <option value="8" ${(difficulty == 8 ? "selected" : "")}>8</option>
        <option value="9" ${(difficulty == 9 ? "selected" : "")}>9</option>
        <option value="10" ${(difficulty == 10 ? "selected" : "")}>10</option>
        <option value="11" ${(difficulty == 11 ? "selected" : "")}>11</option>
        <option value="12" ${(difficulty == 12 ? "selected" : "")}>12</option>
        <option value="13" ${(difficulty == 13 ? "selected" : "")}>13</option>
        <option value="14" ${(difficulty == 14 ? "selected" : "")}>14</option>
        <option value="15" ${(difficulty == 15 ? "selected" : "")}>15</option>
      </select><br>
      <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.DifficultyModifier")}:</label>
      <select name="easedOrHindered" id="easedOrHindered" class="dialog-select" style='height: 26px; width: 110px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
        <option value='eased'>${game.i18n.localize("CYPHERSYSTEM.EasedBy")}</option>
        <option value='hindered'>${game.i18n.localize("CYPHERSYSTEM.HinderedBy")}</option>
      </select>
      <input class="roll-engine-input-eased-hindered" name="difficultyModifier" id="difficultyModifier" type="number" value="0" style='width: 57px; margin-left: 0px; margin-bottom: 5px; text-align: center'/><br>
    </div>
    `,
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Roll"),
        callback: (html) => rollDice({actorUuid: actorUuid, title: game.i18n.localize("CYPHERSYSTEM.StatRoll"), baseDifficulty: html.find('#baseDifficulty').val(), difficultyModifier: html.find('#difficultyModifier').val(), easedOrHindered: html.find('#easedOrHindered').val()})
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
        callback: () => {}
      }
    },
    default: "roll",
    close: () => {}
  });

  if (!skipDialog) {
    d.render(true);
  } else {
    rollDice({actorUuid: actorUuid, title: game.i18n.localize("CYPHERSYSTEM.StatRoll"), baseDifficulty: difficulty, difficultyModifier: 0, easedOrHindered: "eased"});
  }

  async function rollDice(data) {
    let actor = fromUuidSync(data.actorUuid);
    let roll = await new Roll("1d20").evaluate({async: true});

    // Calculate roll modifiers
    data.difficultyModifier = (data.easedOrHindered == "hindered") ? parseInt(data.difficultyModifier * -1) : parseInt(data.difficultyModifier);

    let modifiedBy = "";
    if (data.difficultyModifier != 0) {
      if (data.difficultyModifier > 1) {
        modifiedBy = game.i18n.format("CYPHERSYSTEM.EasedBySteps", {amount: data.difficultyModifier});
      } else if (data.difficultyModifier == 1) {
        modifiedBy = game.i18n.localize("CYPHERSYSTEM.Eased");
      } else if (data.difficultyModifier == -1) {
        modifiedBy = game.i18n.localize("CYPHERSYSTEM.Hindered");
      } else if (data.difficultyModifier < -1) {
        modifiedBy = game.i18n.format("CYPHERSYSTEM.HinderedBySteps", {amount: Math.abs(data.difficultyModifier)});
      }
    }

    let easedOrHinderedInfo = "";
    let finalDifficulty = data.baseDifficulty - data.difficultyModifier;
    let taskDifficulty = (!useEffectiveDifficulty(data.baseDifficulty)) ?
      "<br>" + game.i18n.localize("CYPHERSYSTEM.FinalDifficulty") + ": " + finalDifficulty + " (" + Math.max(0, finalDifficulty * 3) + ")" :
      "";
    if (modifiedBy) {
      easedOrHinderedInfo = modifiedBy + taskDifficulty + "<hr class='hr-chat'>";
    }

    // Create difficulty info
    let baseDifficultyInfo = (data.baseDifficulty >= 0) ? "<br>" + game.i18n.localize("CYPHERSYSTEM.BaseDifficulty") + ": " + data.baseDifficulty + " (" + Math.max(0, data.baseDifficulty * 3) + ")" : "";

    // Create beatenDifficulty info
    let beatenDifficulty = (roll.total < 0) ? Math.ceil(roll.total / 3) : Math.floor(roll.total / 3);

    if (useEffectiveDifficulty(data.baseDifficulty)) {
      let operator = (data.difficultyModifier < 0) ? "-" : "+";
      let effectiveDifficulty = beatenDifficulty + data.difficultyModifier;
      if (effectiveDifficulty < 0) effectiveDifficulty = 0;
      var difficultyResult = effectiveDifficulty + " [" + beatenDifficulty + operator + Math.abs(data.difficultyModifier) + "]";
    } else {
      if (beatenDifficulty < 0) beatenDifficulty = 0;
      var difficultyResult = beatenDifficulty + " (" + beatenDifficulty * 3 + ")";
    }

    let beatenDifficultyInfo = "<span class='roll-difficulty'>" + game.i18n.localize("CYPHERSYSTEM.RollBeatDifficulty") + " " + difficultyResult + "</span>";

    // Create success info
    let successInfo = "";
    if (data.baseDifficulty >= 0) {
      let difficultyBeaten = difficulty;
      successInfo = (difficultyBeaten >= finalDifficulty) ? "<br><span class='roll-effect effect1920'>" + game.i18n.localize("CYPHERSYSTEM.Success") + "</span>" : "<br><span class='roll-effect intrusion'>" + game.i18n.localize("CYPHERSYSTEM.Failure") + "</span>";
    };

    let flavor = "<div class='roll-flavor'>" + title + baseDifficultyInfo + "<hr class='hr-chat'>" + easedOrHinderedInfo + beatenDifficultyInfo + successInfo + "</div>";

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor: actor}),
      flavor: flavor,
      flags: {
        "itemID": data.itemID,
        "data": data
      }
    });
  }
}

export async function diceRollMacro(dice, actor) {
  // Check whether the dice formula is "1dX" or "dX" to assure that both ways work
  if (dice.charAt(0) == "d") dice = "1" + dice;

  // Roll dice
  const roll = await new Roll(dice).evaluate({async: false});

  // Add reroll button
  let reRollButton = `<div class="chat-card-buttons"><a class="reroll-dice-roll" title="${game.i18n.localize("CYPHERSYSTEM.Reroll")}" data-dice="${dice}" data-user="${game.user.id}"><i class="fas fa-dice-d20"></a></div>`;

  // Send chat message
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({actor: actor}),
    flavor: "<div class='roll-flavor'><b>" + dice + " " + game.i18n.localize("CYPHERSYSTEM.Roll") + "</b>" + reRollButton + "</div>"
  });
}

export async function allInOneRollDialog(actor, pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE, teen, skipDialog, noRoll, itemID, bonus) {
  if (!actor) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  let initiativeRoll = (actor.items.get(itemID)) ? actor.items.get(itemID).system.settings.general.initiative : false;

  // Apply to roll eninge
  rollEngineMain({
    actorUuid: actor.uuid,
    itemID: itemID,
    teen: teen,
    skipDialog: skipDialog,
    skipRoll: noRoll,
    initiative: initiativeRoll,
    title: title,
    pool: pool,
    skillLevel: skill,
    assets: parseInt(assets),
    effortToEase: parseInt(effort1),
    effortOtherUses: parseInt(effort2),
    damage: parseInt(damage),
    effortDamage: parseInt(effort3),
    damagePerLOE: parseInt(damagePerLOE),
    difficultyModifier: parseInt(additionalSteps),
    easedOrHindered: stepModifier,
    bonus: parseInt(bonus),
    poolPointCost: parseInt(additionalCost)
  });
}

export async function itemRollMacro(actor, itemID, pool, skillLevel, assets, effort1, effort2, additionalSteps, additionalCost, damage, effort3, damagePerLOE, teen, stepModifier, noRoll, bonus) {
  // Find actor based on item ID
  const owner = game.actors.find(actor => actor.items.get(itemID));

  // Check for actor that owns the item
  if (!actor || actor.type != "pc") return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.MacroOnlyUsedBy", {name: owner.name}));

  // Determine the item based on item ID
  const item = actor.items.get(itemID);

  // Check whether the item still exists on the actor
  if (item == null) return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.MacroOnlyUsedBy", {name: owner.name}));

  // Check for combat-readiness
  let initiativeRoll = item.system.settings.general.initiative;
  if (initiativeRoll) {
    if (!game.combat) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.NoCombatActive"));
    if (actor.getActiveTokens().length == 0) return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.NoTokensOnScene", {name: actor.name}));
  }

  // Prepare data
  // Prepare defaults in case none are set by users in the macro
  if (!skillLevel) {
    if (item.type == "skill") {
      skillLevel = item.system.basic.rating;
    } else if (item.type == "attack") {
      skillLevel = item.system.basic.skillRating;
    } else {
      skillLevel = item.system.settings.rollButton.skill;
    }
  }
  if (!assets) assets = item.system.settings.rollButton.assets;
  if (!effort1) effort1 = item.system.settings.rollButton.effort1;
  if (!effort2) effort2 = item.system.settings.rollButton.effort2;
  if (!effort3) effort3 = item.system.settings.rollButton.effort3;
  if (!additionalCost) {
    if (item.type == "ability") {
      let checkPlus = item.system.basic.cost.slice(-1);
      if (checkPlus == "+") {
        let cost = item.system.basic.cost.slice(0, -1);
        additionalCost = cost;
      } else {
        let cost = item.system.basic.cost;
        additionalCost = cost;
      }
    } else {
      additionalCost = item.system.settings.rollButton.additionalCost;
    }
  }
  if (!stepModifier && !additionalSteps) {
    if (item.type == "attack") {
      additionalSteps = item.system.basic.steps;
      stepModifier = item.system.basic.modifier;
    } else {
      additionalSteps = item.system.settings.rollButton.additionalSteps;
      stepModifier = item.system.settings.rollButton.stepModifier;
    }
  } else if (!stepModifier && additionalSteps) {
    if (item.type == "attack") {
      stepModifier = item.system.basic.modifier;
    } else {
      stepModifier = (additionalSteps < 0) ? "hindered" : "eased";
    }
  }
  if (!damage) {
    if (item.type == "attack") {
      damage = item.system.basic.damage;
    } else {
      damage = item.system.settings.rollButton.damage;
    }
  }
  if (!pool) {
    if (item.type == "ability") {
      pool = item.system.basic.pool;
    } else {
      pool = item.system.settings.rollButton.pool;
    }
  }
  if (!damagePerLOE) damagePerLOE = item.system.settings.rollButton.damagePerLOE;
  if (!teen) teen = (actor.system.basic.unmaskedForm == "Teen") ? true : false;
  if (!bonus) bonus = item.system.settings.rollButton.bonus;

  // Create item type
  let itemType = "";
  if (item.type == "ability" && item.system.spell) {
    itemType = game.i18n.localize("CYPHERSYSTEM.Spell") + ": ";
  } else if ((item.type == "ability") && !item.system.spell) {
    itemType = game.i18n.localize("TYPES.Item.ability") + ": ";
  } else if (item.type == "attack") {
    itemType = game.i18n.localize("TYPES.Item.attack") + ": ";
  } else if (item.type == "skill") {
    itemType = game.i18n.localize("TYPES.Item.skill") + ": ";
  }

  // Parse data to All-in-One Dialog
  rollEngineMain({
    actorUuid: actor.uuid,
    itemID: itemID,
    teen: teen,
    skipRoll: noRoll,
    initiative: initiativeRoll,
    title: itemType + item.name,
    pool: pool,
    skillLevel: skillLevel,
    assets: parseInt(assets),
    effortToEase: parseInt(effort1),
    effortOtherUses: parseInt(effort2),
    damage: parseInt(damage),
    effortDamage: parseInt(effort3),
    damagePerLOE: parseInt(damagePerLOE),
    difficultyModifier: parseInt(Math.abs(additionalSteps)),
    easedOrHindered: stepModifier,
    bonus: parseInt(bonus),
    poolPointCost: parseInt(additionalCost)
  });
}

/* -------------------------------------------- */
/*  Utility Macros                              */
/* -------------------------------------------- */

export async function recoveryRollMacro(actor, dice, useRecovery) {
  // Check for dice
  if (!dice) {
    // Check for PC actor
    if (!actor || actor.type != "pc") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

    // Define dice
    dice = actor.system.combat.recoveries.roll;
  }

  // Check if recovery should be used
  if (!useRecovery) useRecovery = false;

  if (game.keyboard.isModifierActive('Alt')) {
    useRecovery = (useRecovery) ? false : true;
  }

  // Check for recovery used
  let recoveryUsed = (useRecovery) ? useRecoveries(actor, false) : "";
  if (recoveryUsed == undefined) return;

  // Roll recovery roll
  let roll = await new Roll(dice).evaluate({async: true});

  // Add reroll button
  let reRollButton = `<div style="text-align: right"><a class="reroll-recovery" data-dice="${dice}" data-user="${game.user.id}" data-actor-uuid="${actor.uuid}"><i class="fas fa-dice-d20"></i></a></div>`;

  // Send chat message
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({actor: actor}),
    flavor: game.i18n.format("CYPHERSYSTEM.UseARecoveryRoll", {name: actor.name, recoveryUsed: recoveryUsed}) + reRollButton,
    flags: {"itemID": "recovery-roll"}
  });
}

export function spendEffortMacro(actor) {
  // Check for PC actor
  if (!actor || actor.type != "pc") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

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
        callback: () => {}
      }
    },
    default: "roll",
    close: () => {}
  });
  d.render(true);

  // Apply points to pools
  function applyToPool(pool, level) {
    // -- Determine impaired & debilitated status
    let impairedStatus = false;
    if (actor.system.basic.unmaskedForm == "Teen") {
      if (actor.system.teen.combat.damage.damageTrack == "Impaired" && actor.system.teen.combat.damage.applyImpaired) impairedStatus = true;
      if (actor.system.teen.combat.damage.damageTrack == "Debilitated" && actor.system.teen.combat.damage.applyDebilitated) impairedStatus = true;
    } else if (actor.system.basic.unmaskedForm == "Mask") {
      if (actor.system.combat.damageTrack.state == "Impaired" && actor.system.combat.damageTrack.applyImpaired) impairedStatus = true;
      if (actor.system.combat.damageTrack.state == "Debilitated" && actor.system.combat.damageTrack.applyDebilitated) impairedStatus = true;
    }

    // Set penalty when impaired
    let penalty = (impairedStatus) ? level : 0;

    // Determine point cost including penalty due to armor
    let cost = (pool == "Speed") ?
      (level * 2) + 1 + (level * actor.system.combat.armor.costTotal) + penalty :
      (level * 2) + 1 + penalty;

    // Pay pool points
    payPoolPoints(actor, cost, pool);
  }
}

export function toggleDragRuler(token) {
  if (!game.modules.get("drag-ruler").active) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ActivateDragRuler"));
  if (!token) {
    return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.SelectAToken"));
  }

  if (!token.document.data.flags.cyphersystem.toggleDragRuler) {
    token.document.setFlag("cyphersystem", "toggleDragRuler", true);
    ui.notifications.info(game.i18n.format("CYPHERSYSTEM.EnabledDragRuler", {name: token.name}));
  } else if (token.document.data.flags.cyphersystem.toggleDragRuler) {
    token.document.setFlag("cyphersystem", "toggleDragRuler", false);
    ui.notifications.info(game.i18n.format("CYPHERSYSTEM.DisabledDragRuler", {name: token.name}));
  }
}

export function resetDragRulerDefaults() {
  if (!game.modules.get("drag-ruler").active) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ActivateDragRuler"));
  for (let token of canvas.tokens.objects.children) {
    if (token.actor.type !== "marker" && token.actor.type !== "vehicle") {
      token.document.setFlag("cyphersystem", "toggleDragRuler", true);
    } else {
      token.document.setFlag("cyphersystem", "toggleDragRuler", false);
    }
  }
  ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.AllTokenDragRuler"));
}

export async function resetBarBrawlDefaults(tokens) {
  if (!game.modules.get("barbrawl").active) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ActivateBarBrawl"));
  tokens = (!tokens) ? canvas.tokens.objects.children : [tokens];
  for (let token of tokens) {
    let actor = game.actors.get(token.document.actorId);
    await token.document.update({
      [`flags.-=barbrawl`]: null,
      "bar1.attribute": null,
      "bar2.attribute": null
    });
    await token.document.update(barBrawlData(actor.type, actor));
  }
  // location.reload();
}

export async function removeBarBrawlSettings(tokens) {
  if (!game.modules.get("barbrawl").active) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ActivateBarBrawl"));
  tokens = (!tokens) ? canvas.tokens.objects.children : [tokens];
  for (let token of tokens) {
    await token.document.update({
      [`flags.-=barbrawl`]: null,
      "bar1.attribute": null,
      "bar2.attribute": null
    });
  }
  location.reload();
}

export function quickStatChange(token, stat, modifier) {
  // Make sure stat is case-insensitive
  stat = stat.toLowerCase();

  // Declare variable
  let statData;

  // Get stat data
  switch (stat) {
    case "xp":
      if (!checkToken(["pc"], game.i18n.localize("CYPHERSYSTEM.XP"))) return;
      statData = calculateStatData(token.actor.system.basic.xp);
      token.actor.update({"system.basic.xp": statData});
      break;
    case "might":
      if (!checkToken(["pc"], game.i18n.localize("CYPHERSYSTEM.Might"))) return;
      statData = calculateStatData(token.actor.system.pools.might.value);
      token.actor.update({"system.pools.might.value": statData});
      break;
    case "speed":
      if (!checkToken(["pc"], game.i18n.localize("CYPHERSYSTEM.Speed"))) return;
      statData = calculateStatData(token.actor.system.pools.speed.value);
      token.actor.update({"system.pools.speed.value": statData});
      break;
    case "intellect":
      if (!checkToken(["pc"], game.i18n.localize("CYPHERSYSTEM.Intellect"))) return;
      statData = calculateStatData(token.actor.system.pools.intellect.value);
      token.actor.update({"system.pools.intellect.value": statData});
      break;
    case "health":
      if (!checkToken(["npc", "community", "companion"], game.i18n.localize("CYPHERSYSTEM.Health"))) return;
      statData = calculateStatData(token.actor.system.pools.health.value);
      token.actor.update({"system.pools.health.value": statData});
      break;
    case "infrastructure":
      if (!checkToken(["community"], game.i18n.localize("CYPHERSYSTEM.Infrastructure"))) return;
      statData = calculateStatData(token.actor.system.pools.infrastructure.value);
      token.actor.update({"system.pools.infrastructure.value": statData});
      break;
    case "quantity":
      if (!checkToken(["marker"], game.i18n.localize("CYPHERSYSTEM.Quantity"))) return;
      statData = calculateStatData(token.actor.system.pools.quantity.value);
      token.actor.update({"system.pools.quantity.value": statData});
      break;
    default:
      return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.StatNotCompatible", {stat: stat}));
  }

  // Check whether a correct token is selected
  function checkToken(actorTypes, statString) {
    if (!token || !actorTypes.includes(token.actor.type)) {
      ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.PleaseSelectTokenStat", {stat: statString}));
      return false;
    } else {
      return true;
    }
  }

  // Calculate the new stat value
  function calculateStatData(statData) {
    statData = statData + modifier;
    if (statData < 0) statData = 0;
    return statData;
  }
}

export async function proposeIntrusion(actor) {
  // Check if user is GM
  if (!game.user.isGM) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.IntrusionGMWarning"));

  // Check for selected token
  if (!actor && canvas.tokens.controlled[0].actor) {
    let token = canvas.tokens.controlled[0].actor;
    if (token?.type == "pc" && token?.hasPlayerOwner) {
      actor = token;
    } else if (token?.type == "companion") {
      let ownedBy = game.actors?.getName(token.system.basic.ownedBy);
      if (ownedBy?.hasPlayerOwner) {
        actor = ownedBy;
      }
    }
  }

  // Check for actor
  if (!actor) {
    // Create list of PCs
    let selectOptions = "";
    for (let actor of game.actors.contents) {
      if (actor.type === "pc" && actor.hasPlayerOwner) {
        let owners = "";
        for (let user of game.users.contents) {
          if (!user.isGM) {
            let ownerID = user._id;
            if (actor.ownership[ownerID] == 3 || actor.ownership["default"] == 3) {
              owners = (owners == "") ? user.name : owners + ", " + user.name;
            }
          }
        }
        if (owners) {
          owners = " (" + owners + ")";
        }
        selectOptions = selectOptions + `<option value=${actor._id}>${actor.name}${owners}</option>`;
      }
    }

    if (selectOptions == "") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.NoPCsNoIntrusion"));

    // Create dialog
    let d = new Dialog({
      title: game.i18n.localize("CYPHERSYSTEM.ProposeIntrusion"),
      content: chatCardProposeIntrusion(selectOptions),
      buttons: {
        apply: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("CYPHERSYSTEM.Apply"),
          callback: (html) => askForIntrusion(html.find('#selectPC').val())
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
          callback: () => {}
        }
      },
      default: "apply",
      close: () => {}
    });
    d.render(true, {width: "auto"});
  } else {
    if (actor.type != "pc") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));
    askForIntrusion(actor._id);
  }

  // Create chat message
  function askForIntrusion(actorId) {
    let actor = game.actors.get(actorId);

    ChatMessage.create({
      content: chatCardAskForIntrusion(actor, actorId)
    });
  }
}

export function changeSymbolForFractions() {
  let slash = !game.settings.get("cyphersystem", "useSlashForFractions");
  game.settings.set("cyphersystem", "useSlashForFractions", slash);
}

export function toggleAlwaysShowDescriptionOnRoll() {
  let toggle = game.settings.get("cyphersystem", "alwaysShowDescriptionOnRoll") ? false : true;
  game.settings.set("cyphersystem", "alwaysShowDescriptionOnRoll", toggle);
  (toggle) ? ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.AlwaysShowDescriptionEnabledNotification")) : ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.AlwaysShowDescriptionDisabledNotification"));
}

export async function recursionMacro(actor, item) {
  if (!actor) return ui.notifications.error(game.i18n.localize("CYPHERSYSTEM.ActorNotFound"));
  if (!item) return ui.notifications.error(game.i18n.localize("CYPHERSYSTEM.ItemNotFound"));
  await taggingEngineMain(actor, {
    item: item,
    statChanges: {
      mightModifier: item.system.settings.statModifiers.might.value,
      mightEdgeModifier: item.system.settings.statModifiers.might.edge,
      speedModifier: item.system.settings.statModifiers.speed.value,
      speedEdgeModifier: item.system.settings.statModifiers.speed.edge,
      intellectModifier: item.system.settings.statModifiers.intellect.value,
      intellectEdgeModifier: item.system.settings.statModifiers.intellect.edge,
      itemActive: item.system.active
    }
  });
}

export async function tagMacro(actor, item) {
  if (!actor) return ui.notifications.error(game.i18n.localize("CYPHERSYSTEM.ActorNotFound"));
  if (!item) return ui.notifications.error(game.i18n.localize("CYPHERSYSTEM.ItemNotFound"));
  await taggingEngineMain(actor, {
    item: item,
    statChanges: {
      mightModifier: item.system.settings.statModifiers.might.value,
      mightEdgeModifier: item.system.settings.statModifiers.might.edge,
      speedModifier: item.system.settings.statModifiers.speed.value,
      speedEdgeModifier: item.system.settings.statModifiers.speed.edge,
      intellectModifier: item.system.settings.statModifiers.intellect.value,
      intellectEdgeModifier: item.system.settings.statModifiers.intellect.edge,
      itemActive: item.system.active
    }
  });
}

export async function calculateAttackDifficulty(difficulty, pcRole, chatMessage, cover, positionProne, positionHighGround, surprise, range, illumination, mist, hiding, invisible, water, targetMoving, attackerMoving, attackerJostled, gravity, additionalOneValue, additionalOneName, additionalTwoValue, additionalTwoName, additionalThreeValue, additionalThreeName, description1, description2, description3, description4, description5, description6, skipDialog, persistentRollDifficulty) {

  if (persistentRollDifficulty === undefined) {
    persistentRollDifficulty = game.settings.get("cyphersystem", "persistentRollDifficulty");
  }

  if (difficulty === undefined) {
    difficulty = game.settings.get("cyphersystem", "rollDifficulty");
  }

  // Create All-in-One dialog
  let d = new Dialog({
    title: game.i18n.localize("CYPHERSYSTEM.CalculateAttackDifficulty"),
    content: calculateAttackDifficultyString(difficulty, pcRole, chatMessage, cover, positionProne, positionHighGround, surprise, range, illumination, mist, hiding, invisible, water, targetMoving, attackerMoving, attackerJostled, gravity, additionalOneValue, additionalOneName, additionalTwoValue, additionalTwoName, additionalThreeValue, additionalThreeName, persistentRollDifficulty),
    buttons: {
      calculate: {
        icon: '<i class="fas fa-calculator"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Calculate"),
        callback: (html) => {
          additionalOneValue = (html.find('#additionalOne').val() != "") ? html.find('#additionalOne').val() : html.find('#additionalOne').attr('placeholder');
          additionalTwoValue = (html.find('#additionalTwo').val() != "") ? html.find('#additionalTwo').val() : html.find('#additionalTwo').attr('placeholder');
          additionalThreeValue = (html.find('#additionalThree').val() != "") ? html.find('#additionalThree').val() : html.find('#additionalThree').attr('placeholder');
          calculate(
            html.find('#difficulty').val(),
            html.find('#pcRole').val(),
            html.find('#chatMessage').val(),
            html.find('#cover').prop('checked'),
            html.find('#positionProne').val(),
            html.find('#positionHighGround').prop('checked'),
            html.find('#surprise').val(),
            html.find('#range').val(),
            html.find('#illumination').val(),
            html.find('#mist').prop('checked'),
            html.find('#hiding').prop('checked'),
            html.find('#invisible').prop('checked'),
            html.find('#water').val(),
            html.find('#targetMoving').prop('checked'),
            html.find('#attackerMoving').prop('checked'),
            html.find('#attackerJostled').prop('checked'),
            html.find('#gravity').prop('checked'),
            additionalOneValue,
            html.find('#additionalOneName').val(),
            additionalTwoValue,
            html.find('#additionalTwoName').val(),
            additionalThreeValue,
            html.find('#additionalThreeName').val(),
            html.find('#stepModifierOne').val(),
            html.find('#stepModifierTwo').val(),
            html.find('#stepModifierThree').val(),
            description1,
            description2,
            description3,
            description4,
            description5,
            description6,
            html.find('#persistentRollDifficulty').val(),
          );
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
        callback: () => {}
      }
    },
    default: "calculate",
    close: () => {}
  });

  if (game.keyboard.isModifierActive('Alt')) {
    skipDialog = (skipDialog) ? false : true;
  }

  if (!skipDialog) {
    d.render(true);
  } else {
    let stepModifierOne = (additionalOneValue >= 0) ? 1 : -1;
    let stepModifierTwo = (additionalTwoValue >= 0) ? 1 : -1;
    let stepModifierThree = (additionalThreeValue >= 0) ? 1 : -1;
    calculate(difficulty, pcRole, chatMessage, cover, positionProne, positionHighGround, surprise, range, illumination, mist, hiding, invisible, water, targetMoving, attackerMoving, attackerJostled, gravity, Math.abs(additionalOneValue), additionalOneName, Math.abs(additionalTwoValue), additionalTwoName, Math.abs(additionalThreeValue), additionalThreeName, stepModifierOne, stepModifierTwo, stepModifierThree, description1, description2, description3, description4, description5, description6, persistentRollDifficulty);
  }

  async function calculate(difficulty, pcRole, chatMessage, cover, positionProne, positionHighGround, surprise, range, illumination, mist, hiding, invisible, water, targetMoving, attackerMoving, attackerJostled, gravity, additionalOneValue, additionalOneName, additionalTwoValue, additionalTwoName, additionalThreeValue, additionalThreeName, stepModifierOne, stepModifierTwo, stepModifierThree, description1, description2, description3, description4, description5, description6, persistentRollDifficulty) {
    let modifier = 0;
    let basicInfo = "";
    let pcRoleInfo = "";
    let coverInfo = "";
    let positionInfo = "";
    let surpriseInfo = "";
    let rangeInfo = "";
    let illuminationInfo = "";
    let visibilityInfo = "";
    let waterInfo = "";
    let movementInfo = "";
    let gravityInfo = "";
    let additionalInfo = "";
    let resultInfo = "";
    let chatMessageText = "";
    let chatMessageVagueText = "";
    let signEased = (pcRole == 0) ? "-" : "+";
    let signHindered = (pcRole == 0) ? "+" : "-";

    await game.settings.set("cyphersystem", "persistentRollDifficulty", persistentRollDifficulty);

    if (pcRole == 0) {
      pcRoleInfo = game.i18n.localize("CYPHERSYSTEM.PCIsAttacker");
    } else {
      pcRoleInfo = game.i18n.localize("CYPHERSYSTEM.PCIsTarget");
    }

    basicInfo = game.i18n.localize("CYPHERSYSTEM.TaskDifficulty") + '<hr class="hr-chat">' + game.i18n.localize("CYPHERSYSTEM.BaseDifficulty") + ": " + difficulty + "<br>" + pcRoleInfo;

    if (cover == true) {
      modifier = modifier + 1;
      coverInfo = '<hr class="hr-chat">' + game.i18n.localize("CYPHERSYSTEM.TargetHasCover") + " (" + signHindered + "1)";
    }

    if (positionProne > 0 || positionHighGround == true) {
      positionInfo = '<hr class="hr-chat">';
    }

    if (positionProne == 1) {
      modifier = modifier - 1;
      positionInfo = positionInfo + game.i18n.localize("CYPHERSYSTEM.TargetIsProneMelee") + " (" + signEased + "1)";
    } else if (positionProne == 2) {
      modifier = modifier + 1;
      positionInfo = positionInfo + game.i18n.localize("CYPHERSYSTEM.TargetIsProneRanged") + " (" + signHindered + "1)";
    }

    if (positionHighGround == true) {
      modifier = modifier - 1;
      positionInfo = positionInfo + ((positionProne > 0) ? "<br>" : "") + game.i18n.localize("CYPHERSYSTEM.AttackerHasHighGround") + " (" + signEased + "1)";
    }

    if (surprise > 0) {
      surpriseInfo = '<hr class="hr-chat">';
    }

    if (surprise == 1) {
      modifier = modifier - 2;
      surpriseInfo = surpriseInfo + game.i18n.localize("CYPHERSYSTEM.TargetIsUnaware") + " (" + signEased + "2)";
    } else if (surprise == 2) {
      modifier = modifier - 1;
      surpriseInfo = surpriseInfo + game.i18n.localize("CYPHERSYSTEM.TargetIsAwareButNotLocation") + " (" + signEased + "1)";
    }

    if (range == 1) {
      modifier = modifier - 1;
      rangeInfo = '<hr class="hr-chat">' + game.i18n.localize("CYPHERSYSTEM.TargetIsInPointBlankRange") + " (" + signEased + "1)";
    } else if (range == 2) {
      modifier = modifier + 1;
      rangeInfo = '<hr class="hr-chat">' + game.i18n.localize("CYPHERSYSTEM.TargetIsInExtremeRange") + " (" + signHindered + "1)";
    } else if (range == 3) {
      modifier = modifier + 2;
      rangeInfo = '<hr class="hr-chat">' + game.i18n.localize("CYPHERSYSTEM.TargetIsBeyondExtremeRange") + " (" + signHindered + "2)";
    }

    if (illumination == 1) {
      modifier = modifier + 1;
      illuminationInfo = '<hr class="hr-chat">' + game.i18n.localize("CYPHERSYSTEM.TargetIsInDimLight") + " (" + signHindered + "1)";
    } else if (illumination == 2) {
      modifier = modifier + 1;
      illuminationInfo = '<hr class="hr-chat">' + game.i18n.localize("CYPHERSYSTEM.TargetIsInVeryDimLightImmediate") + " (" + signHindered + "1)";
    } else if (illumination == 3) {
      modifier = modifier + 2;
      illuminationInfo = '<hr class="hr-chat">' + game.i18n.localize("CYPHERSYSTEM.TargetIsInVeryDimLightShort") + " (" + signHindered + "2)";
    } else if (illumination == 4) {
      modifier = modifier + 4;
      illuminationInfo = '<hr class="hr-chat">' + game.i18n.localize("CYPHERSYSTEM.TargetIsInDarkness") + " (" + signHindered + "4)";
    }

    if (mist == true || hiding == true || invisible == true) {
      visibilityInfo = '<hr class="hr-chat">';
    }

    if (mist == true) {
      modifier = modifier + 1;
      visibilityInfo = visibilityInfo + game.i18n.localize("CYPHERSYSTEM.TargetIsInMist") + " (" + signHindered + "1)";
    }

    if (hiding == true) {
      modifier = modifier + 1;
      visibilityInfo = visibilityInfo + ((mist == true) ? "<br>" : "") + game.i18n.localize("CYPHERSYSTEM.TargetIsHiding") + " (" + signHindered + "1)";
    }

    if (invisible == true) {
      modifier = modifier + 4;
      visibilityInfo = visibilityInfo + ((mist == true || hiding == true) ? "<br>" : "") + game.i18n.localize("CYPHERSYSTEM.TargetIsInvisible") + " (" + signHindered + "4)";
    }

    if (water == 1) {
      modifier = modifier + 1;
      waterInfo = '<hr class="hr-chat">' + game.i18n.localize("CYPHERSYSTEM.AttackerIsInDeepWater") + " (" + signHindered + "1)";
    } else if (water == 2) {
      modifier = modifier + 1;
      waterInfo = '<hr class="hr-chat">' + game.i18n.localize("CYPHERSYSTEM.AttackerIsUnderwaterStabbing") + " (" + signHindered + "1)";
    } else if (water == 3) {
      modifier = modifier + 2;
      waterInfo = '<hr class="hr-chat">' + game.i18n.localize("CYPHERSYSTEM.AttackerIsUnderwaterSlashing") + " (" + signHindered + "2)";
    }

    if (targetMoving == true || attackerMoving == true || attackerJostled == true) {
      movementInfo = '<hr class="hr-chat">';
    }

    if (targetMoving == true) {
      modifier = modifier + 1;
      movementInfo = movementInfo + game.i18n.localize("CYPHERSYSTEM.TargetIsMoving") + " (" + signHindered + "1)";
    }

    if (attackerMoving == true) {
      modifier = modifier + 1;
      movementInfo = movementInfo + ((targetMoving == true) ? "<br>" : "") + game.i18n.localize("CYPHERSYSTEM.AttackerIsMoving") + " (" + signHindered + "1)";
    }

    if (attackerJostled == true) {
      modifier = modifier + 1;
      movementInfo = movementInfo + ((targetMoving == true || attackerMoving == true) ? "<br>" : "") + game.i18n.localize("CYPHERSYSTEM.AttackerIsJostled") + " (" + signHindered + "1)";
    }

    if (gravity == true) {
      modifier = modifier + 1;
      gravityInfo = '<hr class="hr-chat">' + game.i18n.localize("CYPHERSYSTEM.AttackInGravity") + " (" + signHindered + "1)";
    }

    if (additionalOneValue != 0 || additionalTwoValue != 0 || additionalThreeValue != 0) {
      additionalInfo = '<hr class="hr-chat">';
    }

    additionalOneValue = additionalOneValue * stepModifierOne;
    additionalTwoValue = additionalTwoValue * stepModifierTwo;
    additionalThreeValue = additionalThreeValue * stepModifierThree;
    modifier = modifier + additionalOneValue;
    modifier = modifier + additionalTwoValue;
    modifier = modifier + additionalThreeValue;

    if (additionalOneValue != 0) {
      additionalInfo = additionalInfo + ((additionalOneName != "") ? additionalOneName : game.i18n.localize("CYPHERSYSTEM.AdditionalOne")) + ": ";
    }

    if ((additionalOneValue == 1 && pcRole == 0) || (additionalOneValue == -1 && pcRole == 1)) {
      additionalInfo = additionalInfo + game.i18n.localize("CYPHERSYSTEM.Hindered");
    } else if ((additionalOneValue == 1 && pcRole == 1) || (additionalOneValue == -1 && pcRole == 0)) {
      additionalInfo = additionalInfo + game.i18n.localize("CYPHERSYSTEM.Eased");
    } else if ((additionalOneValue >= 2 && pcRole == 0) || (additionalOneValue <= -2 && pcRole == 1)) {
      additionalInfo = additionalInfo + game.i18n.format("CYPHERSYSTEM.HinderedBySteps", {amount: Math.abs(additionalOneValue)});
    } else if ((additionalOneValue >= 2 && pcRole == 1) || (additionalOneValue <= -2 && pcRole == 0)) {
      additionalInfo = additionalInfo + game.i18n.format("CYPHERSYSTEM.EasedBySteps", {amount: Math.abs(additionalOneValue)});
    }

    if (additionalTwoValue != 0) {
      additionalInfo = additionalInfo + ((additionalOneValue != 0) ? "<br>" : "") + ((additionalTwoName != "") ? additionalTwoName : game.i18n.localize("CYPHERSYSTEM.AdditionalTwo")) + ": ";
    }

    if ((additionalTwoValue == 1 && pcRole == 0) || (additionalTwoValue == -1 && pcRole == 1)) {
      additionalInfo = additionalInfo + game.i18n.localize("CYPHERSYSTEM.Hindered");
    } else if ((additionalTwoValue == 1 && pcRole == 1) || (additionalTwoValue == -1 && pcRole == 0)) {
      additionalInfo = additionalInfo + game.i18n.localize("CYPHERSYSTEM.Eased");
    } else if ((additionalTwoValue >= 2 && pcRole == 0) || (additionalTwoValue <= -2 && pcRole == 1)) {
      additionalInfo = additionalInfo + game.i18n.format("CYPHERSYSTEM.HinderedBySteps", {amount: Math.abs(additionalTwoValue)});
    } else if ((additionalTwoValue >= 2 && pcRole == 1) || (additionalTwoValue <= -2 && pcRole == 0)) {
      additionalInfo = additionalInfo + game.i18n.format("CYPHERSYSTEM.EasedBySteps", {amount: Math.abs(additionalTwoValue)});
    }

    if (additionalThreeValue != 0) {
      additionalInfo = additionalInfo + ((additionalOneValue != 0 || additionalTwoValue != 0) ? "<br>" : "") + ((additionalThreeName != "") ? additionalThreeName : game.i18n.localize("CYPHERSYSTEM.AdditionalThree")) + ": ";
    }

    if ((additionalThreeValue == 1 && pcRole == 0) || (additionalThreeValue == -1 && pcRole == 1)) {
      additionalInfo = additionalInfo + game.i18n.localize("CYPHERSYSTEM.Hindered");
    } else if ((additionalThreeValue == 1 && pcRole == 1) || (additionalThreeValue == -1 && pcRole == 0)) {
      additionalInfo = additionalInfo + game.i18n.localize("CYPHERSYSTEM.Eased");
    } else if ((additionalThreeValue >= 2 && pcRole == 0) || (additionalThreeValue <= -2 && pcRole == 1)) {
      additionalInfo = additionalInfo + game.i18n.format("CYPHERSYSTEM.HinderedBySteps", {amount: Math.abs(additionalThreeValue)});
    } else if ((additionalThreeValue >= 2 && pcRole == 1) || (additionalThreeValue <= -2 && pcRole == 0)) {
      additionalInfo = additionalInfo + game.i18n.format("CYPHERSYSTEM.EasedBySteps", {amount: Math.abs(additionalThreeValue)});
    }

    if (pcRole == 1) {
      modifier = modifier * -1;
    }

    let finalDifficulty = parseInt(difficulty) + parseInt(modifier);

    if (finalDifficulty < 0) finalDifficulty = 0;

    let difficultyResult = finalDifficulty + " (" + (finalDifficulty * 3) + ")";

    resultInfo = "<hr class='hr-chat'><div class='difficulty-result'>" + game.i18n.format("CYPHERSYSTEM.ThisIsADifficultyTask", {difficulty: difficultyResult}) + "</div>";

    let noteForRollDialog = "";

    if (game.settings.get("cyphersystem", "persistentRollDifficulty") === 0) {
      noteForRollDialog = "<div class='note-roll-dialog'>" + game.i18n.localize("CYPHERSYSTEM.AppliesToNextRoll") + "</div>";
    }

    chatMessageText = basicInfo + coverInfo + positionInfo + surpriseInfo + rangeInfo + illuminationInfo + visibilityInfo + waterInfo + movementInfo + gravityInfo + additionalInfo + resultInfo + noteForRollDialog;

    let rng = Math.floor(Math.random() * 2);

    chatMessageVagueText = "<b>" + game.i18n.localize("CYPHERSYSTEM.TaskDifficulty") + '</b><hr class="hr-chat">';

    if (!description1) description1 = game.i18n.localize("CYPHERSYSTEM.VagueDifficultyRoutine");
    if (!description2) description2 = game.i18n.localize("CYPHERSYSTEM.VagueDifficultyTypical");
    if (!description3) description3 = game.i18n.localize("CYPHERSYSTEM.VagueDifficultyDifficult");
    if (!description4) description4 = game.i18n.localize("CYPHERSYSTEM.VagueDifficultyInitimidating");
    if (!description5) description5 = game.i18n.localize("CYPHERSYSTEM.VagueDifficultyHeroic");
    if (!description6) description6 = game.i18n.localize("CYPHERSYSTEM.VagueDifficultyImpossible");

    if (finalDifficulty == 0) {
      chatMessageVagueText = chatMessageVagueText + description1;
    } else if (finalDifficulty <= 2) {
      chatMessageVagueText = chatMessageVagueText + description2;
    } else if (finalDifficulty == 3) {
      chatMessageVagueText = chatMessageVagueText + ((rng == 0) ? description2 : description3);
    } else if (finalDifficulty == 4) {
      chatMessageVagueText = chatMessageVagueText + description3;
    } else if (finalDifficulty == 5) {
      chatMessageVagueText = chatMessageVagueText + ((rng == 0) ? description3 : description4);
    } else if (finalDifficulty == 6) {
      chatMessageVagueText = chatMessageVagueText + description4;
    } else if (finalDifficulty == 7) {
      chatMessageVagueText = chatMessageVagueText + ((rng == 0) ? description4 : description5);
    } else if (finalDifficulty == 8) {
      chatMessageVagueText = chatMessageVagueText + description5;
    } else if (finalDifficulty == 9) {
      chatMessageVagueText = chatMessageVagueText + ((rng == 0) ? description5 : description6);
    } else if (finalDifficulty >= 10) {
      chatMessageVagueText = chatMessageVagueText + description6;
    }

    if (chatMessage == 0) {
      ChatMessage.create({
        content: chatMessageText,
        flags: {"difficulty": finalDifficulty}
      });
      await game.settings.set("cyphersystem", "rollDifficulty", finalDifficulty);
    } else if (chatMessage == 1) {
      ChatMessage.create({
        content: chatMessageText,
        whisper: ChatMessage.getWhisperRecipients("GM")
      });
      await game.settings.set("cyphersystem", "rollDifficulty", -1);
    } else if (chatMessage == 2) {
      ChatMessage.create({
        content: chatMessageText,
        whisper: ChatMessage.getWhisperRecipients("GM")
      });
      ChatMessage.create({
        content: chatMessageVagueText
      });
      await game.settings.set("cyphersystem", "rollDifficulty", -1);
    }

    updateRollDifficultyForm();
  }
}

export function disasterModeMacro(token, mode, genre) {
  if (!token) {
    let numberOfGMIRangeTokens = 0;
    for (let t of game.scenes.current.tokens) {
      if (t.name == "GMI Range") {
        token = t.object;
        modeSelect(token, mode, genre);
        numberOfGMIRangeTokens++;
      }
    }
    if (numberOfGMIRangeTokens == 0) {
      return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.GMIRangeMissingOnScene"));
    }
  } else if (token.name == "GMI Range") {
    modeSelect(token, mode, genre);
  } else if (token.name != "GMI Range") {
    return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.GMIRangeMissingSelected"));
  }

  function modeSelect(token, mode, genre) {
    let newLevel;
    switch (mode) {
      case "increase":
        newLevel = token.actor.system.basic.level + 1;
        if (newLevel <= 20) changeGMIRange(token, newLevel, genre);
        break;
      case "decrease":
        newLevel = token.actor.system.basic.level - 1;
        if (newLevel >= 1) changeGMIRange(token, newLevel, genre);
        break;
      case "reset":
        changeGMIRange(token, 1, genre);
        break;
      default:
        break;
    }
  }

  async function changeGMIRange(token, level, genre) {
    genre = (!genre || genre == "modern") ? "" : genre + "-";
    await token.actor.update({"system.basic.level": level});
    await token.document.update({"img": "/systems/cyphersystem/icons/actors/disaster-mode/disastermode-" + genre + level + ".webp"});
  }
}

export async function lockStaticStatsMacro(actor, locked) {
  // Check for PC actor
  if (!actor || actor.type != "pc") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  locked = locked ?? !actor.getFlag("cyphersystem", "disabledStaticStats");

  actor.setFlag("cyphersystem", "disabledStaticStats", locked);
}

export async function migrateDataMacro() {
  game.settings.set("cyphersystem", "systemMigrationVersion", "1.0.0");
  ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ReloadFoundry"));
  await new Promise(r => setTimeout(r, 2000));
  location.reload();
}