import {updateRollDifficultyForm} from "../../forms/roll-difficulty-sheet.js";
import {rollEngineComputation} from "./roll-engine-computation.js";
import {rollEngineForm} from "./roll-engine-form.js";

export async function rollEngineMain(data) {
  data = Object.assign({
    actorUuid: undefined,
    itemID: undefined,
    teen: undefined,
    skipDialog: !game.settings.get("cyphersystem", "itemMacrosUseAllInOne"),
    skipRoll: false,
    initiativeRoll: false,
    reroll: false,
    gmiRange: undefined,
    title: "",
    baseDifficulty: undefined,
    pool: "Pool",
    skillLevel: 0,
    assets: 0,
    effortToEase: 0,
    effortOtherUses: 0,
    damage: 0,
    effortDamage: 0,
    damagePerLOE: 0,
    difficultyModifier: 0,
    easedOrHindered: "eased",
    bonus: 0,
    poolPointCost: 0
  }, data);

  // Find actor
  if (!data.actorUuid) data.actorUuid = game.user.character?.uuid;
  let actor = (data.actorUuid) ? fromUuidSync(data.actorUuid) : undefined;

  // Find item
  let item = (actor && data.itemID) ? actor.items.get(data.itemID) : undefined;

  // Check for PC actor
  if (!actor || actor.type != "pc") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  // Skip dialog?
  if (game.keyboard.isModifierActive('Alt')) data.skipDialog = !data.skipDialog;
  if (actor.getFlag("cyphersystem", "multiRoll.active")) data.skipDialog = false;
  if (data.reroll) data.skipDialog = true;

  // Check whether pool == XP
  if (data.pool == "XP" && !data.skipDialog) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.CantUseAIOMacroWithAbilitiesUsingXP"));

  if (!data.baseDifficulty) {
    data.baseDifficulty = game.settings.get("cyphersystem", "rollDifficulty");
  }

  // Set defaults for functions
  if (data.teen === undefined) {
    data.teen = (actor.system.basic.unmaskedForm == "Teen") ? true : false;
  }

  data.initiativeRoll = (item) ? item.system.settings.general.initiative : false;

  // Fallback for empty data
  if (!data.poolPointCost) {
    data.poolPointCost = 0;
  }
  if (!data.bonus) {
    data.bonus = 0;
  }
  if (!data.difficultyModifier) {
    data.difficultyModifier = 0;
  }
  if (!data.damage) {
    data.damage = 0;
  }
  if (!data.damagePerLOE) {
    data.damagePerLOE = 0;
  }

  // Set GMI Range
  if (data.gmiRange === undefined) {
    if (game.settings.get("cyphersystem", "useGlobalGMIRange")) {
      data.gmiRange = game.settings.get("cyphersystem", "globalGMIRange");
    } else if (!game.settings.get("cyphersystem", "useGlobalGMIRange")) {
      data.gmiRange = actor.system.basic.gmiRange;
    }
  }

  // Set default basic modifiers
  if (data.skillLevel == "Specialized") data.skillLevel = 2;
  if (data.skillLevel == "Trained") data.skillLevel = 1;
  if (data.skillLevel == "Practiced") data.skillLevel = 0;
  if (data.skillLevel == "Inability") data.skillLevel = -1;

  // Go to the next step after checking whether dialog should be skipped
  if (!data.skipDialog) {
    rollEngineForm(data);
  } else if (data.skipDialog) {
    rollEngineComputation(data);
  }
}

export function useEffectiveDifficulty(difficulty) {
  let setting = game.settings.get("cyphersystem", "effectiveDifficulty");
  if (setting === 0) {
    return false;
  } else if (setting === 1) {
    return true;
  } else if (setting === 2) {
    if (difficulty == -1) {
      return true;
    } else {
      return false;
    }
  }
}

export async function resetDifficulty() {
  if (game.user.isGM) {
    await game.settings.set("cyphersystem", "rollDifficulty", -1);
    await updateRollDifficultyForm();
    await game.socket.emit("system.cyphersystem", {operation: "updateRollDifficultyForm"});
  }
}