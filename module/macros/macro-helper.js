/* -------------------------------------------- */
/*  Macro helper                                */
/* -------------------------------------------- */

import {htmlEscape} from "../utilities/html-escape.js";
import {regexEscape} from "../utilities/regex-escape.js";

export function itemRollMacroQuick(actor, itemID, teen) {
  // Find actor and item based on item ID
  const item = actor.items.get(itemID);

  // Set defaults
  let info = "";
  let modifier = 0;
  let pointsPaid = true;
  if (!teen) teen = (actor.system.basic.unmaskedForm == "Teen") ? true : false;

  // Set title
  let itemTypeStrings = {
    "skill": game.i18n.localize("TYPES.Item.skill"),
    "power-shift": game.i18n.localize("ITEM.TypePower Shift"),
    "attack": game.i18n.localize("TYPES.Item.attack"),
    "ability": game.i18n.localize("TYPES.Item.ability"),
    "cypher": game.i18n.localize("TYPES.Item.cypher"),
    "artifact": game.i18n.localize("TYPES.Item.artifact"),
    "ammo": game.i18n.localize("TYPES.Item.ammo"),
    "armor": game.i18n.localize("TYPES.Item.armor"),
    "equipment": game.i18n.localize("TYPES.Item.equipment"),
    "lasting-damage": game.i18n.localize("ITEM.TypeLasting Damage"),
    "material": game.i18n.localize("TYPES.Item.material"),
    "oddity": game.i18n.localize("TYPES.Item.oddity")
  };
  let itemType = (itemTypeStrings[item.type] || "");

  if (item.type == "skill") {
    // Set skill Levels
    let relevantSkill = {
      "Inability": game.i18n.localize("CYPHERSYSTEM.Inability"),
      "Practiced": game.i18n.localize("CYPHERSYSTEM.Practiced"),
      "Trained": game.i18n.localize("CYPHERSYSTEM.Trained"),
      "Specialized": game.i18n.localize("CYPHERSYSTEM.Specialized")
    };
    let skillInfo = (relevantSkill[item.system.basic.rating] || relevantSkill["Practiced"]);

    // Set info
    info = itemType + ". " + game.i18n.localize("CYPHERSYSTEM.Level") + ": " + skillInfo;

    // Determine skill level
    let skillLevels = {
      "Inability": -1,
      "Practiced": 0,
      "Trained": 1,
      "Specialized": 2
    };

    // Set difficulty modifier
    modifier = (skillLevels[item.system.basic.rating] || 0);

  } else if (item.type == "power-shift") {
    // Set info
    info = itemType + ". " + item.system.basic.shifts + ((item.system.basic.shifts == 1) ?
      " " + game.i18n.localize("CYPHERSYSTEM.Shift") :
      " " + game.i18n.localize("CYPHERSYSTEM.Shifts"));

    // Set difficulty modifier
    modifier = item.system.basic.shifts;

  } else if (item.type == "attack") {
    // Set info
    info = itemType + ". " + game.i18n.localize("CYPHERSYSTEM.Damage") + ": " + item.system.basic.damage;

    // Determine whether the roll is eased or hindered
    let modifiedBy = (item.system.basic.modifier == "hindered") ? item.system.basic.steps * -1 : item.system.basic.steps;

    // Determine skill level
    let attackSkill = {
      "Inability": -1,
      "Practiced": 0,
      "Trained": 1,
      "Specialized": 2
    };
    let skillRating = (attackSkill[item.system.basic.skillRating] || 0);

    // Set difficulty modifier
    modifier = skillRating + modifiedBy;

  } else if (item.type == "ability") {
    // Set defaults
    let costInfo = "";

    // Slice possible "+" from cost
    let checkPlus = item.system.basic.cost.slice(-1);
    let pointCost = (checkPlus == "+") ?
      item.system.basic.cost.slice(0, -1) :
      item.system.basic.cost;

    // Check if there is a point cost and prepare costInfo
    if (item.system.basic.cost != "" && item.system.basic.cost != "0") {
      // Determine edge
      let mightEdge = (teen) ? actor.system.teen.pools.might.edge : actor.system.pools.might.edge;
      let speedEdge = (teen) ? actor.system.teen.pools.speed.edge : actor.system.pools.speed.edge;
      let intellectEdge = (teen) ? actor.system.teen.pools.intellect.edge : actor.system.pools.intellect.edge;

      let relevantEdge = {
        "Might": mightEdge,
        "Speed": speedEdge,
        "Intellect": intellectEdge
      };
      let edge = (relevantEdge[item.system.basic.pool] || 0);

      // Determine point cost
      let checkPlus = item.system.basic.cost.slice(-1);
      let pointCostInfo = pointCost - edge;
      if (pointCostInfo < 0) pointCostInfo = 0;

      // Determine pool points
      let relevantPool = {
        "Might": function () {
          return (pointCost != 1) ?
            game.i18n.localize("CYPHERSYSTEM.MightPoints") :
            game.i18n.localize("CYPHERSYSTEM.MightPoint");
        },
        "Speed": function () {
          return (pointCost != 1) ?
            game.i18n.localize("CYPHERSYSTEM.SpeedPoints") :
            game.i18n.localize("CYPHERSYSTEM.SpeedPoint");
        },
        "Intellect": function () {
          return (pointCost != 1) ?
            game.i18n.localize("CYPHERSYSTEM.IntellectPoints") :
            game.i18n.localize("CYPHERSYSTEM.IntellectPoint");
        },
        "Pool": function () {
          return (pointCost != 1) ?
            game.i18n.localize("CYPHERSYSTEM.AnyPoolPoints") :
            game.i18n.localize("CYPHERSYSTEM.AnyPoolPoint");
        },
        "XP": function () {
          return game.i18n.localize("CYPHERSYSTEM.XP");
        }
      };
      let poolPoints = (relevantPool[item.system.basic.pool]() || relevantPool["Pool"]());

      // Determine edge info
      let operator = (edge < 0) ? "+" : "-";
      let edgeInfo = (edge != 0) ? " (" + pointCost + operator + Math.abs(edge) + ")" : "";

      // Put it all together for cost info
      costInfo = ". " + game.i18n.localize("CYPHERSYSTEM.Cost") + ": " + pointCostInfo + edgeInfo + " " + poolPoints;
    }

    // Put everything together for info
    info = itemType + costInfo;

    // Pay pool points and check whether there are enough points
    let payPoolPointsInfo = payPoolPoints(actor, pointCost, item.system.basic.pool, teen);
    pointsPaid = payPoolPointsInfo[0];

  } else if (item.type == "cypher") {
    // Determine level info
    let levelInfo = (item.system.basic.level != "") ?
      ". " + game.i18n.localize("CYPHERSYSTEM.Level") + ": " + item.system.basic.level :
      "";

    // Put it all together for info
    info = itemType + levelInfo;

  } else if (item.type == "artifact") {
    // Determine level info
    let levelInfo = (item.system.basic.level != "") ?
      game.i18n.localize("CYPHERSYSTEM.Level") + ": " + item.system.basic.level + ". " :
      "";

    // Determine depletion info
    let depletionInfo = game.i18n.localize("CYPHERSYSTEM.Depletion") + ": " + item.system.basic.depletion;

    // Put it all together for info
    info = itemType + ". " + levelInfo + depletionInfo;

  } else {
    // Default to simply outputting item type
    info = itemType;
  }

  // Parse to dice roller macro
  if (pointsPaid == true) {
    diceRoller(item.name, info, modifier, 0);
  }
}

export async function renameTag(actor, currentTag, newTag) {

}

export async function toggleTagArchiveStatus(actor, tag, archiveStatus) {
  // Check for PC
  if (!actor || actor.type != "pc") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  if (tag.length == 0) return;

  tag = "#" + htmlEscape(regexEscape(tag.toLowerCase().trim()));

  let updates = [];
  for (let item of actor.items) {
    let name = (!item.name) ? "" : item.name.toLowerCase();
    let description = (!item.system.description) ? "" : item.system.description.toLowerCase();
    if (item.type == "Tag") return;
    let regTag = new RegExp("(\\s|^|&nbsp;|<.+?>)" + tag + "(\\s|$|&nbsp;|<.+?>)", "gi");
    if (regTag.test(name) || regTag.test(description)) {
      updates.push({_id: item.id, "system.archived": archiveStatus});
    }
  }
  await actor.updateEmbeddedDocuments("Item", updates);
}

/* -------------------------------------------- */
/*  Deprecation Messages for old macros         */
/* -------------------------------------------- */

export function easedRollEffectiveMacro() {
  ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ThisMacroHasBeenDeprecated"));
}

export function hinderedRollEffectiveMacro() {
  ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ThisMacroHasBeenDeprecated"));
}

export function archiveStatusByTag() {
  ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ThisMacroHasBeenDeprecated"));
}

export function renameTagMacro(actor, currentTag, newTag) {
  ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ThisMacroHasBeenDeprecated"));
}

export async function translateToRecursion(actor, recursion, focus, mightModifier, speedModifier, intellectModifier, mightEdgeModifier, speedEdgeModifier, intellectEdgeModifier) {
  ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ThisMacroHasBeenDeprecated"));
}



/* -------------------------------------------- */
/*  Dont really want to delete it, yet          */
/* -------------------------------------------- */

// function titleCase(phrase) {
//   const words = phrase.split(" ");
//
//   for (let i = 0; i < words.length; i++) {
//     words[i] = words[i][0].toUpperCase() + words[i].substr(1);
//  }
//
//   return words.join(" ");
//}
