import {
  itemMacroString,
  recursionString,
  tagString
} from "../macros/macro-strings.js";

/**
* Create a Macro from an Item drop.
* Get an existing item macro if one exists, otherwise create a new one.
* @param {Object} data     The dropped data
* @param {number} slot     The hotbar slot to use
* @returns {Promise}
*/
export async function createCyphersystemMacro(data, slot) {
  const item = await fromUuid(data.uuid);
  if (!item.isOwned) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.CanOnlyCreateMacroForOwnedItems"));

  // Create the macro command
  let command = "";

  if (item.type == "recursion") {
    command = recursionString(item.actor._id, item._id);
  } else if (item.type == "tag") {
    command = tagString(item.actor._id, item._id);
  } else {
    command = itemMacroString(item._id);
  }

  let macro = await Macro.create({
    name: item.name,
    type: "script",
    img: item.img,
    command: command,
    flags: {"cyphersystem.itemMacro": true}
  });

  game.user.assignHotbarMacro(macro, slot);
}
