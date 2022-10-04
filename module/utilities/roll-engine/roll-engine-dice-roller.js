import {addCharacterToCombatTracker, setInitiativeForCharacter} from "../../utilities/actor-utilities.js";

export async function rollEngineDiceRoller(actor, itemID, initiativeRoll, title, info, pool, modifier, bonus, totalCost) {
  // Fix for single quotation marks
  title = title.replace(/'/g, "&apos;");
  info = info.replace(/'/g, "&apos;");

  // Default for itemID
  if (!itemID) itemID = "";

  // In case pool is passed capitalized
  pool = pool.toLowerCase();

  // Roll dice
  let roll = await new Roll("1d20").evaluate({async: true});
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
  }
  let effect = (possibleEffects[roll.result] || "");

  // Determine steps eased/hindered
  let modifiedBy = "";
  if (modifier != 0) {
    if (modifier > 1) {
      modifiedBy = game.i18n.format("CYPHERSYSTEM.EasedBySteps", {amount: modifier}) + ". "
    } else if (modifier == 1) {
      modifiedBy = game.i18n.localize("CYPHERSYSTEM.Eased") + ". "
    } else if (modifier == -1) {
      modifiedBy = game.i18n.localize("CYPHERSYSTEM.Hindered") + ". "
    } else if (modifier < -1) {
      modifiedBy = game.i18n.format("CYPHERSYSTEM.HinderedBySteps", {amount: Math.abs(modifier)}) + ". "
    }
  }

  // Determine bars
  let bars = (info != "") ?
    info + '<hr class="hr-chat">' :
    '<hr class="hr-chat">';

  // Determine result with bonus/penalty
  let bonusResult = parseInt(roll.result) + parseInt(bonus);
  let operator = (bonus < 0) ? "-" : "+";
  let resultInfo = (bonus != 0 && bonus != "") ? game.i18n.localize("CYPHERSYSTEM.Result") + ": " + bonusResult + " [" + roll.result + operator + Math.abs(bonus) + "]" + "<br>" : "";

  // Add initiative result
  let initiativeResult = parseInt(roll.total) + (parseInt(modifier) * 3) + parseInt(bonus);
  let initiativeInfo = (initiativeRoll) ? "<br>" + game.i18n.localize("CYPHERSYSTEM.Initiative") + ": " + initiativeResult : "";

  // Add reroll button
  let actorID = (actor) ? actor.id : "";
  let teen = (actor.system.basic.unmaskedForm == "Teen") ? true : false;
  let reRollButton = `<a class='reroll-stat' title='${game.i18n.localize("CYPHERSYSTEM.Reroll")}' data-title='${title}' data-info='${info}' data-modifier='${modifier}' data-initiative='${initiativeRoll}' data-actor='${actorID}' data-user='${game.user.id}' data-bonus='${bonus}' data-cost='${totalCost}' data-pool='${pool}' data-teen='${teen}'><i class="fas fa-dice-d20" style="width: 12px"></i></a>`

  // Add regain points button
  let regainPointsButton = "";
  if (totalCost > 0 && roll.result == 20 && (pool == "might" || pool == "speed" || pool == "intellect")) {
    regainPointsButton = `<a class='regain-points' title='${game.i18n.localize("CYPHERSYSTEM.RegainPoints")}' data-user='${game.user.id}' data-actor='${actorID}' data-cost='${totalCost}' data-pool='${pool}' data-teen='${teen}'><i class="fas fa-coins"></i> </a>`
  }

  // Put buttons together
  let chatButtons = `<div class="chat-card-buttons" data-actor="${actorID}">` + regainPointsButton + reRollButton + `</div>`;

  // Put it all together into the chat flavor
  let flavor = "<b>" + title + "</b>" + bars + resultInfo + modifiedBy + game.i18n.localize("CYPHERSYSTEM.RollBeatDifficulty") + " " + difficultyResult + initiativeInfo + "<br>" + effect + chatButtons;

  // Create chat message
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({actor: actor}),
    flavor: flavor,
    flags: {"itemID": itemID}
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