import {htmlEscape} from "../html-escape.js";
import {regexEscape} from "../regex-escape.js";

export async function determineUpdateData(actor, taggingData) {
  // Create tag
  let tagSymbol = "";
  if (taggingData.item.type == "tag") {
    tagSymbol = "#";
  } else if (taggingData.item.type == "recursion") {
    tagSymbol = "@";
  }

  // Constants & variables
  const tag = tagSymbol + htmlEscape(regexEscape(taggingData.item.name.toLowerCase().trim()));
  const disableTag = (taggingData.disableItem) ? tagSymbol + htmlEscape(regexEscape(taggingData.disableItem.name.toLowerCase().trim())) : "";
  const updates = [];
  let archiveStatus = (game.keyboard.isModifierActive("Alt")) ? taggingData.item.system.active : !taggingData.item.system.active;

  // Update tag & recursion archive status
  updates.push({_id: taggingData.item.id, "system.active": archiveStatus});
  if (taggingData.disableItem) {
    updates.push({_id: taggingData.disableItem.id, "system.active": !archiveStatus});
  }

  // Go through items
  for (let item of actor.items) {
    // Skip tag & recursion items
    // if (["tag", "recursion"].includes(item.type)) return;

    // Get item data
    let name = (!item.name) ? "" : item.name.toLowerCase();
    let description = (!item.system.description) ? "" : item.system.description.toLowerCase();

    // Create regex
    const regTag = new RegExp("(\\s|^|&nbsp;|<.+?>)" + tag + "(\\s|$|&nbsp;|<.+?>)", "gi");
    const regDisableTag = new RegExp("(\\s|^|&nbsp;|<.+?>)" + disableTag + "(\\s|$|&nbsp;|<.+?>)", "gi");

    // Check of tags & recursions in items
    if (regTag.test(name) || regTag.test(description)) {
      updates.push({_id: item.id, "system.archived": !archiveStatus});
    } else if (taggingData.disableItem && (regDisableTag.test(name) || regDisableTag.test(description))) {
      updates.push({_id: item.id, "system.archived": archiveStatus});
    }
  }

  return updates;
}

export async function changeTagStats(actor, statChanges) {
  if (actor?.actorLink == false) {
    actor = actor.actor;
  }

  let pool = actor.system.pools;

  let oldMightModifier = (!actor.getFlag("cyphersystem", "tagMightModifier")) ? 0 : actor.getFlag("cyphersystem", "tagMightModifier");
  let oldSpeedModifier = (!actor.getFlag("cyphersystem", "tagSpeedModifier")) ? 0 : actor.getFlag("cyphersystem", "tagSpeedModifier");
  let oldIntellectModifier = (!actor.getFlag("cyphersystem", "tagIntellectModifier")) ? 0 : actor.getFlag("cyphersystem", "tagIntellectModifier");
  let oldMightEdgeModifier = (!actor.getFlag("cyphersystem", "tagMightEdgeModifier")) ? 0 : actor.getFlag("cyphersystem", "tagMightEdgeModifier");
  let oldSpeedEdgeModifier = (!actor.getFlag("cyphersystem", "tagSpeedEdgeModifier")) ? 0 : actor.getFlag("cyphersystem", "tagSpeedEdgeModifier");
  let oldIntellectEdgeModifier = (!actor.getFlag("cyphersystem", "tagIntellectEdgeModifier")) ? 0 : actor.getFlag("cyphersystem", "tagIntellectEdgeModifier");

  await actor.update({
    "system.pools.might.value": pool.might.value + statChanges.mightModifier - oldMightModifier,
    "system.pools.might.max": pool.might.max + statChanges.mightModifier - oldMightModifier,
    "system.pools.speed.value": pool.speed.value + statChanges.speedModifier - oldSpeedModifier,
    "system.pools.speed.max": pool.speed.max + statChanges.speedModifier - oldSpeedModifier,
    "system.pools.intellect.value": pool.intellect.value + statChanges.intellectModifier - oldIntellectModifier,
    "system.pools.intellect.max": pool.intellect.max + statChanges.intellectModifier - oldIntellectModifier,
    "system.pools.might.edge": pool.might.edge + statChanges.mightEdgeModifier - oldMightEdgeModifier,
    "system.pools.speed.edge": pool.speed.edge + statChanges.speedEdgeModifier - oldSpeedEdgeModifier,
    "system.pools.intellect.edge": pool.intellect.edge + statChanges.intellectEdgeModifier - oldIntellectEdgeModifier,
    "flags.cyphersystem.tagMightModifier": statChanges.mightModifier,
    "flags.cyphersystem.tagSpeedModifier": statChanges.speedModifier,
    "flags.cyphersystem.tagIntellectModifier": statChanges.intellectModifier,
    "flags.cyphersystem.tagMightEdgeModifier": statChanges.mightEdgeModifier,
    "flags.cyphersystem.tagSpeedEdgeModifier": statChanges.speedEdgeModifier,
    "flags.cyphersystem.tagIntellectEdgeModifier": statChanges.intellectEdgeModifier
  });
}