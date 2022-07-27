import {rollEngineComputation} from "./roll-engine-computation.js";
import {rollEngineForm} from "./roll-engine-form.js";

export async function rollEngineMain(actor, itemID, teen, skipDialog, skipRoll, initiativeRoll, title, pool, skillLevel, assets, effortToEase, effortOtherUses, damage, effortDamage, damagePerLOE, difficultyModifier, easedOrHindered, bonus, poolPointCost) {
  // Check for PC actor
  if (!actor || actor.type != "PC") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  // Check whether pool == XP
  if (pool == "XP" && !skipDialog) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.CantUseAIOMacroWithAbilitiesUsingXP"));

  // Set defaults for functions
  if (!teen) teen = (actor.system.settings.gameMode.currentSheet == "Teen") ? true : false;
  if (!skipDialog) skipDialog = !game.settings.get("cyphersystem", "itemMacrosUseAllInOne");
  skipDialog = (game.keyboard.isModifierActive('Alt')) ? !skipDialog : skipDialog;
  if (!skipRoll) skipRoll = false;
  if (!initiativeRoll) initiativeRoll = (actor.items.get(itemID)) ? actor.items.get(itemID).system.isInitiative : false;
  if (!title) title = "";

  // Set default basic modifiers
  if (!pool) pool = "Pool";
  if (!skillLevel) skillLevel = 0;
  if (skillLevel == "Specialized") skillLevel = 2;
  if (skillLevel == "Trained") skillLevel = 1;
  if (skillLevel == "Practiced") skillLevel = 0;
  if (skillLevel == "Inability") skillLevel = -1;
  if (!assets) assets = 0;
  if (!effortToEase) effortToEase = 0;
  if (!effortOtherUses) effortOtherUses = 0;

  // Set defaults for combat modifiers
  if (!damage) damage = 0;
  if (!effortDamage) effortDamage = 0;
  if (!damagePerLOE) damagePerLOE = 3;

  // Set defaults for additional modifiers
  if (!difficultyModifier) difficultyModifier = 0;
  if (!easedOrHindered) easedOrHindered = (difficultyModifier >= 0) ? "eased" : "hindered";
  if (!bonus) bonus = 0;
  if (!poolPointCost) poolPointCost = 0;

  // Go to the next step after checking whether dialog should be skipped
  if (!skipDialog) {
    rollEngineForm(actor, itemID, teen, skipDialog, skipRoll, initiativeRoll, title, pool, skillLevel, assets, effortToEase, effortOtherUses, damage, effortDamage, damagePerLOE, difficultyModifier, easedOrHindered, bonus, poolPointCost);
  } else if (skipDialog) {
    rollEngineComputation(actor, itemID, teen, skipDialog, skipRoll, initiativeRoll, title, pool, skillLevel, assets, effortToEase, effortOtherUses, damage, effortDamage, damagePerLOE, difficultyModifier, easedOrHindered, bonus, poolPointCost);
  }
}