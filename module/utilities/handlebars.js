import {byNameAscending} from "./sorting.js";

export async function registerHandlebars() {
  Handlebars.registerHelper("expanded", function (itemID) {
    if (game.user.expanded != undefined) {
      return game.user.expanded[itemID] == true;
    } else {
      return false;
    }
  });

  Handlebars.registerHelper("recursion", function (actor, itemID) {
    let item = actor.items.get(itemID);
    let actorRecursion = !actor.getFlag("cyphersystem", "recursion") ? "" : actor.getFlag("cyphersystem", "recursion");
    let itemRecursion = "@" + item.name.toLowerCase();
    if (actorRecursion == itemRecursion) {
      return true;
    } else {
      return false;
    }
  });

  Handlebars.registerHelper("sum", function () {
    let sum = 0;
    for (let argument in arguments) {
      if (Number.isInteger(arguments[argument])) sum = sum + arguments[argument];
    }
    return sum;
  });

  Handlebars.registerHelper("enrichedHTMLItems", function (sheetData, type, itemID) {
    if (type == "description") return sheetData.enrichedHTML.itemDescription[itemID];
    if (type == "level") return sheetData.enrichedHTML.itemLevel[itemID];
    if (type == "depletion") return sheetData.enrichedHTML.itemDepletion[itemID];
  });

  Handlebars.registerHelper("createAttackNotes", function (item) {
    const outputArray = [];
    let output = "";

    // Add attack type
    if (item.system.basic.type == "light weapon") {
      outputArray.push(game.i18n.localize("CYPHERSYSTEM.LightWeapon"));
    } else if (item.system.basic.type == "medium weapon") {
      outputArray.push(game.i18n.localize("CYPHERSYSTEM.MediumWeapon"));
    } else if (item.system.basic.type == "heavy weapon") {
      outputArray.push(game.i18n.localize("CYPHERSYSTEM.HeavyWeapon"));
    } else if (item.system.basic.type == "artifact") {
      outputArray.push(game.i18n.localize("CYPHERSYSTEM.Artifact"));
    } else if (item.system.basic.type == "special ability") {
      outputArray.push(game.i18n.localize("CYPHERSYSTEM.SpecialAbility"));
    }

    // Add total modified
    if (item.system.totalModified) {
      outputArray.push(item.system.totalModified);
    }

    // Add range
    if (item.system.basic.range) {
      outputArray.push(item.system.basic.range);
    }

    // Add notes
    if (item.system.basic.notes) {
      outputArray.push(item.system.basic.notes);
    }

    // Put everything together in the output
    if (outputArray.length >= 1) {
      output = "(" + outputArray.join(", ") + ")";
    }

    return output;
  });

  Handlebars.registerHelper("createArmorNotes", function (item) {
    const outputArray = [];
    let output = "";

    // Add attack type
    if (item.system.basic.type == "light armor") {
      outputArray.push(game.i18n.localize("CYPHERSYSTEM.LightArmor"));
    } else if (item.system.basic.type == "medium armor") {
      outputArray.push(game.i18n.localize("CYPHERSYSTEM.MediumArmor"));
    } else if (item.system.basic.type == "heavy armor") {
      outputArray.push(game.i18n.localize("CYPHERSYSTEM.HeavyArmor"));
    } else if (item.system.basic.type == "artifact") {
      outputArray.push(game.i18n.localize("CYPHERSYSTEM.Artifact"));
    } else if (item.system.basic.type == "special ability") {
      outputArray.push(game.i18n.localize("CYPHERSYSTEM.SpecialAbility"));
    }

    // Add notes
    if (item.system.basic.notes) {
      outputArray.push(item.system.basic.notes);
    }

    // Put everything together in the output
    if (outputArray.length >= 1) {
      output = "(" + outputArray.join(", ") + ")";
    }

    return output;
  });

  Handlebars.registerHelper("tagOnItem", function (array, value) {
    if (!Array.isArray(array)) array = [];
    if (!value) value = "";
    if (array.includes(value)) {
      return "";
    } else {
      return "tag-inactive";
    }
  });

  Handlebars.registerHelper("activeTags", function (actorSheet, tagIDs, recursionIDs) {
    if (!Array.isArray(tagIDs)) tagIDs = [];
    if (!Array.isArray(recursionIDs)) recursionIDs = [];
    let tagArray = [];
    let recursionArray = [];
    let tagOutput = "";
    let recursionOutput = "";
    let isObserver = (actorSheet.sheetSettings.isObserver) ? "disabled" : "";

    for (let item of actorSheet.items) {
      if (item.type == "tag" && tagIDs.includes(item._id) && actorSheet.actor.system.settings.general.tags.active) {
        tagArray.push(item);
      } else if (item.type == "recursion" && recursionIDs.includes(item._id) && actorSheet.actor.system.settings.general.gameMode == "Strange") {
        recursionArray.push(item);
      }
    }

    tagArray.sort(byNameAscending);
    recursionArray.sort(byNameAscending);

    for (let tag of tagArray) {
      let inactive = (!tag.system.active) ? "tag-inactive" : "";
      let exclusive = (tag.system.exclusive) ? "<i class='fas fa-exclamation'></i>" : "";
      let title = (tag.system.active) ? game.i18n.format("CYPHERSYSTEM.ArchiveItemsWithTag", {tag: tag.name}) : game.i18n.format("CYPHERSYSTEM.UnarchiveItemsWithTag", {tag: tag.name});
      tagOutput = tagOutput + `<a class="tag-items toggle-tag ${inactive} ${isObserver}" data-item-id="${tag._id}" title="${title}">` + exclusive + `<i class="fas fa-hashtag"></i> ${tag.name}</a> `;
    }

    for (let recursion of recursionArray) {
      let inactive = (!recursion.system.active) ? "tag-inactive" : "";
      let title = game.i18n.format("CYPHERSYSTEM.TranslateToRecursion", {recursion: recursion.name});
      recursionOutput = recursionOutput + `<a class="tag-items toggle-tag ${inactive} ${isObserver}" data-item-id="${recursion._id}" title="${title}"><i class="fas fa-at"></i> ${recursion.name}</a> `;
    }

    if (tagOutput) tagOutput = "<p>" + tagOutput + "</p>";
    if (recursionOutput) recursionOutput = "<p>" + recursionOutput + "</p>";

    return recursionOutput + tagOutput;
  });
}