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
  // If the character is an unlinked token
  if (actor?.actorLink == false) {
    actor = actor.actor;
  }

  // If the actor is in a compendium
  if (actor?.pack) {
    actor = await game.packs.get(actor.pack).getDocument(actor._id);
  }

  let pool = actor._source.system.pools;
  let multiplier = (statChanges.itemActive) ? -1 : 1;

  await actor.update({
    "system.pools.might.value": pool.might.value + (statChanges.mightModifier * multiplier),
    "system.pools.might.max": pool.might.max + (statChanges.mightModifier * multiplier),
    "system.pools.speed.value": pool.speed.value + (statChanges.speedModifier * multiplier),
    "system.pools.speed.max": pool.speed.max + (statChanges.speedModifier * multiplier),
    "system.pools.intellect.value": pool.intellect.value + (statChanges.intellectModifier * multiplier),
    "system.pools.intellect.max": pool.intellect.max + (statChanges.intellectModifier * multiplier),
    "system.pools.might.edge": pool.might.edge + (statChanges.mightEdgeModifier * multiplier),
    "system.pools.speed.edge": pool.speed.edge + (statChanges.speedEdgeModifier * multiplier),
    "system.pools.intellect.edge": pool.intellect.edge + (statChanges.intellectEdgeModifier * multiplier),
  });
}