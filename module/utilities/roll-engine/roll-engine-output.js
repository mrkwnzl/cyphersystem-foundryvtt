import {updateRollDifficultyForm} from "../../forms/roll-difficulty-sheet.js";
import {
  addCharacterToCombatTracker,
  setInitiativeForCharacter
} from "../actor-utilities.js";
import {resetDifficulty, useEffectiveDifficulty} from "./roll-engine-main.js";

export async function rollEngineOutput(data) {
  let actor = fromUuidSync(data.actorUuid);

  // Get show details setting
  let showDetails = game.settings.get("cyphersystem", "showRollDetails");

  // Title and description
  let title = (data.title) ? `<b>` + data.title + `</b><br>` : `<b>` + game.i18n.localize("CYPHERSYSTEM.StatRoll") + `</b>`;
  let itemDescription = "";
  let itemDescriptionInfo = "";
  if (actor.items.get(data.itemID)) {
    let item = actor.items.get(data.itemID);

    itemDescription = (item.system.description) ? `<img class="description-image-chat" src="${item.img}" width="50" height="50"/>` + await TextEditor.enrichHTML(item.system.description, {async: true, relativeTo: item}) : `<img class="description-image-chat" src="${item.img}" width="50" height="50"/>`;

    let styleDescriptionHidden = `<div style="display: none" class="chat-card-item-description">`;
    let styleDescriptionShow = `<div class="chat-card-item-description expanded">`;
    let styleDescription = (game.settings.get("cyphersystem", "alwaysShowDescriptionOnRoll")) ? styleDescriptionShow : styleDescriptionHidden;

    itemDescriptionInfo = styleDescription + `<div style="min-height: 50px">` + itemDescription + `</div></div>`;

    title = `<a class="chat-description"><b>` + title + `</a></b>`;
  }

  // --- Difficulty block

  // Base difficulty
  let baseDifficultyInfo = (useEffectiveDifficulty(data.baseDifficulty) == false && data.baseDifficulty >= 0) ? game.i18n.localize("CYPHERSYSTEM.BaseDifficulty") + ": " + data.baseDifficulty + "<br>" : "";

  // Steps eased/hindered
  let modifiedBy = "";
  if (data.difficultyModifierTotal != 0) {
    if (data.difficultyModifierTotal > 1) {
      modifiedBy = game.i18n.format("CYPHERSYSTEM.EasedBySteps", {amount: data.difficultyModifierTotal});
    } else if (data.difficultyModifierTotal == 1) {
      modifiedBy = game.i18n.localize("CYPHERSYSTEM.Eased");
    } else if (data.difficultyModifierTotal == -1) {
      modifiedBy = game.i18n.localize("CYPHERSYSTEM.Hindered");
    } else if (data.difficultyModifierTotal < -1) {
      modifiedBy = game.i18n.format("CYPHERSYSTEM.HinderedBySteps", {amount: Math.abs(data.difficultyModifierTotal)});
    }
  }

  // Final task difficulty
  let taskDifficulty = "";
  if (data.baseDifficulty >= 0 && data.finalDifficulty >= 0) {
    taskDifficulty = game.i18n.localize("CYPHERSYSTEM.Difficulty") + ": " + data.finalDifficulty + " (" + Math.max(0, data.finalDifficulty * 3) + ")";
  } else if (modifiedBy) {
    taskDifficulty = modifiedBy;
  };

  // Skill information
  let skillRating = {
    "-1": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Inability")}<br>`,
    "0": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Practiced")}<br>`,
    "1": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Trained")}<br>`,
    "2": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Specialized")}<br>`
  };
  let skillInfo = (skillRating[data.skillLevel] || skillRating[0]);

  // Asset information
  let assetsInfo = `${game.i18n.localize("CYPHERSYSTEM.Assets")}: ${data.assets}<br>`;

  // effortToEase information
  let effortToEaseInfo = (data.effortToEase != 1) ?
    `${game.i18n.localize("CYPHERSYSTEM.Effort")}: ${data.effortToEase} ${game.i18n.localize("CYPHERSYSTEM.levels")}<br>` :
    `${game.i18n.localize("CYPHERSYSTEM.Effort")}: ${data.effortToEase} ${game.i18n.localize("CYPHERSYSTEM.level")}<br>`;

  // Additional step(s) information
  let difficultyInfo = "";
  if (data.easedOrHindered != "hindered") {
    if (data.difficultyModifier > 1) {
      difficultyInfo = `${game.i18n.format("CYPHERSYSTEM.EasedByExtraSteps", {amount: data.difficultyModifier})}<br>`;
    } else if (data.difficultyModifier == 1) {
      difficultyInfo = `${game.i18n.localize("CYPHERSYSTEM.EasedByExtraStep")}<br>`;
    }
  } else {
    if (data.difficultyModifier < -1) {
      difficultyInfo = `${game.i18n.format("CYPHERSYSTEM.HinderedByExtraSteps", {amount: Math.abs(data.difficultyModifier)})}<br>`;
    } else if (data.difficultyModifier == -1) {
      difficultyInfo = `${game.i18n.localize("CYPHERSYSTEM.HinderedByExtraStep")}<br>`;
    }
  }

  // Details style
  let styleDifficultyDetailsHidden = `<div class="roll-result-difficulty-details" style="display: none">`;
  let styleDifficultyDetailsExpanded = `<div class="roll-result-difficulty-details expanded">`;
  let styleDifficultyDetails = (showDetails) ? styleDifficultyDetailsExpanded : styleDifficultyDetailsHidden;

  let difficultyDetailsInfo = styleDifficultyDetails + baseDifficultyInfo + skillInfo + assetsInfo + effortToEaseInfo + difficultyInfo + `</div>`;

  // Create block
  let difficultyBlock = `<div class="roll-result-box"><b><a class="roll-result-difficulty">` + taskDifficulty + `</a></b><br>` + difficultyDetailsInfo + `</div>`;

  if (data.skipRoll || taskDifficulty == "") {
    difficultyBlock = "";
  }

  // --- Damage block

  // Base damage
  let baseDamageInfo = (data.damage == 1) ?
    game.i18n.format("CYPHERSYSTEM.BaseDamagePoint", {baseDamage: data.damage}) + "<br>" :
    game.i18n.format("CYPHERSYSTEM.BaseDamagePoints", {baseDamage: data.damage}) + "<br>";

  // Effect damage
  let effectDamageInfo = (data.damageEffect == 1) ?
    game.i18n.format("CYPHERSYSTEM.EffectDamagePoint", {baseDamage: data.damageEffect}) + "<br>" :
    game.i18n.format("CYPHERSYSTEM.EffectDamagePoints", {baseDamage: data.damageEffect}) + "<br>";

  // Damage information
  let damageInfo = "";
  if (data.totalDamage == 1 && data.damageEffect == 0) {
    damageInfo = game.i18n.format("CYPHERSYSTEM.DamageInflictedPoint", {totalDamage: data.totalDamage});
  } else if (data.totalDamage >= 2 && data.damageEffect == 0) {
    damageInfo = game.i18n.format("CYPHERSYSTEM.DamageInflictedPoints", {totalDamage: data.totalDamage});
  } else if (data.totalDamage > 0 && data.damageEffect >= 1 && data.damageEffect <= 2) {
    damageInfo = game.i18n.format("CYPHERSYSTEM.DamageInflictedPoints", {totalDamage: data.damageWithEffect});
  } else if (data.totalDamage > 0 && data.damageEffect >= 3) {
    damageInfo = game.i18n.format("CYPHERSYSTEM.DamageWithEffectInfo", {totalDamage: data.totalDamage, damageWithEffect: data.damageWithEffect});
  }

  // Effort information
  let effortDamageInfo = "";
  if (data.effortDamage == 1) {
    effortDamageInfo = `${game.i18n.localize("CYPHERSYSTEM.Effort")}: ${data.damageEffort} ${game.i18n.localize("CYPHERSYSTEM.Point")}<br>`;
  } else {
    effortDamageInfo = `${game.i18n.localize("CYPHERSYSTEM.Effort")}: ${data.damageEffort} ${game.i18n.localize("CYPHERSYSTEM.Points")}<br>`;
  }

  // Details style
  let styleDamageDetailsHidden = `<div class="roll-result-damage-details" style="display: none">`;
  let styleDamageDetailsExpanded = `<div class="roll-result-damage-details expanded">`;
  let styleDamageDetails = (showDetails) ? styleDamageDetailsExpanded : styleDamageDetailsHidden;

  let damageDetailsInfo = styleDamageDetails + baseDamageInfo + effectDamageInfo + effortDamageInfo + `</div>`;

  // Create block
  let damageInfoBlock = "";
  if (damageInfo != "") {
    damageInfoBlock = `<div class="roll-result-box"><b><a class="roll-result-damage">` + damageInfo + `</a></b><br>` + damageDetailsInfo + `</div>`;
  }

  // --- Cost info block

  // Cost information
  let poolCostInfo = {
    "Might": function () {
      return (data.poolPointCost != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.BaseCost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.Points")}` :
        `${game.i18n.localize("CYPHERSYSTEM.BaseCost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.Point")}`;
    },
    "Speed": function () {
      return (data.poolPointCost != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.BaseCost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.Points")}` :
        `${game.i18n.localize("CYPHERSYSTEM.BaseCost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.Point")}`;
    },
    "Intellect": function () {
      return (data.poolPointCost != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.BaseCost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.Points")}` :
        `${game.i18n.localize("CYPHERSYSTEM.BaseCost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.Point")}`;
    },
    "Pool": function () {
      return (data.poolPointCost != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.BaseCost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.Points")}` :
        `${game.i18n.localize("CYPHERSYSTEM.BaseCost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.Point")}`;
    },
    "XP": function () {
      return `${game.i18n.localize("CYPHERSYSTEM.BaseCost")}: ${data.poolPointCost}  ${game.i18n.localize("CYPHERSYSTEM.XP")}`;
    }
  };

  let costTotalInfo = {
    "Might": function () {
      return (data.costTotal != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.costTotal} ${game.i18n.localize("CYPHERSYSTEM.MightPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.costTotal} ${game.i18n.localize("CYPHERSYSTEM.MightPoint")}`;
    },
    "Speed": function () {
      return (data.costTotal != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.costTotal} ${game.i18n.localize("CYPHERSYSTEM.SpeedPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.costTotal} ${game.i18n.localize("CYPHERSYSTEM.SpeedPoint")}`;
    },
    "Intellect": function () {
      return (data.costTotal != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.costTotal} ${game.i18n.localize("CYPHERSYSTEM.IntellectPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.costTotal} ${game.i18n.localize("CYPHERSYSTEM.IntellectPoint")}`;
    },
    "Pool": function () {
      return (data.costTotal != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.costTotal} ${game.i18n.localize("CYPHERSYSTEM.AnyPoolPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.costTotal} ${game.i18n.localize("CYPHERSYSTEM.AnyPoolPoint")}`;
    },
    "XP": function () {
      return `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.costTotal} ${game.i18n.localize("CYPHERSYSTEM.XP")}`;
    }
  };

  // Effort info
  let effortCost = data.costCalculated - data.poolPointCost;
  let effortInfo = (data.costCalculated == 1) ?
    `${game.i18n.localize("CYPHERSYSTEM.Effort")}: ${effortCost} ${game.i18n.localize("CYPHERSYSTEM.Point")}<br>` :
    `${game.i18n.localize("CYPHERSYSTEM.Effort")}: ${effortCost} ${game.i18n.localize("CYPHERSYSTEM.Points")}<br>`;

  // Edge info
  let edgeInfo = `${game.i18n.localize("CYPHERSYSTEM.Edge")}: ${data.edge}`;

  // Details style
  let styleCostDetailsHidden = `<div class="roll-result-cost-details" style="display: none">`;
  let styleCostDetailsExpanded = `<div class="roll-result-cost-details expanded">`;
  let styleCostDetails = (showDetails) ? styleCostDetailsExpanded : styleCostDetailsHidden;

  let poolCostInfoString = poolCostInfo[data.pool]() + "<br>";
  let costTotalInfoString = costTotalInfo[data.pool]();

  let costDetailsInfo = styleCostDetails + poolCostInfoString + effortInfo + edgeInfo + `</div>`;

  let costInfoBlock = "";
  if (data.poolPointCost != 0 || data.costCalculated != 0) {
    costInfoBlock = `<div class="roll-result-box"><b><a class="roll-result-cost">` + costTotalInfoString + `</a></b>` + costDetailsInfo + `</div>`;
  }

  // --- Roll result block

  // Determine result with bonus/penalty
  let operator = (data.bonus < 0) ? "-" : "+";
  let resultInfo = (data.bonus != 0 && data.bonus != "") ? "<span class='roll-result'>" + game.i18n.localize("CYPHERSYSTEM.Result") + ": " + data.rollTotal + " [" + data.roll.total + operator + Math.abs(data.bonus) + "]" + "</span><br>" : "";

  // Determine special effect
  let effect = "";
  let boxColor = "";

  if (data.roll.total == 17 && !data.impairedStatus && data.totalDamage >= 1) {
    effect = "<br><span class='roll-effect effect1718'>" + game.i18n.localize("CYPHERSYSTEM.OneDamage") + "</span>";
    boxColor = "box1718";
  } else if (data.roll.total == 18 && !data.impairedStatus && data.totalDamage >= 1) {
    effect = "<br><span class='roll-effect effect1718'>" + game.i18n.localize("CYPHERSYSTEM.TwoDamage") + "</span>";
    boxColor = "box1718";
  } else if (data.roll.total == 19 && !data.impairedStatus && data.totalDamage >= 1) {
    effect = "<br><span class='roll-effect effect1920'>" + game.i18n.localize("CYPHERSYSTEM.DamageOrMinorEffectRoll") + "</span>";
    boxColor = "box1920";
  } else if (data.roll.total == 19 && !data.impairedStatus && data.totalDamage <= 0) {
    effect = "<br><span class='roll-effect effect1920'>" + game.i18n.localize("CYPHERSYSTEM.MinorEffectRoll") + "</span>";
    boxColor = "box1920";
  } else if (data.roll.total == 20 && !data.impairedStatus && data.totalDamage >= 1) {
    effect = "<br><span class='roll-effect effect1920'>" + game.i18n.localize("CYPHERSYSTEM.DamageOrMajorEffectRoll") + "</span>";
    boxColor = "box1920";
  } else if (data.roll.total == 20 && !data.impairedStatus && data.totalDamage <= 0) {
    effect = "<br><span class='roll-effect effect1920'>" + game.i18n.localize("CYPHERSYSTEM.MajorEffectRoll") + "</span>";
    boxColor = "box1920";
  } else if ([17, 18, 19, 20].includes(data.roll.total) && data.impairedStatus && data.totalDamage >= 1) {
    effect = "<br><span class='roll-effect effect1718'>" + game.i18n.localize("CYPHERSYSTEM.OneDamage") + "</span>";
    boxColor = "box1718";
  } else if (data.roll.total == 1) {
    boxColor = "box1";
  }

  let gmiEffect = "";
  if (data.roll.total <= data.gmiRange) {
    gmiEffect = "<br><span class='roll-effect intrusion'>" + game.i18n.localize("CYPHERSYSTEM.GMIntrusion") + "</span>";
    boxColor = "box1";
  }

  // Create multi roll
  let multiRollInfo = (actor.getFlag("cyphersystem", "multiRoll.active")) ? "<div class='multi-roll-active'>" + game.i18n.localize("CYPHERSYSTEM.MultiRoll") + "</div>" : "";

  // Create reroll info
  let rerollInfo = (data.reroll) ? "<div>" + game.i18n.localize("CYPHERSYSTEM.Reroll") + "</div>" : "";

  // Create beatenDifficulty
  let beatenDifficulty = "<span class='roll-difficulty'>" + game.i18n.localize("CYPHERSYSTEM.RollBeatDifficulty") + " " + data.difficultyResult + "</span>";

  // Add initiative result
  let initiativeResult = data.roll.total + (data.difficultyModifierTotal * 3) + data.bonus;
  let initiativeInfo = (data.initiativeRoll) ? "<br><span class='roll-initiative'>" + game.i18n.localize("CYPHERSYSTEM.Initiative") + ": " + initiativeResult + "</span > " : "";

  // Create success info
  let successInfo = "";
  if (data.baseDifficulty >= 0) {
    let difficultyBeaten = (useEffectiveDifficulty(data.baseDifficulty)) ? data.difficulty + data.difficultyModifierTotal : data.difficulty;
    successInfo = (difficultyBeaten >= data.finalDifficulty) ? "<br><span class='roll-effect effect1920'>" + game.i18n.localize("CYPHERSYSTEM.Success") + "</span>" : "<br><span class='roll-effect intrusion'>" + game.i18n.localize("CYPHERSYSTEM.Failure") + "</span>";
  };

  // Create info block
  let info = difficultyBlock + costInfoBlock + damageInfoBlock;

  // Add reroll button
  let actorUuid = (actor) ? actor.uuid : "";
  data.baseDifficulty = (data.baseDifficulty >= 0) ? parseInt(data.baseDifficulty) : data.baseDifficulty;
  let dataString = JSON.stringify(data);
  let reRollButton = ` <a class='reroll-stat' title='${game.i18n.localize("CYPHERSYSTEM.Reroll")}' data-user='${game.user.id}' data-data='${dataString}'><i class="fas fa-dice-d20"></i></a>`;

  // Add regain points button
  let regainPointsButton = "";
  if (data.costTotal > 0 && data.roll.total == 20 && ["Might", "Speed", "Intellect"].includes(data.pool)) {
    regainPointsButton = `<a class='regain-points' title='${game.i18n.localize("CYPHERSYSTEM.RegainPoints")}' data-user='${game.user.id}' data-actor-uuid='${actorUuid}' data-cost='${data.costTotal}' data-pool='${data.pool}' data-teen='${data.teen}'><i class="fas fa-coins"></i></a>`;
  }

  // Put buttons together
  let chatButtons = `<div class="chat-card-buttons" data-actor-uuid="${actorUuid}">` + regainPointsButton + reRollButton + `</div>`;

  // HR if info
  let infoHR = (info) ? "<hr class='roll-result-hr'>" : "";

  // Put it all together into the chat flavor
  let flavor = "<div class='roll-flavor'><div class='roll-result-box'>" + title + rerollInfo + multiRollInfo + itemDescriptionInfo + "</div><hr class='roll-result-hr'>" + info + infoHR + `<div class='roll-result-box ${boxColor}'>` + resultInfo + beatenDifficulty + initiativeInfo + successInfo + effect + gmiEffect + "</div>" + chatButtons + "</div>";

  if (data.skipRoll) {
    ChatMessage.create({
      content: "<div class='roll-flavor'><div class='roll-result-box'>" + title + itemDescriptionInfo + "</div><hr class='roll-result-hr'>" + info + "</div>",
      speaker: ChatMessage.getSpeaker({actor: actor}),
      flags: {
        "itemID": data.itemID,
        "data": data
      }
    });
  } else if (!data.skipRoll) {
    // Create chat message
    data.roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor: actor}),
      flavor: flavor,
      flags: {
        "itemID": data.itemID,
        "data": data
      }
    });

    // Handle initiative
    if (data.initiativeRoll) {
      await addCharacterToCombatTracker(actor);
      await setInitiativeForCharacter(actor, initiativeResult);
    }
  }

  // Reset difficulty
  if (game.settings.get("cyphersystem", "persistentRollDifficulty") == 0) {
    if (game.user.isGM) {
      await resetDifficulty();
    } else {
      await game.socket.emit("system.cyphersystem", {operation: "resetDifficulty"});
    }
  }

  // statRoll hook
  Hooks.call("rollEngine", actor, data);
}
