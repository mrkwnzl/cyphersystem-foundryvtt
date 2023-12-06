// export async function archiveItems(actor, taggingData) {
//   // Create tag
//   let tagSymbol = "";
//   if (taggingData.item.type == "tag") {
//     tagSymbol = "#";
//   } else if (taggingData.item.type == "recursion") {
//     tagSymbol = "@";
//   }

//   // Constants & variables
//   const tag = tagSymbol + htmlEscape(regexEscape(taggingData.item.name.toLowerCase().trim()));
//   const disableTag = (taggingData.disableItem) ? tagSymbol + htmlEscape(regexEscape(taggingData.disableItem.name.toLowerCase().trim())) : "";
//   const updates = [];
//   let archiveStatus = (game.keyboard.isModifierActive("Alt")) ? taggingData.item.system.active : !taggingData.item.system.active;

//   // Update tag & recursion archive status
//   updates.push({_id: taggingData.item.id, "system.active": archiveStatus});
//   if (taggingData.disableItem) {
//     updates.push({_id: taggingData.disableItem.id, "system.active": !archiveStatus});
//   }

//   // Go through items
//   for (let item of actor.items) {
//     // Skip tag & recursion items
//     // if (["tag", "recursion"].includes(item.type)) return;

//     // Get item data
//     let name = (!item.name) ? "" : item.name.toLowerCase();
//     let description = (!item.system.description) ? "" : item.system.description.toLowerCase();

//     // Create regex
//     const regTag = new RegExp("(\\s|^|&nbsp;|<.+?>)" + tag + "(\\s|$|&nbsp;|<.+?>)", "gi");
//     const regDisableTag = new RegExp("(\\s|^|&nbsp;|<.+?>)" + disableTag + "(\\s|$|&nbsp;|<.+?>)", "gi");

//     // Check of tags & recursions in items
//     if ((regTag.test(name) || regTag.test(description)) && item.system.settings?.general?.unmaskedForm == "Mask") {
//       updates.push({_id: item.id, "system.archived": !archiveStatus});
//     } else if (taggingData.disableItem && (regDisableTag.test(name) || regDisableTag.test(description)) && item.system.settings?.general?.unmaskedForm == "Mask") {
//       updates.push({_id: item.id, "system.archived": archiveStatus});
//     }
//   }

//   return updates;
// }

export async function archiveItems(actor, taggingData) {
  const updates = [];
  let active = (taggingData.item.type == "recursion" && taggingData.item.system.active) ? taggingData.item.system.active : !taggingData.item.system.active;

  if (game.keyboard.isModifierActive("Alt") && taggingData.item.type == "tag") {
    active = !active;
  } else if (game.keyboard.isModifierActive("Alt") && taggingData.item.type == "recursion") {
    return;
  }

  await taggingData.item.update({"system.active": active});
  if (taggingData.disableItem) {
    await taggingData.disableItem.update({"system.active": !active});
  }

  const activeTags = [];

  for (let tag of actor.items) {
    if (["tag", "recursion"].includes(tag.type) && tag.system.active) {
      activeTags.push(tag._id);
    }
  }

  for (let item of actor.items) {
    // Skip tag & recursion items
    if (!["tag", "recursion"].includes(item.type)) {
      // Create tag & recursion arrays
      let tagArray = (Array.isArray(item.flags?.cyphersystem?.tags)) ? item.flags.cyphersystem.tags : [];
      let recursionArray = (Array.isArray(item.flags?.cyphersystem?.recursions)) ? item.flags.cyphersystem.recursions : [];
      let tagsAndRecursionArray = tagArray.concat(recursionArray);

      // Don’t do anything if no tags are set
      if (tagsAndRecursionArray.length == 0 || item.system.settings?.general?.unmaskedForm == "Teen") continue;

      let tagFound = activeTags.some(r => tagsAndRecursionArray.includes(r));
      updates.push({_id: item.id, "system.archived": !tagFound});
    }
  }

  return updates;
}

export async function applyRecursion(actor, item) {
  // If the character is an unlinked token
  if (actor?.actorLink == false) {
    actor = actor.actor;
  }

  // If the actor is in a compendium
  if (actor?.pack) {
    actor = await game.packs.get(actor.pack).getDocument(actor._id);
  }

  let focus = (game.keyboard.isModifierActive("Alt")) ? actor.system.basic.focus : item.system.basic.focus;

  await actor.update({
    "system.basic.focus": focus,
    "system.basic.additionalSentence": game.i18n.localize("CYPHERSYSTEM.OnRecursion") + " " + item.name,
    "system.settings.general.additionalSentence.active": true
  });

  // Notify about translation
  ui.notifications.info(game.i18n.format("CYPHERSYSTEM.PCTranslatedToRecursion", {actor: actor.name, recursion: item.name}));
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

export async function removeTagFromItem(actor, tagID) {
  for (let item of actor.items) {
    let tagArray = (Array.isArray(item.flags?.cyphersystem?.tags)) ? item.flags.cyphersystem.tags : [];
    let recursionArray = (Array.isArray(item.flags?.cyphersystem?.recursions)) ? item.flags.cyphersystem.recursions : [];

    if (tagArray.includes(tagID)) {
      let index = tagArray.indexOf(tagID);
      tagArray.splice(index, 1);
    }

    if (recursionArray.includes(tagID)) {
      let index = recursionArray.indexOf(tagID);
      recursionArray.splice(index, 1);
    }

    await item.update({
      "flags.cyphersystem.tags": tagArray,
      "flags.cyphersystem.recursions": recursionArray
    });
  }
}