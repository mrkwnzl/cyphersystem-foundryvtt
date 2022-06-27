export async function registerHandlebars() {
  Handlebars.registerHelper('enrichHTML', (html) => {
    if (!html) return "";
    return TextEditor.enrichHTML(html);
  });

  Handlebars.registerHelper('log', function (data) {
    console.log(data)
  });

  Handlebars.registerHelper("expanded", function (itemID) {
    if (game.user.expanded != undefined) {
      return game.user.expanded[itemID] == true;
    } else {
      return false;
    }
  });

  Handlebars.registerHelper("recursion", function (actorID, itemID) {
    let actor = game.actors.get(actorID);
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
}