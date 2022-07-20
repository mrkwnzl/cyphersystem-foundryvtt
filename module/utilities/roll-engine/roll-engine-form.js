import {rollEngineDialogSheet} from "../../forms/roll-engine-dialog-sheet.js";

export async function rollEngineForm(actor, itemID, teen, skipDialog, skipRoll, initiativeRoll, title, pool, skillLevel, assets, effortToEase, effortOtherUses, damage, effortDamage, damagePerLOE, difficultyModifier, easedOrHindered, bonus, poolPointCost) {
  // Create rollEngineForm
  let rollEngineForm = new rollEngineDialogSheet({
    actor: actor,
    itemID: itemID,
    teen: teen,
    skipDialog: skipDialog,
    skipRoll: skipRoll,
    initiativeRoll: initiativeRoll,
    title: title,
    pool: pool,
    skillLevel: skillLevel,
    assets: assets,
    effortToEase: effortToEase,
    effortOtherUses: effortOtherUses,
    damage: damage,
    effortDamage: effortDamage,
    damagePerLOE: damagePerLOE,
    difficultyModifier: difficultyModifier,
    easedOrHindered: easedOrHindered,
    bonus: bonus,
    poolPointCost: poolPointCost
  });

  // Render sheet
  rollEngineForm.render(true);
  try {
    rollEngineForm.bringToTop();
  } catch {
    // Do nothing.
  }
}