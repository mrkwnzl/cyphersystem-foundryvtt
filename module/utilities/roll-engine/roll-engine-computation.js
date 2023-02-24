import {payPoolPoints} from "../actor-utilities.js";
import {rollEngineForm} from "./roll-engine-form.js";
import {useEffectiveDifficulty} from "./roll-engine-main.js";
import {rollEngineOutput} from "./roll-engine-output.js";

export async function rollEngineComputation(data) {
  let actor = fromUuidSync(data.actorUuid);

  // Roll dice
  data.roll = await new Roll("1d20").evaluate({async: true});

  // Check for effort
  data.effortTotal = data.effortToEase + data.effortOtherUses + data.effortDamage;
  if (data.effortTotal > actor.system.basic.effort) {
    return ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.SpendTooMuchEffort"));
  }

  // Determine impaired & debilitated status
  if (data.teen) {
    if (actor.system.teen.combat.damage.damageTrack == "Impaired" && actor.system.teen.combat.damage.applyImpaired) data.impairedStatus = true;
    if (actor.system.teen.combat.damage.damageTrack == "Debilitated" && actor.system.teen.combat.damage.applyDebilitated) data.impairedStatus = true;
  } else if (!data.teen) {
    if (actor.system.combat.damageTrack.state == "Impaired" && actor.system.combat.damageTrack.applyImpaired) data.impairedStatus = true;
    if (actor.system.combat.damageTrack.state == "Debilitated" && actor.system.combat.damageTrack.applyDebilitated) data.impairedStatus = true;
  } else {
    data.impairedStatus = false;
  }

  // Calculate damage
  data.damageEffort = data.damagePerLOE * data.effortDamage;
  data.totalDamage = data.damage + data.damageEffort;

  data.damageEffect = 0;
  if (data.roll.total >= 17 && !data.impairedStatus) {
    data.damageEffect = data.roll.total - 16;
  } else if (data.roll.total >= 17 && data.impairedStatus) {
    data.damageEffect = 1;
  }

  data.damageWithEffect = data.totalDamage + data.damageEffect;

  // Calculate total cost
  data.impaired = (data.impairedStatus) ? data.effortTotal : 0;
  data.armorCost = (data.pool == "Speed") ? data.effortTotal * actor.system.combat.armor.costTotal : 0;
  data.costCalculated = (data.effortTotal > 0) ? (data.effortTotal * 2) + 1 + data.poolPointCost + data.armorCost + data.impaired : data.poolPointCost;

  // Pay pool points
  let payPoolPointsInfo = [];
  if (!data.reroll || data.pool == "Pool") {
    payPoolPointsInfo = await payPoolPoints(actor, data.costCalculated, data.pool, data.teen);
  } else if (data.reroll) {
    let edge = actor.system.pools[data.pool.toLowerCase()].edge;
    payPoolPointsInfo = [true, Math.max(0, data.costCalculated - edge), edge];
  }
  data.costTotal = payPoolPointsInfo[1];
  data.edge = payPoolPointsInfo[2];

  // Calculate roll modifiers
  if (data.easedOrHindered == "hindered") data.difficultyModifier = data.difficultyModifier * -1;
  data.difficultyModifierTotal = data.skillLevel + data.assets + data.effortToEase + data.difficultyModifier;

  // Calculate rollTotal
  data.rollTotal = data.roll.total + data.bonus;

  // Calculate difficulty
  data.difficulty = (data.rollTotal < 0) ? Math.ceil(data.rolltotal / 3) : Math.floor(data.rollTotal / 3);
  data.difficultyResult = determineDifficultyResult(data.baseDifficulty, data.difficulty, data.difficultyModifierTotal);
  data.finalDifficulty = (useEffectiveDifficulty(data.baseDifficulty)) ? data.baseDifficulty : Math.max(data.baseDifficulty - data.difficultyModifierTotal, 0);

  // Go to next step
  if (payPoolPointsInfo[0]) {
    rollEngineOutput(data);
  } else if (!payPoolPointsInfo[0] && !data.skipDialog) {
    rollEngineForm(data);
  }
}

function determineDifficultyResult(baseDifficulty, difficulty, difficultyModifierTotal) {
  if (useEffectiveDifficulty(baseDifficulty)) {
    let operator = (difficultyModifierTotal < 0) ? "-" : "+";
    let effectiveDifficulty = difficulty + difficultyModifierTotal;
    if (effectiveDifficulty < 0) effectiveDifficulty = 0;
    return effectiveDifficulty + " [" + difficulty + operator + Math.abs(difficultyModifierTotal) + "]";
  } else {
    if (difficulty < 0) difficulty = 0;
    return difficulty + " (" + difficulty * 3 + ")";
  }
}