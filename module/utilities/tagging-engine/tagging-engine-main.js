import {applyRecursion, changeTagStats, archiveItems} from "./tagging-engine-computation.js";

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
      intellectEdgeModifier: 0,
      itemActive: false
    }
  }, taggingData);

  // Check for PC
  if (!actor || actor.type != "pc") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  // Functions for exclusive & Recursions
  if (taggingData.item.type == "tag" && taggingData.item.system?.exclusive) {
    for (let item of actor.items) {
      if (item.type == "tag" && item.system.exclusive && item.system.active && item._id != taggingData.item._id) {
        taggingData.disableItem = item;
      }
    }
  } else if (taggingData.item.type == "recursion") {
    for (let item of actor.items) {
      if (item.type == "recursion" && item.system.active && item._id != taggingData.item._id) {
        taggingData.disableItem = item;
      }
    }
  }

  // Apply recursion
  if (taggingData.item.type == "recursion") {
    applyRecursion(actor, taggingData.item);
  }

  // Update stats
  if (!game.keyboard.isModifierActive("Alt")) {
    if (taggingData.disableItem) {
      let disableItem = taggingData.disableItem.system.settings.statModifiers;
      await changeTagStats(actor, {
        mightModifier: taggingData.statChanges.mightModifier - disableItem.might.value,
        mightEdgeModifier: taggingData.statChanges.mightEdgeModifier - disableItem.might.edge,
        speedModifier: taggingData.statChanges.speedModifier - disableItem.speed.value,
        speedEdgeModifier: taggingData.statChanges.speedEdgeModifier - disableItem.speed.edge,
        intellectModifier: taggingData.statChanges.intellectModifier - disableItem.intellect.value,
        intellectEdgeModifier: taggingData.statChanges.intellectEdgeModifier - disableItem.intellect.edge
      });
    } else if (taggingData.item.type != "recursion" || !taggingData.item.system.active) {
      await changeTagStats(actor, taggingData.statChanges);
    }
  }

  // Update actor items
  await actor.updateEmbeddedDocuments("Item", await archiveItems(actor, taggingData));

  // Create Hooks for toggling Tags
  Hooks.call("enableTag", actor, taggingData.item);
  if (taggingData.disableItem) {
    Hooks.call("disableTag", actor, taggingData.disableItem);
  }
}