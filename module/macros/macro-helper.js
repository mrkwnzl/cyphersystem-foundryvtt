export function diceRoller(title, info, modifier) {
  // Roll dice
  let roll = new Roll("1d20").roll();
  let difficulty = Math.floor(roll.result / 3);

  // Determine result
  let difficultyResult = determineDifficultyResult(roll, difficulty, modifier);

  // Determine special effect
  let possibleEffects = {
 			"1": "<span style='color:red'><b>" + game.i18n.localize("CYPHERSYSTEM.GMIntrusion") + "</b></span>",
 			"17": "<span style='color:blue'><b>" + game.i18n.localize("CYPHERSYSTEM.OneDamage") + "</b></span>",
 			"18": "<span style='color:blue'><b>" + game.i18n.localize("CYPHERSYSTEM.TwoDamage") + "</b></span>",
 			"19": "<span style='color:green'><b>" + game.i18n.localize("CYPHERSYSTEM.MinorEffectRoll") + "</b></span>",
      "20": "<span style='color:green'><b>" + game.i18n.localize("CYPHERSYSTEM.MajorEffectRoll") + "</b></span>"
 		};
 	let effect = (possibleEffects[roll.result] || "");

  // Determine steps eased/hindered
  let modifiedBy = "";
  if (modifier > 1) {
    modifiedBy = game.i18n.localize("CYPHERSYSTEM.EasedBy") + " " + modifier + " " + game.i18n.localize("CYPHERSYSTEM.Steps") + ". "
  } else if (modifier == 1) {
    modifiedBy = game.i18n.localize("CYPHERSYSTEM.Eased") + ". "
  } else if (modifier == -1) {
    modifiedBy = game.i18n.localize("CYPHERSYSTEM.Hindered") + ". "
  } else if (modifier < -1) {
    modifiedBy = game.i18n.localize("CYPHERSYSTEM.HinderedBy") + " " + Math.abs(modifier) + " " + game.i18n.localize("CYPHERSYSTEM.Steps") + ". "
  }

  // Determine info
  info = (info != "") ?
    "<hr style='margin-top: 1px; margin-bottom: 2px;'>" + info + "<hr style='margin-top: 1px; margin-bottom: 2px;'>" :
    "<hr style='margin-top: 1px; margin-bottom: 2px;'>";

  // Put it all together into the chat flavor
  let flavor = "<b>" + title + "</b>" + info + modifiedBy + game.i18n.localize("CYPHERSYSTEM.RollBeatDifficulty") + " " + difficultyResult + "<br>" + effect;

  // Create chat message
  roll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: flavor
  });
}

function determineDifficultyResult(roll, difficulty, modifier) {
  if (!game.settings.get("cyphersystem", "effectiveDifficulty")) {
    return difficulty;
  } else {
    let operator = (modifier < 0) ? "-" : "+";
    return (difficulty + parseInt(modifier)) + " (" + difficulty + operator + Math.abs(modifier) + ")";
  }
}

export function payPoolPoints(actor, cost, pool){
  pool = pool.toLowerCase();

  if (pool == "might") {
    cost = cost - actor.data.data.pools.mightEdge;
    if (cost < 0) cost = 0;
    if (cost > actor.data.data.pools.might.value) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughMight"));
      return false;
    }
    let newMight = actor.data.data.pools.might.value - cost;
    actor.update({"data.pools.might.value": newMight})
  } else if (pool == "speed") {
    cost = cost - actor.data.data.pools.speedEdge;
    if (cost < 0) cost = 0;
    if (cost > actor.data.data.pools.speed.value) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughSpeed"));
      return false;
    }
    let newSpeed = actor.data.data.pools.speed.value - cost;
    actor.update({"data.pools.speed.value": newSpeed})
  } else if (pool == "intellect") {
    cost = cost - actor.data.data.pools.intellectEdge;
    if (cost < 0) cost = 0;
    if (cost > actor.data.data.pools.intellect.value) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughIntellect"));
      return false;
    }
    let newIntellect = actor.data.data.pools.intellect.value - cost;
    actor.update({"data.pools.intellect.value": newIntellect})
  }

  return true;
}

// Deprecation messages in case someone has old macros in their world
export function easedRollEffectiveMacro() {
  ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.EasedRollEffectiveMacro"))
}

export function hinderedRollEffectiveMacro() {
  ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.HinderedRollEffectiveMacro"))
}
