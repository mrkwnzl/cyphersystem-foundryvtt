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
      outputArray.push(game.i18n.localize("CYPHERSYSTEM.LighArmor"));
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
}