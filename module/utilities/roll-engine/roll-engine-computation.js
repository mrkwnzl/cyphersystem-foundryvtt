import { payPoolPoints } from "../actor-utilities.js";
import { rollEngineDialog } from "./roll-engine-dialog.js";
import { rollEngineDiceRoller } from "./roll-engine-dice-roller.js";
import { rollEngineOutput } from "./roll-engine-output.js";

export async function rollEngineComputation(actor, itemID, teen, skipDialog, skipRoll, initiativeRoll, title, pool, skillLevel, assets, effortToEase, effortOtherUses, damage, effortDamage, damagePerLOE, difficultyModifier, easedOrHindered, bonus, poolPointCost) {
  // Check for effort
  let effortTotal = parseInt(effortToEase) + parseInt(effortOtherUses) + parseInt(effortDamage);

  if (effortTotal > actor.data.data.basic.effort) {
    if (!skipDialog) {
      rollEngineDialog(actor, itemID, teen, skipDialog, skipRoll, initiativeRoll, title, pool, skillLevel, assets, effortToEase, effortOtherUses, damage, effortDamage, damagePerLOE, difficultyModifier, easedOrHindered, bonus, poolPointCost);
    };
    return ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.SpendTooMuchEffort"));
  };

  // Determine impaired & debilitated status
  let impairedStatus = false;
  if (actor.data.data.settings.gameMode.currentSheet == "Teen") {
    if (actor.data.data.teen.damage.damageTrack == "Impaired" && actor.data.data.teen.damage.applyImpaired) impairedStatus = true;
    if (actor.data.data.teen.damage.damageTrack == "Debilitated" && actor.data.data.teen.damage.applyDebilitated) impairedStatus = true;
  } else if (actor.data.data.settings.gameMode.currentSheet == "Mask") {
    if (actor.data.data.damage.damageTrack == "Impaired" && actor.data.data.damage.applyImpaired) impairedStatus = true;
    if (actor.data.data.damage.damageTrack == "Debilitated" && actor.data.data.damage.applyDebilitated) impairedStatus = true;
  }

  // Calculate total cost
  let impaired = (impairedStatus) ? effortTotal : 0;
  let armorCost = (pool == "Speed") ? parseInt(effortTotal) * parseInt(actor.data.data.armor.speedCostTotal) : 0;
  let costCalculated = (effortTotal > 0) ? (effortTotal * 2) + 1 + parseInt(poolPointCost) + parseInt(armorCost) + parseInt(impaired) : parseInt(poolPointCost);

  let payPoolPointsInfo = await payPoolPoints(actor, costCalculated, pool, teen);
  let costTotal = payPoolPointsInfo[1];
  let edge = payPoolPointsInfo[2];

  // Calculate roll modifiers
  if (easedOrHindered == "hindered") difficultyModifier = difficultyModifier * -1;
  let difficultyModifierTotal = parseInt(skillLevel) + parseInt(assets) + parseInt(effortToEase) + parseInt(difficultyModifier);

  // Go to next step
  if (payPoolPointsInfo[0]) {
    let rollEngineOutputArray = await rollEngineOutput(actor, itemID, skipRoll, title, pool, skillLevel, assets, effortToEase, effortOtherUses, damage, effortDamage, damagePerLOE, difficultyModifier, easedOrHindered, poolPointCost, costCalculated, costTotal, edge);
    title = rollEngineOutputArray[0];
    let info = rollEngineOutputArray[1];

    if (!skipRoll) {
      rollEngineDiceRoller(actor, itemID, initiativeRoll, title, info, pool, difficultyModifierTotal, bonus, costTotal);
    } else if (skipRoll) {
      rollEnginePayPoints(actor, itemID, title, info);
    }
  } else if (!payPoolPointsInfo[0] && !skipDialog) {
    rollEngineDialog(actor, itemID, teen, skipDialog, skipRoll, initiativeRoll, title, pool, skillLevel, assets, effortToEase, effortOtherUses, damage, effortDamage, damagePerLOE, difficultyModifier, easedOrHindered, bonus, poolPointCost, costCalculated, costTotal, edge);
  }
};

export async function rollEnginePayPoints(actor, itemID, title, info) {
  ChatMessage.create({
    content: "<b>" + title + "</b>" + info,
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    flags: { "itemID": itemID }
  });
}