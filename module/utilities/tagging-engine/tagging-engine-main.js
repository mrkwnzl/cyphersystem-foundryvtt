import {changeTagStats, determineUpdateData} from "./tagging-engine-computation.js";

export async function taggingEngineMain(actor, taggingData) {
  taggingData = Object.assign({
    item: undefined,
    disableItem: undefined,
    statChanges: {
      mightModifier: 0,
      mightEdgeModifier: 0,
      speedModifier: 0,
      speedEdgeModifier: 0,
      intellectModifier: 0,
      intellectEdgeModifier: 0
    }
  }, taggingData);

  // Check for PC
  if (!actor || actor.type != "pc") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  // Functions for exclusive
  if (taggingData.item.system.exclusive) {
    for (let item of actor.items) {
      if (item.type == "tag" && item.system.exclusive && item.system.active && item._id != taggingData.item._id) {
        taggingData.disableItem = item;
      }
    }
    if (!game.keyboard.isModifierActive("Alt")) {
      await changeTagStats(actor, taggingData.statChanges);
    }
  }

  // Update actor items
  await actor.updateEmbeddedDocuments("Item", await determineUpdateData(actor, taggingData));
}