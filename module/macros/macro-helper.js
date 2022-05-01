/* -------------------------------------------- */
/*  Macro helper                                */
/* -------------------------------------------- */

import { chatCardRegainPoints } from "../utilities/chat-cards.js";
import { htmlEscape } from "../utilities/html-escape.js";

export async function diceRoller(title, info, modifier, initiativeRoll, actor, bonus, cost, pool, itemID) {
  // Fix for single quotation marks
  title = title.replace(/'/g, "&apos;");
  info = info.replace(/'/g, "&apos;");

  // Default for itemID
  if (!itemID) itemID = "";

  // In case pool is passed capitalized
  pool = pool.toLowerCase();

  // Roll dice
  let roll = await new Roll("1d20").evaluate({ async: true });
  let difficulty = (parseInt(roll.result) + parseInt(bonus) < 0) ? Math.ceil((parseInt(roll.result) + parseInt(bonus)) / 3) : Math.floor((parseInt(roll.result) + parseInt(bonus)) / 3);

  // Determine result
  let difficultyResult = determineDifficultyResult(difficulty, modifier, bonus);

  // Determine special effect
  let possibleEffects = {
    1: "<span style='color:red'><b>" + game.i18n.localize("CYPHERSYSTEM.GMIntrusion") + "</b></span>",
    17: "<span style='color:blue'><b>" + game.i18n.localize("CYPHERSYSTEM.OneDamage") + "</b></span>",
    18: "<span style='color:blue'><b>" + game.i18n.localize("CYPHERSYSTEM.TwoDamage") + "</b></span>",
    19: "<span style='color:green'><b>" + game.i18n.localize("CYPHERSYSTEM.MinorEffectRoll") + "</b></span>",
    20: "<span style='color:green'><b>" + game.i18n.localize("CYPHERSYSTEM.MajorEffectRoll") + "</b></span>"
  };
  let effect = (possibleEffects[roll.result] || "");

  // Determine steps eased/hindered
  let modifiedBy = "";
  if (modifier != 0) {
    if (modifier > 1) {
      modifiedBy = game.i18n.format("CYPHERSYSTEM.EasedBySteps", { amount: modifier }) + ". "
    } else if (modifier == 1) {
      modifiedBy = game.i18n.localize("CYPHERSYSTEM.Eased") + ". "
    } else if (modifier == -1) {
      modifiedBy = game.i18n.localize("CYPHERSYSTEM.Hindered") + ". "
    } else if (modifier < -1) {
      modifiedBy = game.i18n.format("CYPHERSYSTEM.HinderedBySteps", { amount: Math.abs(modifier) }) + ". "
    }
  }

  // Determine bars
  let bars = (info != "") ?
    info + "<hr class='hr-chat'>" :
    "<hr class='hr-chat'>";

  // Determine result with bonus/penalty
  let bonusResult = parseInt(roll.result) + parseInt(bonus);
  let operator = (bonus < 0) ? "-" : "+";
  let resultInfo = (bonus != 0 && bonus != "") ? game.i18n.localize("CYPHERSYSTEM.Result") + ": " + bonusResult + " [" + roll.result + operator + Math.abs(bonus) + "]" + "<br>" : "";

  // Add initiative result
  let initiativeResult = parseInt(roll.total) + (parseInt(modifier) * 3) + parseInt(bonus);
  let initiativeInfo = (initiativeRoll) ? "<br>" + game.i18n.localize("CYPHERSYSTEM.Initiative") + ": " + initiativeResult : "";

  // Add reroll button
  let actorID = (actor) ? actor.id : "";
  let teen = (actor.data.data.settings.gameMode.currentSheet == "Teen") ? true : false;
  let reRollButton = `<a class='reroll-stat' title='${game.i18n.localize("CYPHERSYSTEM.Reroll")}' data-title='${title}' data-info='${info}' data-modifier='${modifier}' data-initiative='${initiativeRoll}' data-actor='${actorID}' data-user='${game.user.id}' data-bonus='${bonus}' data-cost='${cost}' data-pool='${pool}' data-teen='${teen}'><i class="fas fa-redo"></i> <i class="fas fa-dice-d20" style="width: 12px"></i></a>`

  // Add regain points button
  let regainPointsButton = "";
  if (cost > 0 && roll.result == 20 && (pool == "might" || pool == "speed" || pool == "intellect")) {
    regainPointsButton = `<a class='regain-points' title='${game.i18n.localize("CYPHERSYSTEM.RegainPoints")}' data-user='${game.user.id}' data-actor='${actorID}' data-cost='${cost}' data-pool='${pool}'><i class="fas fa-undo"></i> <i class="fas fa-coins"></i></a> / `
  }

  // Put buttons together
  let chatButtons = `<div style='text-align: right'>` + regainPointsButton + reRollButton + `</div>`;

  // Put it all together into the chat flavor
  let flavor = "<b>" + title + "</b>" + bars + resultInfo + modifiedBy + game.i18n.localize("CYPHERSYSTEM.RollBeatDifficulty") + " " + difficultyResult + initiativeInfo + "<br>" + effect + chatButtons;

  // Create chat message
  roll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: flavor,
    flags: { itemID: itemID }
  });

  // Return total
  if (initiativeRoll) {
    await addCharacterToCombatTracker(actor);
    await setInitiativeForCharacter(actor, initiativeResult);
  }
}

function determineDifficultyResult(difficulty, modifier) {
  if (!game.settings.get("cyphersystem", "effectiveDifficulty")) {
    if (difficulty < 0) difficulty = 0;
    return difficulty + " (" + difficulty * 3 + ")";
  } else {
    let operator = (modifier < 0) ? "-" : "+";
    let effectiveDifficulty = difficulty + parseInt(modifier);
    if (effectiveDifficulty < 0) effectiveDifficulty = 0;
    return effectiveDifficulty + " [" + difficulty + operator + Math.abs(modifier) + "]";
  }
}

export async function payPoolPoints(actor, cost, pool, teen) {
  pool = pool.toLowerCase();

  // Determine stats
  let mightValue = (teen) ? actor.data.data.teen.pools.might.value : actor.data.data.pools.might.value;
  let mightEdge = (teen) ? actor.data.data.teen.pools.mightEdge : actor.data.data.pools.mightEdge;
  let speedValue = (teen) ? actor.data.data.teen.pools.speed.value : actor.data.data.pools.speed.value;
  let speedEdge = (teen) ? actor.data.data.teen.pools.speedEdge : actor.data.data.pools.speedEdge;
  let intellectValue = (teen) ? actor.data.data.teen.pools.intellect.value : actor.data.data.pools.intellect.value;
  let intellectEdge = (teen) ? actor.data.data.teen.pools.intellectEdge : actor.data.data.pools.intellectEdge;

  // Determine edge
  let relevantEdge = {
    "might": mightEdge,
    "speed": speedEdge,
    "intellect": intellectEdge
  };
  let edge = (relevantEdge[pool] || 0);

  // Check for weakness
  edge = (edge < 0 && (cost == 0 || cost == "")) ? 0 : edge;

  // Determine cost
  cost = cost - edge;
  if (cost < 0) cost = 0;

  // Check if enough points are avalable and update actor
  if (pool == "might") {
    if (cost > mightValue) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughMight"));
      return false;
    }
    (teen) ? actor.update({ "data.teen.pools.might.value": mightValue - cost }) : actor.update({ "data.pools.might.value": mightValue - cost })
  } else if (pool == "speed") {
    if (cost > speedValue) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughSpeed"));
      return false;
    }
    (teen) ? actor.update({ "data.teen.pools.speed.value": intellectValue - cost }) : actor.update({ "data.pools.speed.value": speedValue - cost })
  } else if (pool == "intellect") {
    if (cost > intellectValue) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughIntellect"));
      return false;
    }
    (teen) ? actor.update({ "data.teen.pools.intellect.value": intellectValue - cost }) : actor.update({ "data.pools.intellect.value": intellectValue - cost })
  } else if (pool == "xp") {
    if (cost > actor.data.data.basic.xp) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughXP"));
      return false;
    }
    actor.update({ "data.basic.xp": actor.data.data.basic.xp - cost })
  }

  return true;
}

export async function regainPoolPoints(actor, cost, pool, teen) {
  pool = pool.toLowerCase();

  // Determine stats
  let mightValue = (teen) ? actor.data.data.teen.pools.might.value : actor.data.data.pools.might.value;
  let speedValue = (teen) ? actor.data.data.teen.pools.speed.value : actor.data.data.pools.speed.value;
  let intellectValue = (teen) ? actor.data.data.teen.pools.intellect.value : actor.data.data.pools.intellect.value;

  // Return points
  if (pool == "might") {
    (teen) ? actor.update({ "data.teen.pools.might.value": mightValue + cost }) : actor.update({ "data.pools.might.value": mightValue + cost })
  } else if (pool == "speed") {
    (teen) ? actor.update({ "data.teen.pools.speed.value": intellectValue + cost }) : actor.update({ "data.pools.speed.value": speedValue + cost })
  } else if (pool == "intellect") {
    (teen) ? actor.update({ "data.teen.pools.intellect.value": intellectValue + cost }) : actor.update({ "data.pools.intellect.value": intellectValue + cost })
  }

  ChatMessage.create({
    content: chatCardRegainPoints(actor, cost, pool)
  })
}

export function itemRollMacroQuick(actor, itemID, teen) {
  // Find actor and item based on item ID
  const item = actor.items.get(itemID);

  // Set defaults
  let info = "";
  let modifier = 0;
  let pointsPaid = true;
  if (!teen) teen = (actor.data.data.settings.gameMode.currentSheet == "Teen") ? true : false;

  // Set title
  let itemTypeStrings = {
    "skill": game.i18n.localize("ITEM.TypeSkill"),
    "teen Skill": game.i18n.localize("ITEM.TypeTeen Skill"),
    "power Shift": game.i18n.localize("ITEM.TypePower Shift"),
    "attack": game.i18n.localize("ITEM.TypeAttack"),
    "teen Attack": game.i18n.localize("ITEM.TypeTeen Attack"),
    "ability": game.i18n.localize("ITEM.TypeAbility"),
    "teen Ability": game.i18n.localize("ITEM.TypeTeen Ability"),
    "cypher": game.i18n.localize("ITEM.TypeCypher"),
    "artifact": game.i18n.localize("ITEM.TypeArtifact"),
    "ammo": game.i18n.localize("ITEM.TypeAmmo"),
    "armor": game.i18n.localize("ITEM.TypeArmor"),
    "equipment": game.i18n.localize("ITEM.TypeEquipment"),
    "lasting Damage": game.i18n.localize("ITEM.TypeLasting Damage"),
    "material": game.i18n.localize("ITEM.TypeMaterial"),
    "oddity": game.i18n.localize("ITEM.TypeOddity"),
    "teen Armor": game.i18n.localize("ITEM.TypeTeen Armor"),
    "teen lasting Damage": game.i18n.localize("ITEM.TypeTeen Lasting Damage")
  };
  let itemType = (itemTypeStrings[item.type] || "");

  if (item.type == "skill" || item.type == "teen Skill") {
    // Set skill Levels
    let relevantSkill = {
      "Inability": game.i18n.localize("CYPHERSYSTEM.Inability"),
      "Practiced": game.i18n.localize("CYPHERSYSTEM.Practiced"),
      "Trained": game.i18n.localize("CYPHERSYSTEM.Trained"),
      "Specialized": game.i18n.localize("CYPHERSYSTEM.Specialized")
    };
    let skillInfo = (relevantSkill[item.data.data.skillLevel] || relevantSkill["Practiced"]);

    // Set info
    info = itemType + ". " + game.i18n.localize("CYPHERSYSTEM.Level") + ": " + skillInfo;

    // Determine skill level
    let skillLevels = {
      "Inability": -1,
      "Practiced": 0,
      "Trained": 1,
      "Specialized": 2
    };

    // Set difficulty modifier
    modifier = (skillLevels[item.data.data.skillLevel] || 0);

  } else if (item.type == "power Shift") {
    // Set info
    info = itemType + ". " + item.data.data.powerShiftValue + ((item.data.data.powerShiftValue == 1) ?
      " " + game.i18n.localize("CYPHERSYSTEM.Shift") :
      " " + game.i18n.localize("CYPHERSYSTEM.Shifts"));

    // Set difficulty modifier
    modifier = item.data.data.powerShiftValue;

  } else if (item.type == "attack" || item.type == "teen Attack") {
    // Set info
    info = itemType + ". " + game.i18n.localize("CYPHERSYSTEM.Damage") + ": " + item.data.data.damage;

    // Determine whether the roll is eased or hindered
    let modifiedBy = (item.data.data.modified == "hindered") ? item.data.data.modifiedBy * -1 : item.data.data.modifiedBy;

    // Determine skill level
    let attackSkill = {
      "Inability": -1,
      "Practiced": 0,
      "Trained": 1,
      "Specialized": 2
    };
    let skillRating = (attackSkill[item.data.data.skillRating] || 0);

    // Set difficulty modifier
    modifier = skillRating + modifiedBy;

  } else if (item.type == "ability" || item.type == "teen Ability") {
    // Set defaults
    let costInfo = "";

    // Slice possible "+" from cost
    let checkPlus = item.data.data.costPoints.slice(-1);
    let pointCost = (checkPlus == "+") ?
      item.data.data.costPoints.slice(0, -1) :
      item.data.data.costPoints;

    // Check if there is a point cost and prepare costInfo
    if (item.data.data.costPoints != "" && item.data.data.costPoints != "0") {
      // Determine edge
      let mightEdge = (teen) ? actor.data.data.teen.pools.mightEdge : actor.data.data.pools.mightEdge;
      let speedEdge = (teen) ? actor.data.data.teen.pools.speedEdge : actor.data.data.pools.speedEdge;
      let intellectEdge = (teen) ? actor.data.data.teen.pools.intellectEdge : actor.data.data.pools.intellectEdge;

      let relevantEdge = {
        "Might": mightEdge,
        "Speed": speedEdge,
        "Intellect": intellectEdge
      };
      let edge = (relevantEdge[item.data.data.costPool] || 0)

      // Determine point cost
      let checkPlus = item.data.data.costPoints.slice(-1);
      let pointCostInfo = pointCost - edge;
      if (pointCostInfo < 0) pointCostInfo = 0;

      // Determine pool points
      let relevantPool = {
        "Might": function () {
          return (pointCost != 1) ?
            game.i18n.localize("CYPHERSYSTEM.MightPoints") :
            game.i18n.localize("CYPHERSYSTEM.MightPoint");
        },
        "Speed": function () {
          return (pointCost != 1) ?
            game.i18n.localize("CYPHERSYSTEM.SpeedPoints") :
            game.i18n.localize("CYPHERSYSTEM.SpeedPoint");
        },
        "Intellect": function () {
          return (pointCost != 1) ?
            game.i18n.localize("CYPHERSYSTEM.IntellectPoints") :
            game.i18n.localize("CYPHERSYSTEM.IntellectPoint");
        },
        "Pool": function () {
          return (pointCost != 1) ?
            game.i18n.localize("CYPHERSYSTEM.AnyPoolPoints") :
            game.i18n.localize("CYPHERSYSTEM.AnyPoolPoint");
        },
        "XP": function () {
          return game.i18n.localize("CYPHERSYSTEM.XP")
        }
      }
      let poolPoints = (relevantPool[item.data.data.costPool]() || relevantPool["Pool"]());

      // Determine edge info
      let operator = (edge < 0) ? "+" : "-";
      let edgeInfo = (edge != 0) ? " (" + pointCost + operator + Math.abs(edge) + ")" : "";

      // Put it all together for cost info
      costInfo = ". " + game.i18n.localize("CYPHERSYSTEM.Cost") + ": " + pointCostInfo + edgeInfo + " " + poolPoints;
    }

    // Put everything together for info
    info = itemType + costInfo

    // Pay pool points and check whether there are enough points
    pointsPaid = payPoolPoints(actor, pointCost, item.data.data.costPool, teen)

  } else if (item.type == "cypher") {
    // Determine level info
    let levelInfo = (item.data.data.level != "") ?
      ". " + game.i18n.localize("CYPHERSYSTEM.Level") + ": " + item.data.data.level :
      "";

    // Put it all together for info
    info = itemType + levelInfo;

  } else if (item.type == "artifact") {
    // Determine level info
    let levelInfo = (item.data.data.level != "") ?
      game.i18n.localize("CYPHERSYSTEM.Level") + ": " + item.data.data.level + ". " :
      "";

    // Determine depletion info
    let depletionInfo = game.i18n.localize("CYPHERSYSTEM.Depletion") + ": " + item.data.data.depletion;

    // Put it all together for info
    info = itemType + ". " + levelInfo + depletionInfo;

  } else {
    // Default to simply outputting item type
    info = itemType
  }

  // Parse to dice roller macro
  if (pointsPaid == true) {
    diceRoller(item.name, info, modifier, 0);
  }
}

export async function addCharacterToCombatTracker(actor) {
  for (let token of canvas.tokens.objects.children) {
    if (token.actor.id == actor.id && !token.inCombat) {
      await token.toggleCombat();
    }
  }
}

export async function setInitiativeForCharacter(actor, initiative) {
  for (let combatant of game.combat.combatants) {
    if (combatant.actor.id == actor.id) {
      await game.combat.setInitiative(combatant.id, initiative);
    }
  }
}

export async function renameTag(actor, currentTag, newTag) {
  let updates = [];
  for (let item of actor.items) {
    let name = (!item.data.name) ? "" : item.data.name;
    let description = (!item.data.data.description) ? "" : item.data.data.description;
    if ((item.data.type == "tag" || item.data.type == "recursion") && newTag != "") {
      if (name.includes(currentTag.replace(/[#@]/g, ''))) {
        name = name.replace(currentTag.replace(/[#@]/g, ''), newTag.replace(/[#@]/g, ''));
        updates.push({ _id: item.id, "name": name });
      }
    }
    if (name.includes(currentTag) || description.includes(currentTag)) {
      name = name.replace(currentTag, newTag);
      description = description.replace(currentTag, newTag);
      updates.push({ _id: item.id, "name": name, "data.description": description });
    }
  }
  await actor.updateEmbeddedDocuments("Item", updates);
}

export async function toggleTagArchiveStatus(actor, tags, archiveStatus) {
  // Check for PC
  if (!actor || actor.data.type != "PC") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  if (tags.length == 0) return;

  let updates = [];
  for (let item of actor.items) {
    let name = (!item.data.name) ? "" : item.data.name.toLowerCase();
    let description = (!item.data.data.description) ? "" : item.data.data.description.toLowerCase();
    if (item.data.type == "Tag") return;
    if (Array.isArray(tags)) {
      for (let tag of tags) {
        if (tag == "") return;
        tag = "#" + htmlEscape(tag.toLowerCase().trim());
        let regTag = new RegExp("(\\s|^|&nbsp;|<.+?>)" + tag + "(\\s|$|&nbsp;|<.+?>)", "gi");
        if (regTag.test(name) || regTag.test(description)) {
          updates.push({ _id: item.id, "data.archived": archiveStatus });
        }
      }
    } else {
      let tag = "#" + htmlEscape(tags.toLowerCase().trim());
      let regTag = new RegExp("(\\s|^|&nbsp;|<.+?>)" + tag + "(\\s|$|&nbsp;|<.+?>)", "gi");
      if (regTag.test(name) || regTag.test(description)) {
        updates.push({ _id: item.id, "data.archived": archiveStatus });
      }
    }
  }
  await actor.updateEmbeddedDocuments("Item", updates);
}

/* -------------------------------------------- */
/*  Deprecation Messages for old macros         */
/* -------------------------------------------- */

export function easedRollEffectiveMacro() {
  ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.EasedRollEffectiveMacro"))
}

export function hinderedRollEffectiveMacro() {
  ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.HinderedRollEffectiveMacro"))
}

/* -------------------------------------------- */
/*  Dont really want to delete it, yet          */
/* -------------------------------------------- */

// function titleCase(phrase) {
//   const words = phrase.split(" ");
//
//   for (let i = 0; i < words.length; i++) {
//     words[i] = words[i][0].toUpperCase() + words[i].substr(1);
//   }
//
//   return words.join(" ");
// }
