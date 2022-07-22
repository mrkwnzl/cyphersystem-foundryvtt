export async function rollEngineOutput(actor, itemID, skipRoll, title, pool, skillLevel, assets, effortToEase, effortOtherUses, damage, effortDamage, damagePerLOE, difficultyModifier, easedOrHindered, poolPointCost, costCalculated, costTotal, edge) {
  // Title information
  let poolRoll = {
    "Might": game.i18n.localize("CYPHERSYSTEM.MightRoll"),
    "Speed": game.i18n.localize("CYPHERSYSTEM.SpeedRoll"),
    "Intellect": game.i18n.localize("CYPHERSYSTEM.IntellectRoll"),
    "Pool": game.i18n.localize("CYPHERSYSTEM.StatRoll")
  };
  title = (title == "") ? (poolRoll[pool] || poolRoll["Pool"]) : title;

  // Item information
  let itemDescription = "";
  let itemDescriptionInfo = ""
  if (actor.items.get(itemID)) {
    let item = actor.items.get(itemID);

    itemDescription = (item.system.description) ? "<img class='description-image-chat' src='" + item.img + "' width='50' height='50'/>" + await TextEditor.enrichHTML(item.system.description, {async: true}) : "<img class='description-image-chat' src='" + item.img + "' width='50' height='50'/>";

    let styleHidden = "<div style='display: none' class='chat-card-item-description'>";

    let styleShow = "<div class='chat-card-item-description expanded'>";

    let style = (game.settings.get("cyphersystem", "alwaysShowDescriptionOnRoll")) ? styleShow : styleHidden;

    itemDescriptionInfo = style + "<hr class='hr-chat'><div style='min-height: 51px'>" + itemDescription + "</div></div>";

    title = "<a class='chat-description'>" + title + "</a>";
  }

  // Skill information
  let skillRating = {
    "-1": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Inability")}<br>`,
    "0": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Practiced")}<br>`,
    "1": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Trained")}<br>`,
    "2": `${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}: ${game.i18n.localize("CYPHERSYSTEM.Specialized")}<br>`
  };
  let skillInfo = (skillRating[skillLevel] || skillRating[0]);

  // Asset information
  let assetsInfo = `${game.i18n.localize("CYPHERSYSTEM.Assets")}: ${assets}<br>`;

  // effortToEase information
  let effortToEaseInfo = (effortToEase != 1) ?
    `${game.i18n.localize("CYPHERSYSTEM.EffortForTask")}: ${effortToEase} ${game.i18n.localize("CYPHERSYSTEM.levels")}<br>` :
    `${game.i18n.localize("CYPHERSYSTEM.EffortForTask")}: ${effortToEase} ${game.i18n.localize("CYPHERSYSTEM.level")}<br>`;

  // effortOtherUses information
  let effortOtherUsesInfo = "";
  if (effortOtherUses == 1) {
    effortOtherUsesInfo = `${game.i18n.localize("CYPHERSYSTEM.EffortForOther")}: ${effortOtherUses} ${game.i18n.localize("CYPHERSYSTEM.level")}<br>`
  } else if (effortOtherUses >= 1) {
    effortOtherUsesInfo = `${game.i18n.localize("CYPHERSYSTEM.EffortForOther")}: ${effortOtherUses} ${game.i18n.localize("CYPHERSYSTEM.levels")}<br>`;
  }

  // Additional step(s) information
  difficultyModifier = parseInt(difficultyModifier);

  let difficultyInfo = "";
  if (easedOrHindered != "hindered") {
    if (difficultyModifier > 1) {
      difficultyInfo = `${game.i18n.format("CYPHERSYSTEM.EasedByExtraSteps", {amount: difficultyModifier})}<br>`;
    } else if (difficultyModifier == 1) {
      difficultyInfo = `${game.i18n.localize("CYPHERSYSTEM.EasedByExtraStep")}<br>`;
    }
  } else {
    if (difficultyModifier < -1) {
      difficultyInfo = `${game.i18n.format("CYPHERSYSTEM.HinderedByExtraSteps", {amount: Math.abs(difficultyModifier)})}<br>`;
    } else if (difficultyModifier == -1) {
      difficultyInfo = `${game.i18n.localize("CYPHERSYSTEM.HinderedByExtraStep")}<br>`;
    }
  }

  let basicInfoBlock = `<hr class="hr-chat">` + skillInfo + assetsInfo + effortToEaseInfo + effortOtherUsesInfo + difficultyInfo;

  // Damage information
  let effortDamageInfo = "";
  if (effortDamage == 1) {
    effortDamageInfo = `${game.i18n.localize("CYPHERSYSTEM.EffortForDamage")}: ${effortDamage} ${game.i18n.localize("CYPHERSYSTEM.level")}<br>`;
  } else if (effortDamage >= 2) {
    attackModifierInfo = `${game.i18n.localize("CYPHERSYSTEM.EffortForDamage")}: ${effortDamage} ${game.i18n.localize("CYPHERSYSTEM.levels")}<br>`;
  }

  let damageEffort = parseInt(damagePerLOE) * parseInt(effortDamage);
  let totalDamage = parseInt(damage) + parseInt(damageEffort);
  let damageInfo = "";
  if (totalDamage > 0) {
    if (damageEffort > 0) {
      damageInfo = `${game.i18n.localize("CYPHERSYSTEM.Damage")}: ${totalDamage} [${damage}+${damageEffort}]`;
    } else {
      damageInfo = `${game.i18n.localize("CYPHERSYSTEM.Damage")}: ${totalDamage}`;
    }
  }

  let damageInfoBlock = "";
  if (damageInfo != "") {
    damageInfoBlock = `<hr class='hr-chat'>` + effortDamageInfo + damageInfo;
  }

  // Cost information
  let poolCostInfo = {
    "Might": function () {
      return (poolPointCost != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.MightPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.MightPoint")}`;
    },
    "Speed": function () {
      return (poolPointCost != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.SpeedPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.SpeedPoint")}`;
    },
    "Intellect": function () {
      return (poolPointCost != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.IntellectPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.IntellectPoint")}`;
    },
    "Pool": function () {
      return (poolPointCost != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.AnyPoolPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${poolPointCost} ${game.i18n.localize("CYPHERSYSTEM.AnyPoolPoint")}`;
    },
    "XP": function () {
      return `${game.i18n.localize("CYPHERSYSTEM.Cost")}: ${poolPointCost}  ${game.i18n.localize("CYPHERSYSTEM.XP")}`
    }
  }

  let costTotalInfo = {
    "Might": function () {
      return (costTotal != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${costTotal} [${costCalculated}-${edge}] ${game.i18n.localize("CYPHERSYSTEM.MightPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${costTotal} [${costCalculated}-${edge}] ${game.i18n.localize("CYPHERSYSTEM.MightPoint")}`;
    },
    "Speed": function () {
      return (costTotal != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${costTotal} [${costCalculated}-${edge}] ${game.i18n.localize("CYPHERSYSTEM.SpeedPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${costTotal} [${costCalculated}-${edge}] ${game.i18n.localize("CYPHERSYSTEM.SpeedPoint")}`;
    },
    "Intellect": function () {
      return (costTotal != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${costTotal} [${costCalculated}-${edge}] ${game.i18n.localize("CYPHERSYSTEM.IntellectPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${costTotal} [${costCalculated}-${edge}] ${game.i18n.localize("CYPHERSYSTEM.IntellectPoint")}`;
    },
    "Pool": function () {
      return (costTotal != 1) ?
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${costTotal} ${game.i18n.localize("CYPHERSYSTEM.AnyPoolPoints")}` :
        `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${costTotal} ${game.i18n.localize("CYPHERSYSTEM.AnyPoolPoint")}`;
    },
    "XP": function () {
      return `${game.i18n.localize("CYPHERSYSTEM.TotalCost")}: ${costTotal} ${game.i18n.localize("CYPHERSYSTEM.XP")}`
    }
  }

  let poolCostInfoString = (poolPointCost != 0) ? poolCostInfo[pool]() + "<br>" : "";
  let costTotalInfoString = (costCalculated != 0) ? costTotalInfo[pool]() : "";
  let costInfoBlock = "";
  if (poolCostInfoString != "" || costTotalInfoString != "") {
    costInfoBlock = `<hr class='hr-chat'>` + poolCostInfoString + costTotalInfoString;
  }

  // Putting it all together
  let rollInfo = (!skipRoll) ? itemDescriptionInfo + basicInfoBlock + damageInfoBlock + costInfoBlock : itemDescriptionInfo + costInfoBlock;

  let rollEngineOutput = [title, rollInfo];

  return rollEngineOutput;
}