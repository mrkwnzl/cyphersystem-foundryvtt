import {
  addCharacterToCombatTracker,
  setInitiativeForCharacter
} from "../actor-utilities.js";

export async function rollEngineOutput(data) {
  let actor = (data.actorUuid.includes("Token")) ? fromUuidSync(data.actorUuid).actor : fromUuidSync(data.actorUuid);

  // Title information
  let poolRoll = {
    "Might": game.i18n.localize("CYPHERSYSTEM.MightRoll"),
    "Speed": game.i18n.localize("CYPHERSYSTEM.SpeedRoll"),
    "Intellect": game.i18n.localize("CYPHERSYSTEM.IntellectRoll"),
    "Pool": game.i18n.localize("CYPHERSYSTEM.StatRoll")
  }
  if (data.title == "") {
    data.title = poolRoll[data.pool] || poolRoll["Pool"];
  }

  // Item information
  let itemDescription = "";
  let itemDescriptionInfo = "";
  if (actor.items.get(data.itemID)) {
    let item = actor.items.get(data.itemID);

    itemDescription = (item.system.description) ? `<img class="description-image-chat" src="${item.img}" width="50" height="50"/>` + await TextEditor.enrichHTML(item.system.description, {async: true, relativeTo: item}) : `<img class="description-image-chat" src="${item.img}" width="50" height="50"/>`;

    let styleHidden = `<div style="display: none" class="chat-card-item-description">`;
    let styleShow = `<div class="chat-card-item-description expanded">`;
    let style = (game.settings.get("cyphersystem", "alwaysShowDescriptionOnRoll")) ? styleShow : styleHidden;

    itemDescriptionInfo = style + `<hr class="hr-chat"><div style="min-height: 50px">` + itemDescription + `</div></div>`;

    data.title = `<a class="chat-description">` + data.title + `</a>`;
  }

  // --- Modfier block

  // Skill information
  let skillRating = {
    "-1": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Inability")}<br>`,
    "0": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Practiced")}<br>`,
    "1": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Trained")}<br>`,
    "2": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Specialized")}<br>`
  }
  let skillInfo = (skillRating[data.skillLevel] || skillRating[0]);

  // Asset information
  let assetsInfo = `${game.i18n.localize("CYPHERSYSTEM.Assets")}: ${data.assets}<br>`;

  // effortToEase information
  let effortToEaseInfo = (data.effortToEase != 1) ?
    `${game.i18n.localize("CYPHERSYSTEM.EffortForTask")}: ${data.effortToEase} ${game.i18n.localize("CYPHERSYSTEM.levels")}<br>` :
    `${game.i18n.localize("CYPHERSYSTEM.EffortForTask")}: ${data.effortToEase} ${game.i18n.localize("CYPHERSYSTEM.level")}<br>`;

  // effortOtherUses information
  let effortOtherUsesInfo = "";
  if (data.effortOtherUses == 1) {
    effortOtherUsesInfo = `${game.i18n.localize("CYPHERSYSTEM.EffortForOther")}: ${data.effortOtherUses} ${game.i18n.localize("CYPHERSYSTEM.level")}<br>`
  } else if (data.effortOtherUses >= 1) {
    effortOtherUsesInfo = `${game.i18n.localize("CYPHERSYSTEM.EffortForOther")}: ${data.effortOtherUses} ${game.i18n.localize("CYPHERSYSTEM.levels")}<br>`;
  }

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

  let basicInfoBlock = `<hr class="hr-chat">` + skillInfo + assetsInfo + effortToEaseInfo + effortOtherUsesInfo + difficultyInfo;

  // --- Damage block

  // Damage information
  let effortDamageInfo = "";
  if (data.effortDamage == 1) {
    effortDamageInfo = `${game.i18n.localize("CYPHERSYSTEM.EffortForDamage")}: ${data.effortDamage} ${game.i18n.localize("CYPHERSYSTEM.level")} (+${data.damageEffort} ${game.i18n.localize("CYPHERSYSTEM.Damage")})<br>`;
  } else if (data.effortDamage >= 2) {
    effortDamageInfo = `${game.i18n.localize("CYPHERSYSTEM.EffortForDamage")}: ${data.effortDamage} ${game.i18n.localize("CYPHERSYSTEM.levels")} (+${data.damageEffort} ${game.i18n.localize("CYPHERSYSTEM.Damage")})<br>`;
  }

  let damageInfo = "";
  if (data.totalDamage > 0 && data.damageEffect == 0) {
    damageInfo = game.i18n.format("CYPHERSYSTEM.DamageInfo", {totalDamage: data.totalDamage});
  } else if (data.totalDamage > 0 && data.damageEffect >= 1 && data.damageEffect <= 2) {
    damageInfo = game.i18n.format("CYPHERSYSTEM.DamageInfo", {totalDamage: data.damageWithEffect});
  } else if (data.totalDamage > 0 && data.damageEffect >= 3) {
    damageInfo = game.i18n.format("CYPHERSYSTEM.DamageWithEffectInfo", {totalDamage: data.totalDamage, damageWithEffect: data.damageWithEffect});
  }

  let damageInfoBlock = "";
  if (damageInfo != "") {
    damageInfoBlock = `<hr class="hr-chat">` + effortDamageInfo + damageInfo;
  }

  // --- Cost info block

  // Cost information
  let poolCostInfo = {
    "Might": function () {
      return (data.poolPointCost != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.MightPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.MightPoint")}`;
    },
    "Speed": function () {
      return (data.poolPointCost != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.SpeedPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.SpeedPoint")}`;
    },
    "Intellect": function () {
      return (data.poolPointCost != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.IntellectPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.IntellectPoint")}`;
    },
    "Pool": function () {
      return (data.poolPointCost != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.AnyPoolPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.AnyPoolPoint")}`;
    },
    "XP": function () {
      return `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${data.poolPointCost}  ${game.i18n.localize("CYPHERSYSTEM.XP")}`
    }
  }

  let costTotalInfo = {
    "Might": function () {
      return (data.costTotal != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${data.costTotal} [${data.costCalculated}-${data.edge}] ${game.i18n.localize("CYPHERSYSTEM.MightPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${data.costTotal} [${data.costCalculated}-${data.edge}] ${game.i18n.localize("CYPHERSYSTEM.MightPoint")}`;
    },
    "Speed": function () {
      return (data.costTotal != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${data.costTotal} [${data.costCalculated}-${data.edge}] ${game.i18n.localize("CYPHERSYSTEM.SpeedPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${data.costTotal} [${data.costCalculated}-${data.edge}] ${game.i18n.localize("CYPHERSYSTEM.SpeedPoint")}`;
    },
    "Intellect": function () {
      return (data.costTotal != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${data.costTotal} [${data.costCalculated}-${data.edge}] ${game.i18n.localize("CYPHERSYSTEM.IntellectPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${data.costTotal} [${data.costCalculated}-${data.edge}] ${game.i18n.localize("CYPHERSYSTEM.IntellectPoint")}`;
    },
    "Pool": function () {
      return (data.costTotal != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${data.costTotal} ${game.i18n.localize("CYPHERSYSTEM.AnyPoolPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${data.costTotal} ${game.i18n.localize("CYPHERSYSTEM.AnyPoolPoint")}`;
    },
    "XP": function () {
      return `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${data.costTotal} ${game.i18n.localize("CYPHERSYSTEM.XP")}`
    }
  }

  let poolCostInfoString = (data.poolPointCost != 0) ? poolCostInfo[data.pool]() + "<br>" : "";
  let costTotalInfoString = (data.costCalculated != 0) ? costTotalInfo[data.pool]() : "";
  let costInfoBlock = "";
  if (poolCostInfoString != "" || costTotalInfoString != "") {
    costInfoBlock = "<hr class='hr-chat'>" + poolCostInfoString + costTotalInfoString;
  }

  // --- Roll result block

  // Determine result with bonus/penalty
  let operator = (data.bonus < 0) ? "-" : "+";
  let resultInfo = (data.bonus != 0 && data.bonus != "") ? "<span class='roll-result'>" + game.i18n.localize("CYPHERSYSTEM.Result") + ": " + data.rollTotal + " [" + data.roll.total + operator + Math.abs(data.bonus) + "]" + "</span><br>" : "";

  // Determine special effect
  let effect = "";

  if (data.roll.total == 17 && !data.impairedStatus && data.totalDamage >= 1) {
    effect = "<br><span class='roll-effect effect1718'>" + game.i18n.localize("CYPHERSYSTEM.OneDamage") + "</span>";
  } else if (data.roll.total == 18 && !data.impairedStatus && data.totalDamage >= 1) {
    effect = "<br><span class='roll-effect effect1718'>" + game.i18n.localize("CYPHERSYSTEM.TwoDamage") + "</span>";
  } else if (data.roll.total == 19 && !data.impairedStatus && data.totalDamage >= 1) {
    effect = "<br><span class='roll-effect effect1920'>" + game.i18n.localize("CYPHERSYSTEM.DamageOrMinorEffectRoll") + "</span>";
  } else if (data.roll.total == 19 && !data.impairedStatus && data.totalDamage <= 0) {
    effect = "<br><span class='roll-effect effect1920'>" + game.i18n.localize("CYPHERSYSTEM.MinorEffectRoll") + "</span>";
  } else if (data.roll.total == 20 && !data.impairedStatus && data.totalDamage >= 1) {
    effect = "<br><span class='roll-effect effect1920'>" + game.i18n.localize("CYPHERSYSTEM.DamageOrMajorEffectRoll") + "</span>";
  } else if (data.roll.total == 20 && !data.impairedStatus && data.totalDamage <= 0) {
    effect = "<br><span class='roll-effect effect1920'>" + game.i18n.localize("CYPHERSYSTEM.MajorEffectRoll") + "</span>";
  } else if ([17, 18, 19, 20].includes(data.roll.total) && data.impairedStatus && data.totalDamage >= 1) {
    effect = "<br><span class='roll-effect effect1718'>" + game.i18n.localize("CYPHERSYSTEM.OneDamage") + "</span>";
  }

  let gmiEffect = "";
  if (data.roll.total <= data.gmiRange) {
    gmiEffect = "<br><span class='roll-effect intrusion'>" + game.i18n.localize("CYPHERSYSTEM.GMIntrusion") + "</span>";
  }

  // Determine steps eased/hindered
  let modifiedBy = "";
  if (data.difficultyModifierTotal != 0) {
    if (data.difficultyModifierTotal > 1) {
      modifiedBy = "<span class='roll-difficulty'>" + game.i18n.format("CYPHERSYSTEM.EasedBySteps", {amount: data.difficultyModifierTotal}) + ".</span> "
    } else if (data.difficultyModifierTotal == 1) {
      modifiedBy = "<span class='roll-difficulty'>" + game.i18n.localize("CYPHERSYSTEM.Eased") + ".</span> "
    } else if (data.difficultyModifierTotal == -1) {
      modifiedBy = "<span class='roll-difficulty'>" + game.i18n.localize("CYPHERSYSTEM.Hindered") + ".</span> "
    } else if (data.difficultyModifierTotal < -1) {
      modifiedBy = "<span class='roll-difficulty'>" + game.i18n.format("CYPHERSYSTEM.HinderedBySteps", {amount: Math.abs(data.difficultyModifierTotal)}) + ".</span> "
    }
  }

  // Create difficulty info
  let finalDifficultyInfo = (data.baseDifficulty != "none") ? "<br>" + game.i18n.localize("CYPHERSYSTEM.Difficulty") + ": " + data.finalDifficulty : "";

  // Create multi roll
  let multiRollInfo = (actor.getFlag("cyphersystem", "multiRoll.active")) ? "<br><span class='multi-roll-active'>" + game.i18n.localize("CYPHERSYSTEM.MultiRoll") + "</span>" : "";

  // Create beatenDifficulty
  let beatenDifficulty = modifiedBy + "<span class='roll-difficulty'>" + game.i18n.localize("CYPHERSYSTEM.RollBeatDifficulty") + " " + data.difficultyResult + "</span>";

  // Add initiative result
  let initiativeResult = data.roll.total + (data.difficultyModifierTotal * 3) + data.bonus;
  let initiativeInfo = (data.initiativeRoll) ? "<br><span class='roll-initiative'>" + game.i18n.localize("CYPHERSYSTEM.Initiative") + ": " + initiativeResult + "</span > " : "";

  // Create success info
  let successInfo = "";
  if (data.baseDifficulty != "none") {
    let difficultyBeaten = data.difficulty + data.difficultyModifierTotal;
    successInfo = (difficultyBeaten >= data.finalDifficulty) ? "<br><span class='roll-effect effect1920'>" + game.i18n.localize("CYPHERSYSTEM.Success") + "</span>" : "<br><span class='roll-effect intrusion'>" + game.i18n.localize("CYPHERSYSTEM.Failure") + "</span>";
  }

  // Create info block
  let info = basicInfoBlock + damageInfoBlock + costInfoBlock;

  // Add reroll button
  let actorUuid = (actor) ? actor.uuid : "";
  let dataString = JSON.stringify(data);
  let reRollButton = `<a class='reroll-stat' title='${game.i18n.localize("CYPHERSYSTEM.Reroll")}' data-user='${game.user.id}' data-data='${dataString}'><i class="fas fa-dice-d20" style="width: 12px"></i></a>`

  // Add regain points button
  let regainPointsButton = "";
  if (data.costTotal > 0 && data.roll.total == 20 && ["Might", "Speed", "Intellect"].includes(data.pool)) {
    regainPointsButton = `<a class='regain-points' title='${game.i18n.localize("CYPHERSYSTEM.RegainPoints")}' data-user='${game.user.id}' data-actor-uuid='${actorUuid}' data-cost='${data.costTotal}' data-pool='${data.pool}' data-teen='${data.teen}'><i class="fas fa-coins"></i></a>`
  }

  // Put buttons together
  let chatButtons = `<div class="chat-card-buttons" data-actor-uuid="${actorUuid}">` + regainPointsButton + reRollButton + `</div>`;

  // Put it all together into the chat flavor
  let flavor = "<b>" + data.title + "</b>" + finalDifficultyInfo + multiRollInfo + itemDescriptionInfo + info + "<hr class='hr-chat'>" + resultInfo + beatenDifficulty + initiativeInfo + successInfo + effect + gmiEffect + chatButtons;

  // ---

  if (data.skipRoll) {
    ChatMessage.create({
      content: "<b>" + data.title + "</b>" + itemDescriptionInfo + info,
      speaker: ChatMessage.getSpeaker({actor: actor}),
      flags: {"itemID": data.itemID}
    });
  } else if (!data.skipRoll) {
    // Create chat message
    data.roll.toMessage({
      speaker: ChatMessage.getSpeaker({actor: actor}),
      flavor: flavor,
      flags: {"itemID": data.itemID}
    });

    // Handle initiative
    if (data.initiativeRoll) {
      await addCharacterToCombatTracker(actor);
      await setInitiativeForCharacter(actor, initiativeResult);
    }
  }
}
