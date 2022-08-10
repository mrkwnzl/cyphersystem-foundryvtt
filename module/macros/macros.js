import {
  toggleTagArchiveStatus,
  renameTag
} from "./macro-helper.js";
import {
  spendEffortString,
  calculateAttackDifficultyString,
  renameTagString
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
import {rollEngineMain} from "../utilities/roll-engine/roll-engine-main.js";
import {rollEngineDiceRoller} from "../utilities/roll-engine/roll-engine-dice-roller.js";

/* -------------------------------------------- */
/*  Roll Macros                                 */
/* -------------------------------------------- */

export function quickRollMacro(title) {
  rollEngineDiceRoller("", "", false, game.i18n.localize("CYPHERSYSTEM.StatRoll"), "", "", 0, 0, 0)
}

export function easedRollMacro() {
  let d = new Dialog({
    title: game.i18n.localize("CYPHERSYSTEM.EasedStatRoll"),
    content: `<div align="center"><label style="display: inline-block; text-align: right"><b>${game.i18n.localize("CYPHERSYSTEM.EasedBy")}: </b></label>
    <input style="width: 50px; margin-left: 5px; margin-bottom: 5px;text-align: center" type="text" value=1 /></div>`,
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Roll"),
        callback: (html) => rollEngineDiceRoller("", "", false, game.i18n.localize("CYPHERSYSTEM.StatRoll"), "", html.find('input').val(), 0, "")
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
    content: `<div align="center"><label style="display: inline-block; text-align: right"><b>${game.i18n.localize("CYPHERSYSTEM.HinderedBy")}: </b></label>
    <input style="width: 50px; margin-left: 5px; margin-bottom: 5px;text-align: center" type="text" value=1 /></div>`,
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Roll"),
        callback: (html) => rollEngineDiceRoller("", "", false, game.i18n.localize("CYPHERSYSTEM.StatRoll"), "", html.find('input').val() * -1, 0, "")
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

export async function diceRollMacro(dice, actor) {
  // Check whether the dice formula is "1dX" or "dX" to assure that both ways work
  if (dice.charAt(0) == "d") dice = "1" + dice;

  // Roll dice
  const roll = await new Roll(dice).evaluate({async: false});

  // Add reroll button
  let reRollButton = `<div style="text-align: right"><a class="reroll-dice-roll" title="${game.i18n.localize("CYPHERSYSTEM.Reroll")}" data-dice="${dice}" data-user="${game.user.id}"><i class="fas fa-redo"></i> <i class="fas fa-dice-d20" style="width: 12px"></a></div>`

  // Send chat message
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({actor: actor}),
    flavor: "<b>" + dice + " " + game.i18n.localize("CYPHERSYSTEM.Roll") + "</b>" + reRollButton
  });
}

export async function allInOneRollDialog(actor, pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE, teen, skipDialog, noRoll, itemID, bonus) {
  if (!actor) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  // Convert to roll engine
  let skillLevel = skill;
  let effortToEase = effort1;
  let effortOtherUses = effort2;
  let effortDamage = effort3;
  let poolPointCost = additionalCost;
  let difficultyModifier = additionalSteps;
  let easedOrHindered = stepModifier;
  let skipRoll = !noRoll;

  let initiativeRoll = (actor.items.get(itemID)) ? actor.items.get(itemID).system.isInitiative : false;

  // Apply to roll eninge
  rollEngineMain(actor, itemID, teen, skipDialog, skipRoll, initiativeRoll, title, pool, skillLevel, assets, effortToEase, effortOtherUses, damage, effortDamage, damagePerLOE, difficultyModifier, easedOrHindered, bonus, poolPointCost);
}

export async function itemRollMacro(actor, itemID, pool, skillLevel, assets, effort1, effort2, additionalSteps, additionalCost, damage, effort3, damagePerLOE, teen, stepModifier, noRoll, bonus) {
  // Find actor based on item ID
  const owner = game.actors.find(actor => actor.items.get(itemID));

  // Check for actor that owns the item
  if (!actor || actor.data.type != "PC") return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.MacroOnlyUsedBy", { name: owner.name }));

  // Determine the item based on item ID
  const item = actor.items.get(itemID);

  // Check whether the item still exists on the actor
  if (item == null) return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.MacroOnlyUsedBy", {name: owner.name}));

  // Check for combat-readiness
  let initiativeRoll = item.system.isInitiative;
  if (initiativeRoll) {
    if (!game.combat) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.NoCombatActive"));
    if (actor.getActiveTokens().length == 0) return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.NoTokensOnScene", {name: actor.name}));
  }

  // Check for AiO dialog
  let skipDialog = "";

  // Check for noRoll
  let skipRoll = (noRoll) ? true : false;

  // Prepare data
  // Prepare defaults in case none are set by users in the macro
  if (!skillLevel) {
    if (item.type == "skill" || item.type == "teen Skill") {
      skillLevel = item.system.skillLevel;
    } else if (item.type == "attack" || item.type == "teen Attack") {
      skillLevel = item.system.skillRating;
    } else {
      skillLevel = item.system.rollButton.skill;
    }
  }
  if (!assets) assets = item.system.rollButton.assets;
  if (!effort1) effort1 = item.system.rollButton.effort1;
  if (!effort2) effort2 = item.system.rollButton.effort2;
  if (!effort3) effort3 = item.system.rollButton.effort3;
  if (!additionalCost) {
    if (item.type == "ability" || item.type == "teen Ability") {
      let checkPlus = item.system.costPoints.slice(-1)
      if (checkPlus == "+") {
        let cost = item.system.costPoints.slice(0, -1);
        additionalCost = parseInt(cost);
      } else {
        let cost = item.system.costPoints;
        additionalCost = parseInt(cost);
      }
    } else {
      additionalCost = item.system.rollButton.additionalCost;
    }
  }
  if (!stepModifier && !additionalSteps) {
    if (item.type == "attack" || item.type == "teen Attack") {
      additionalSteps = item.system.modifiedBy;
      stepModifier = item.system.modified;
    } else {
      additionalSteps = item.system.rollButton.additionalSteps;
      stepModifier = item.system.rollButton.stepModifier;
    }
  } else if (!stepModifier && additionalSteps) {
    if (item.type == "attack" || item.type == "teen Attack") {
      stepModifier = item.system.modified;
    } else {
      stepModifier = (additionalSteps < 0) ? "hindered" : "eased";
    }
  }
  if (!damage) {
    if (item.type == "attack" || item.type == "teen Attack") {
      damage = item.system.damage;
    } else {
      damage = item.system.rollButton.damage;
    }
  }
  if (!pool) {
    if (item.type == "ability" || item.type == "teen Ability") {
      pool = item.system.costPool;
    } else {
      pool = item.system.rollButton.pool;
    }
  }
  if (!damagePerLOE) damagePerLOE = item.system.rollButton.damagePerLOE;
  if (!teen) teen = (actor.system.settings.gameMode.currentSheet == "Teen") ? true : false;
  if (!bonus) bonus = item.system.rollButton.bonus;

  // Create item type
  let itemType = "";
  if (item.type == "ability" && item.system.spell) {
    itemType = game.i18n.localize("CYPHERSYSTEM.Spell") + ": ";
  } else if ((item.type == "ability" || item.type == "teen Ability") && !item.system.spell) {
    itemType = game.i18n.localize("ITEM.TypeAbility") + ": ";
  } else if (item.type == "attack" || item.type == "teen Attack") {
    itemType = game.i18n.localize("ITEM.TypeAttack") + ": ";
  } else if (item.type == "skill" || item.type == "teen Skill") {
    itemType = game.i18n.localize("ITEM.TypeSkill") + ": ";
  }

  // Parse data to All-in-One Dialog
  rollEngineMain(actor, itemID, teen, skipDialog, skipRoll, initiativeRoll, itemType + item.name, pool, skillLevel, assets, effort1, effort2, damage, effort3, damagePerLOE, Math.abs(additionalSteps), stepModifier, bonus, additionalCost)
}

/* -------------------------------------------- */
/*  Utility Macros                              */
/* -------------------------------------------- */

export async function recoveryRollMacro(actor, dice, useRecovery) {
  // Check for dice
  if (!dice) {
    // Check for PC actor
    if (!actor || actor.type != "PC") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

    // Define dice
    dice = actor.system.recoveries.recoveryRoll;
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
  let reRollButton = `<div style="text-align: right"><a class="reroll-recovery" data-dice="${dice}" data-user="${game.user.id}" data-actor-id="${actor._id}"><i class="fas fa-redo"> <i class="fas fa-dice-d20"></i></a></div>`;

  // Send chat message
  roll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: "<b>" + game.i18n.format("CYPHERSYSTEM.UseARecoveryRoll", {name: actor.name, recoveryUsed: recoveryUsed}) + "</b>" + reRollButton,
    flags: {"itemID": "recovery-roll"}
  });
}

export function spendEffortMacro(actor) {
  // Check for PC actor
  if (!actor || actor.type != "PC") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

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
    // -- Determine impaired & debilitated status
    let impairedStatus = false;
    if (actor.system.settings.gameMode.currentSheet == "Teen") {
      if (actor.system.teen.damage.damageTrack == "Impaired" && actor.system.teen.damage.applyImpaired) impairedStatus = true;
      if (actor.system.teen.damage.damageTrack == "Debilitated" && actor.system.teen.damage.applyDebilitated) impairedStatus = true;
    } else if (actor.system.settings.gameMode.currentSheet == "Mask") {
      if (actor.system.damage.damageTrack == "Impaired" && actor.system.damage.applyImpaired) impairedStatus = true;
      if (actor.system.damage.damageTrack == "Debilitated" && actor.system.damage.applyDebilitated) impairedStatus = true;
    }

    // Set penalty when impaired
    let penalty = (impairedStatus) ? level : 0;

    // Determine point cost including penalty due to armor
    let cost = (pool == "Speed") ?
      (level * 2) + 1 + (level * actor.system.armor.speedCostTotal) + parseInt(penalty) :
      (level * 2) + 1 + parseInt(penalty);

    // Pay pool points
    payPoolPoints(actor, cost, pool);
  }
}

export function toggleDragRuler(token) {
  if (!game.modules.get("drag-ruler").active) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ActivateDragRuler"));
  if (!token) {
    return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.SelectAToken"))
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
    if (token.actor.type !== "Token" && token.actor.type !== "Vehicle") {
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
    let actor = game.actors.get(token.data.actorId);
    await token.document.update({
      [`flags.-=barbrawl`]: null,
      "bar1.attribute": null,
      "bar2.attribute": null
    });
    await token.document.update(barBrawlData(actor.type, actor));
  }
  location.reload();
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
      if (!checkToken(["PC"], game.i18n.localize("CYPHERSYSTEM.XP"))) return;
      statData = calculateStatData(token.actor.data.data.basic.xp);
      token.actor.update({ "data.basic.xp": statData });
      break;
    case "might":
      if (!checkToken(["PC"], game.i18n.localize("CYPHERSYSTEM.Might"))) return;
      statData = calculateStatData(token.actor.data.data.pools.might.value);
      token.actor.update({"data.pools.might.value": statData});
      break;
    case "speed":
      if (!checkToken(["PC"], game.i18n.localize("CYPHERSYSTEM.Speed"))) return;
      statData = calculateStatData(token.actor.data.data.pools.speed.value);
      token.actor.update({"data.pools.speed.value": statData});
      break;
    case "intellect":
      if (!checkToken(["PC"], game.i18n.localize("CYPHERSYSTEM.Intellect"))) return;
      statData = calculateStatData(token.actor.data.data.pools.intellect.value);
      token.actor.update({"data.pools.intellect.value": statData});
      break;
    case "health":
      if (!checkToken(["NPC", "Community", "Companion"], game.i18n.localize("CYPHERSYSTEM.Health"))) return;
      statData = calculateStatData(token.actor.data.data.health.value);
      token.actor.update({"data.health.value": statData});
      break;
    case "infrastructure":
      if (!checkToken(["Community"], game.i18n.localize("CYPHERSYSTEM.Infrastructure"))) return;
      statData = calculateStatData(token.actor.data.data.infrastructure.value);
      token.actor.update({"data.infrastructure.value": statData});
      break;
    case "quantity":
      if (!checkToken(["Token"], game.i18n.localize("CYPHERSYSTEM.Quantity"))) return;
      statData = calculateStatData(token.actor.data.data.quantity.value);
      token.actor.update({ "data.quantity.value": statData });
      break;
    default:
      return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.StatNotCompatible", {stat: stat}));
  }

  // Check whether a correct token is selected
  function checkToken(actorTypes, statString) {
    if (!token || !actorTypes.includes(token.actor.data.type)) {
      ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.PleaseSelectTokenStat", { stat: statString }));
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

export function proposeIntrusion(actor) {
  // Check if user is GM
  if (!game.user.isGM) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.IntrusionGMWarning"));

  // Check for actor
  if (!actor) {
    // Create list of PCs
    let selectOptions = "";
    for (let actor of game.actors.contents) {
      if (actor.type === "PC") selectOptions = selectOptions + `<option value=${actor._id}>${actor.name}</option>`;
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
          callback: () => { }
        }
      },
      default: "apply",
      close: () => { }
    });
    d.render(true);
  } else {
    if (actor.type != "PC") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));
    askForIntrusion(actor._id);
  }

  // Create chat message
  function askForIntrusion(actorId) {
    let actor = game.actors.get(actorId);

    ChatMessage.create({
      content: chatCardAskForIntrusion(actor, actorId)
    })
  }
}

export function changeSymbolForFractions() {
  let slash = game.settings.get("cyphersystem", "useSlashForFractions") ? false : true;
  game.settings.set("cyphersystem", "useSlashForFractions", slash);
}

export function toggleAlwaysShowDescriptionOnRoll() {
  let toggle = game.settings.get("cyphersystem", "alwaysShowDescriptionOnRoll") ? false : true;
  game.settings.set("cyphersystem", "alwaysShowDescriptionOnRoll", toggle);
  (toggle) ? ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.AlwaysShowDescriptionEnabledNotification")) : ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.AlwaysShowDescriptionDisabledNotification"));
}

export function toggleAttacksOnSheet(token) {
  let toggle = token.actor.data.data.settings.equipment.attacks ? false : true;
  token.actor.update({ "data.settings.equipment.attacks": toggle })
}

export function toggleArmorOnSheet(token) {
  let toggle = token.actor.data.data.settings.equipment.armor ? false : true;
  token.actor.update({ "data.settings.equipment.armor": toggle })
}

export async function translateToRecursion(actor, recursion, focus, mightModifier, speedModifier, intellectModifier, mightEdgeModifier, speedEdgeModifier, intellectEdgeModifier) {
  // Check for PC
  if (!actor || actor.type != "PC") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  // Define recursion name & workarble recursion variable
  let recursionName = recursion;
  recursion = "@" + recursion.toLowerCase();

  // Update Focus & Recursion
  await actor.update({
    "system.basic.focus": focus,
    "system.basic.additionalSentence": game.i18n.localize("CYPHERSYSTEM.OnRecursion") + " " + recursionName,
    "system.settings.additionalSentence.active": true
  });

  if (!mightModifier) mightModifier = 0;
  if (!speedModifier) speedModifier = 0;
  if (!intellectModifier) intellectModifier = 0;
  if (!mightEdgeModifier) mightEdgeModifier = 0;
  if (!speedEdgeModifier) speedEdgeModifier = 0;
  if (!intellectEdgeModifier) intellectEdgeModifier = 0;

  await applyStatChanges();
  await applyRecursion();

  async function applyRecursion() {
    let updates = [];
    let exceptions = ["@macro", "@actor", "@scene", "@item", "@rolltable", "@journalentry", "@cards", "@playlist", "@playlistsound", "@compendium", "@pdf"];
    let regExceptions = new RegExp(exceptions.join("|"), "gi");
    let regRecursion = new RegExp("(\\s|^|&nbsp;|<.+?>)" + recursion + "(\\s|$||&nbsp;<.+?>)", "gi");
    let regOtherRecursion = new RegExp("(\\s|^|&nbsp;|<.+?>)@([a-z]|[0-9])", "gi");
    for (let item of actor.items) {
      let name = (!item.name) ? "" : item.name.toLowerCase().replace(regExceptions, "");
      let description = (!item.system.description) ? "" : item.system.description.toLowerCase().replace(regExceptions, "");
      if (regRecursion.test(name) || regRecursion.test(description)) {
        updates.push({ _id: item.id, "data.archived": false });
      } else if (regOtherRecursion.test(name) || regOtherRecursion.test(description)) {
        updates.push({ _id: item.id, "data.archived": true });
      }
    }

    await actor.updateEmbeddedDocuments("Item", updates);

    // Notify about translation
    ui.notifications.notify(game.i18n.format("CYPHERSYSTEM.PCTranslatedToRecursion", {actor: actor.name, recursion: recursionName}))
  }

  async function applyStatChanges() {
    let pool = actor.system.pools;

    let oldMightModifier = (!actor.getFlag("cyphersystem", "recursionMightModifier")) ? 0 : actor.getFlag("cyphersystem", "recursionMightModifier");
    let oldSpeedModifier = (!actor.getFlag("cyphersystem", "recursionSpeedModifier")) ? 0 : actor.getFlag("cyphersystem", "recursionSpeedModifier");
    let oldIntellectModifier = (!actor.getFlag("cyphersystem", "recursionIntellectModifier")) ? 0 : actor.getFlag("cyphersystem", "recursionIntellectModifier");
    let oldMightEdgeModifier = (!actor.getFlag("cyphersystem", "recursionMightEdgeModifier")) ? 0 : actor.getFlag("cyphersystem", "recursionMightEdgeModifier");
    let oldSpeedEdgeModifier = (!actor.getFlag("cyphersystem", "recursionSpeedEdgeModifier")) ? 0 : actor.getFlag("cyphersystem", "recursionSpeedEdgeModifier");
    let oldIntellectEdgeModifier = (!actor.getFlag("cyphersystem", "recursionIntellectEdgeModifier")) ? 0 : actor.getFlag("cyphersystem", "recursionIntellectEdgeModifier");

    await actor.update({
      "system.pools.might.value": pool.might.value + mightModifier - oldMightModifier,
      "system.pools.might.max": pool.might.max + mightModifier - oldMightModifier,
      "system.pools.speed.value": pool.speed.value + speedModifier - oldSpeedModifier,
      "system.pools.speed.max": pool.speed.max + speedModifier - oldSpeedModifier,
      "system.pools.intellect.value": pool.intellect.value + intellectModifier - oldIntellectModifier,
      "system.pools.intellect.max": pool.intellect.max + intellectModifier - oldIntellectModifier,
      "system.pools.mightEdge": pool.mightEdge + mightEdgeModifier - oldMightEdgeModifier,
      "system.pools.speedEdge": pool.speedEdge + speedEdgeModifier - oldSpeedEdgeModifier,
      "system.pools.intellectEdge": pool.intellectEdge + intellectEdgeModifier - oldIntellectEdgeModifier,
      "flags.cyphersystem.recursion": recursion,
      "flags.cyphersystem.recursionMightModifier": mightModifier,
      "flags.cyphersystem.recursionSpeedModifier": speedModifier,
      "flags.cyphersystem.recursionIntellectModifier": intellectModifier,
      "flags.cyphersystem.recursionMightEdgeModifier": mightEdgeModifier,
      "flags.cyphersystem.recursionSpeedEdgeModifier": speedEdgeModifier,
      "flags.cyphersystem.recursionIntellectEdgeModifier": intellectEdgeModifier
    });
  }
}

export async function archiveStatusByTag(actor, archiveTags, unarchiveTags) {
  // Check for PC
  if (!actor || actor.type != "PC") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  if (!game.keyboard.isModifierActive('Alt')) {
    await unarchiveItemsWithTag(actor, unarchiveTags);
    await archiveItemsWithTag(actor, archiveTags);
  } else if (game.keyboard.isModifierActive('Alt')) {
    await unarchiveItemsWithTag(actor, archiveTags);
    await archiveItemsWithTag(actor, unarchiveTags);
  }
}

export async function unarchiveItemsWithTag(actor, tags) {
  toggleTagArchiveStatus(actor, tags, false);
}

export async function archiveItemsWithTag(actor, tags) {
  toggleTagArchiveStatus(actor, tags, true);
}

export async function recursionMacro(actor, item) {
  await translateToRecursion(actor, item.name, item.system.focus, item.system.mightModifier, item.system.speedModifier, item.system.intellectModifier, item.system.mightEdgeModifier, item.system.speedEdgeModifier, item.system.intellectEdgeModifier, item.id);
}

export async function tagMacro(actor, item) {
  if (item.system.active) {
    if (!game.keyboard.isModifierActive('Alt')) {
      await archiveItemsWithTag(actor, item.name)
      await item.update({"system.active": false});
      if (item.system.exclusive) {
        await changeStats(actor, 0, 0, 0, 0, 0, 0);
      }
    } else {
      await unarchiveItemsWithTag(actor, item.name)
    }
  } else if (!item.system.active) {
    if (!game.keyboard.isModifierActive('Alt')) {
      await unarchiveItemsWithTag(actor, item.name)
      await item.update({"system.active": true});
      if (item.system.exclusive) {
        await changeStats(actor, item.system.mightModifier, item.system.mightEdgeModifier, item.system.speedModifier, item.system.speedEdgeModifier, item.system.intellectModifier, item.system.intellectEdgeModifier);
        await disableActiveExclusiveTag(actor, item._id);
      }
    } else {
      await archiveItemsWithTag(actor, item.name)
    }
  }

  async function changeStats(actor, mightModifier, mightEdgeModifier, speedModifier, speedEdgeModifier, intellectModifier, intellectEdgeModifier) {
    let pool = actor.system.pools;

    let oldMightModifier = (!actor.getFlag("cyphersystem", "tagMightModifier")) ? 0 : actor.getFlag("cyphersystem", "tagMightModifier");
    let oldSpeedModifier = (!actor.getFlag("cyphersystem", "tagSpeedModifier")) ? 0 : actor.getFlag("cyphersystem", "tagSpeedModifier");
    let oldIntellectModifier = (!actor.getFlag("cyphersystem", "tagIntellectModifier")) ? 0 : actor.getFlag("cyphersystem", "tagIntellectModifier");
    let oldMightEdgeModifier = (!actor.getFlag("cyphersystem", "tagMightEdgeModifier")) ? 0 : actor.getFlag("cyphersystem", "tagMightEdgeModifier");
    let oldSpeedEdgeModifier = (!actor.getFlag("cyphersystem", "tagSpeedEdgeModifier")) ? 0 : actor.getFlag("cyphersystem", "tagSpeedEdgeModifier");
    let oldIntellectEdgeModifier = (!actor.getFlag("cyphersystem", "tagIntellectEdgeModifier")) ? 0 : actor.getFlag("cyphersystem", "tagIntellectEdgeModifier");

    await actor.update({
      "system.pools.might.value": pool.might.value + mightModifier - oldMightModifier,
      "system.pools.might.max": pool.might.max + mightModifier - oldMightModifier,
      "system.pools.speed.value": pool.speed.value + speedModifier - oldSpeedModifier,
      "system.pools.speed.max": pool.speed.max + speedModifier - oldSpeedModifier,
      "system.pools.intellect.value": pool.intellect.value + intellectModifier - oldIntellectModifier,
      "system.pools.intellect.max": pool.intellect.max + intellectModifier - oldIntellectModifier,
      "system.pools.mightEdge": pool.mightEdge + mightEdgeModifier - oldMightEdgeModifier,
      "system.pools.speedEdge": pool.speedEdge + speedEdgeModifier - oldSpeedEdgeModifier,
      "system.pools.intellectEdge": pool.intellectEdge + intellectEdgeModifier - oldIntellectEdgeModifier,
      "flags.cyphersystem.tagMightModifier": mightModifier,
      "flags.cyphersystem.tagSpeedModifier": speedModifier,
      "flags.cyphersystem.tagIntellectModifier": intellectModifier,
      "flags.cyphersystem.tagMightEdgeModifier": mightEdgeModifier,
      "flags.cyphersystem.tagSpeedEdgeModifier": speedEdgeModifier,
      "flags.cyphersystem.tagIntellectEdgeModifier": intellectEdgeModifier
    });
  }

  async function disableActiveExclusiveTag(actor, itemID) {
    for (let item of actor.items) {
      if (item.type == "tag" && item.system.exclusive && item.system.active) {
        if (item._id == itemID) return;
        await archiveItemsWithTag(actor, item.name.split(','));
        await item.update({ "data.active": false });
      }
    }
  }

  await actor.updateEmbeddedDocuments("Item", [item]);
}

export function renameTagMacro(actor, currentTag, newTag) {
  // Check for PC actor
  if (!actor || actor.type != "PC") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  // Create dialog
  let d = new Dialog({
    title: game.i18n.localize("CYPHERSYSTEM.RenameTag"),
    content: renameTagString(currentTag, newTag),
    buttons: {
      roll: {
        icon: '<i class="fas fa-check"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Apply"),
        callback: (html) => applyMacro(actor, html.find('#currentTag').val(), html.find('#newTag').val())
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

  function applyMacro(actor, currentTag, newTag) {
    if (currentTag == "") {
      renameTagMacro(actor, currentTag, newTag);
      return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.SpecifyCurrentTag"));
    }
    if (!(currentTag.startsWith("#") || currentTag.startsWith("@")) || !(newTag.startsWith("#") || newTag.startsWith("@") || newTag == "")) {
      renameTagMacro(actor, currentTag, newTag);
      return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.TagsStartWith#"));
    }
    renameTag(actor, currentTag, newTag)
  }
}

export async function calculateAttackDifficulty(difficulty, pcRole, chatMessage, cover, positionProne, positionHighGround, surprise, range, illumination, mist, hiding, invisible, water, targetMoving, attackerMoving, attackerJostled, gravity, additionalOneValue, additionalOneName, additionalTwoValue, additionalTwoName, additionalThreeValue, additionalThreeName, description1, description2, description3, description4, description5, description6, skipDialog) {

  // Create All-in-One dialog
  let d = new Dialog({
    title: game.i18n.localize("CYPHERSYSTEM.CalculateAttackDifficulty"),
    content: calculateAttackDifficultyString(difficulty, pcRole, chatMessage, cover, positionProne, positionHighGround, surprise, range, illumination, mist, hiding, invisible, water, targetMoving, attackerMoving, attackerJostled, gravity, additionalOneValue, additionalOneName, additionalTwoValue, additionalTwoName, additionalThreeValue, additionalThreeName),
    buttons: {
      calculate: {
        icon: '<i class="fas fa-calculator"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Calculate"),
        callback: (html) => {
          additionalOneValue = (html.find('#additionalOne').val() != "") ? html.find('#additionalOne').val() : html.find('#additionalOne').attr('placeholder');
          additionalTwoValue = (html.find('#additionalTwo').val() != "") ? html.find('#additionalTwo').val() : html.find('#additionalTwo').attr('placeholder');
          additionalThreeValue = (html.find('#additionalThree').val() != "") ? html.find('#additionalThree').val() : html.find('#additionalThree').attr('placeholder');
          calculate(html.find('#difficulty').val(), html.find('#pcRole').val(), html.find('#chatMessage').val(), html.find('#cover').prop('checked'), html.find('#positionProne').val(), html.find('#positionHighGround').prop('checked'), html.find('#surprise').val(), html.find('#range').val(), html.find('#illumination').val(), html.find('#mist').prop('checked'), html.find('#hiding').prop('checked'), html.find('#invisible').prop('checked'), html.find('#water').val(), html.find('#targetMoving').prop('checked'), html.find('#attackerMoving').prop('checked'), html.find('#attackerJostled').prop('checked'), html.find('#gravity').prop('checked'), additionalOneValue, html.find('#additionalOneName').val(), additionalTwoValue, html.find('#additionalTwoName').val(), additionalThreeValue, html.find('#additionalThreeName').val(), html.find('#stepModifierOne').val(), html.find('#stepModifierTwo').val(), html.find('#stepModifierThree').val(), description1, description2, description3, description4, description5, description6);
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
        callback: () => { }
      }
    },
    default: "calculate",
    close: () => { }
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
    calculate(difficulty, pcRole, chatMessage, cover, positionProne, positionHighGround, surprise, range, illumination, mist, hiding, invisible, water, targetMoving, attackerMoving, attackerJostled, gravity, Math.abs(additionalOneValue), additionalOneName, Math.abs(additionalTwoValue), additionalTwoName, Math.abs(additionalThreeValue), additionalThreeName, stepModifierOne, stepModifierTwo, stepModifierThree, description1, description2, description3, description4, description5, description6)
  }

  function calculate(difficulty, pcRole, chatMessage, cover, positionProne, positionHighGround, surprise, range, illumination, mist, hiding, invisible, water, targetMoving, attackerMoving, attackerJostled, gravity, additionalOneValue, additionalOneName, additionalTwoValue, additionalTwoName, additionalThreeValue, additionalThreeName, stepModifierOne, stepModifierTwo, stepModifierThree, description1, description2, description3, description4, description5, description6) {
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

    if (pcRole == 0) {
      pcRoleInfo = game.i18n.localize("CYPHERSYSTEM.PCIsAttacker");
    } else {
      pcRoleInfo = game.i18n.localize("CYPHERSYSTEM.PCIsTarget");
    }

    basicInfo = "<b>" + game.i18n.localize("CYPHERSYSTEM.TaskDifficulty") + '</b><hr class="hr-chat">' + game.i18n.localize("CYPHERSYSTEM.BaseDifficulty") + ": " + difficulty + "<br>" + pcRoleInfo;

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
      additionalInfo = additionalInfo + game.i18n.format("CYPHERSYSTEM.HinderedBySteps", {amount: Math.abs(additionalOneValue)})
    } else if ((additionalOneValue >= 2 && pcRole == 1) || (additionalOneValue <= -2 && pcRole == 0)) {
      additionalInfo = additionalInfo + game.i18n.format("CYPHERSYSTEM.EasedBySteps", {amount: Math.abs(additionalOneValue)})
    }

    if (additionalTwoValue != 0) {
      additionalInfo = additionalInfo + ((additionalOneValue != 0) ? "<br>" : "") + ((additionalTwoName != "") ? additionalTwoName : game.i18n.localize("CYPHERSYSTEM.AdditionalTwo")) + ": ";
    }

    if ((additionalTwoValue == 1 && pcRole == 0) || (additionalTwoValue == -1 && pcRole == 1)) {
      additionalInfo = additionalInfo + game.i18n.localize("CYPHERSYSTEM.Hindered");
    } else if ((additionalTwoValue == 1 && pcRole == 1) || (additionalTwoValue == -1 && pcRole == 0)) {
      additionalInfo = additionalInfo + game.i18n.localize("CYPHERSYSTEM.Eased");
    } else if ((additionalTwoValue >= 2 && pcRole == 0) || (additionalTwoValue <= -2 && pcRole == 1)) {
      additionalInfo = additionalInfo + game.i18n.format("CYPHERSYSTEM.HinderedBySteps", {amount: Math.abs(additionalTwoValue)})
    } else if ((additionalTwoValue >= 2 && pcRole == 1) || (additionalTwoValue <= -2 && pcRole == 0)) {
      additionalInfo = additionalInfo + game.i18n.format("CYPHERSYSTEM.EasedBySteps", {amount: Math.abs(additionalTwoValue)})
    }

    if (additionalThreeValue != 0) {
      additionalInfo = additionalInfo + ((additionalOneValue != 0 || additionalTwoValue != 0) ? "<br>" : "") + ((additionalThreeName != "") ? additionalThreeName : game.i18n.localize("CYPHERSYSTEM.AdditionalThree")) + ": ";
    }

    if ((additionalThreeValue == 1 && pcRole == 0) || (additionalThreeValue == -1 && pcRole == 1)) {
      additionalInfo = additionalInfo + game.i18n.localize("CYPHERSYSTEM.Hindered");
    } else if ((additionalThreeValue == 1 && pcRole == 1) || (additionalThreeValue == -1 && pcRole == 0)) {
      additionalInfo = additionalInfo + game.i18n.localize("CYPHERSYSTEM.Eased");
    } else if ((additionalThreeValue >= 2 && pcRole == 0) || (additionalThreeValue <= -2 && pcRole == 1)) {
      additionalInfo = additionalInfo + game.i18n.format("CYPHERSYSTEM.HinderedBySteps", {amount: Math.abs(additionalThreeValue)})
    } else if ((additionalThreeValue >= 2 && pcRole == 1) || (additionalThreeValue <= -2 && pcRole == 0)) {
      additionalInfo = additionalInfo + game.i18n.format("CYPHERSYSTEM.EasedBySteps", {amount: Math.abs(additionalThreeValue)})
    }

    if (pcRole == 1) {
      modifier = modifier * -1;
    }

    let finalDifficulty = parseInt(difficulty) + parseInt(modifier);

    if (finalDifficulty < 0) finalDifficulty = 0;

    let difficultyResult = finalDifficulty + " (" + (finalDifficulty * 3) + ")";

    resultInfo = "<hr class='hr-chat'>" + game.i18n.format("CYPHERSYSTEM.FinalDifficulty", { difficulty: difficultyResult });

    chatMessageText = basicInfo + coverInfo + positionInfo + surpriseInfo + rangeInfo + illuminationInfo + visibilityInfo + waterInfo + movementInfo + gravityInfo + additionalInfo + resultInfo;

    let rng = Math.floor(Math.random() * 2);

    chatMessageVagueText = "<b>" + game.i18n.localize("CYPHERSYSTEM.TaskDifficulty") + '</b><hr class="hr-chat">'

    if (description1 == "") description1 = game.i18n.localize("CYPHERSYSTEM.VagueDifficultyRoutine");
    if (description2 == "") description2 = game.i18n.localize("CYPHERSYSTEM.VagueDifficultyTypical");
    if (description3 == "") description3 = game.i18n.localize("CYPHERSYSTEM.VagueDifficultyDifficult")
    if (description4 == "") description4 = game.i18n.localize("CYPHERSYSTEM.VagueDifficultyInitimidating")
    if (description5 == "") description5 = game.i18n.localize("CYPHERSYSTEM.VagueDifficultyHeroic")
    if (description6 == "") description6 = game.i18n.localize("CYPHERSYSTEM.VagueDifficultyImpossible");

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
        content: chatMessageText
      });
    } else if (chatMessage == 1) {
      ChatMessage.create({
        content: chatMessageText,
        whisper: ChatMessage.getWhisperRecipients("GM")
      });
    } else if (chatMessage == 2) {
      ChatMessage.create({
        content: chatMessageText,
        whisper: ChatMessage.getWhisperRecipients("GM")
      });
      ChatMessage.create({
        content: chatMessageVagueText
      });
    }
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
    modeSelect(token, mode, genre)
  } else if (token.name != "GMI Range") {
    return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.GMIRangeMissingSelected"));
  };

  function modeSelect(token, mode, genre) {
    let newLevel;
    switch (mode) {
      case "increase":
        newLevel = token.actor.system.level + 1
        if (newLevel <= 20) changeGMIRange(token, newLevel, genre);
        break;
      case "decrease":
        newLevel = token.actor.system.level - 1
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
    await token.actor.update({ "data.level": level });
    await token.document.update({ "img": "/systems/cyphersystem/icons/actors/disaster-mode/disastermode-" + genre + level + ".webp" });
  }
}

export async function lockStaticStatsMacro(actor) {
  // Check for PC actor
  if (!actor || actor.type != "PC") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  actor.setFlag("cyphersystem", "disabledStaticStats", !actor.getFlag("cyphersystem", "disabledStaticStats"));
}