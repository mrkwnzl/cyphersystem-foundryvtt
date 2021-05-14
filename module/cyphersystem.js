// Import actors & items
import {CypherActor} from "./actor/actor.js";
import {CypherItem} from "./item/item.js";

// Import actor & item sheets
import {CypherItemSheet} from "./item/item-sheet.js";
import {CypherActorSheet} from "./actor/actor-sheet.js";
import {CypherActorSheetPC} from "./actor/pc-sheet.js";
import {CypherActorSheetNPC} from "./actor/npc-sheet.js";
import {CypherActorSheetCommunity} from "./actor/community-sheet.js";
import {CypherActorSheetCompanion} from "./actor/companion-sheet.js";
import {CypherActorSheetToken} from "./actor/token-sheet.js";
import {CypherActorSheetVehicle} from "./actor/vehicle-sheet.js";

// Import macros
import {
  quickRollMacro,
  easedRollMacro,
  hinderedRollMacro,
  diceRollMacro,
  recoveryRollMacro,
  spendEffortMacro,
  allInOneRollMacro,
  allInOneRollDialog
} from "./macros/macros.js";
import {
  easedRollEffectiveMacro,
  hinderedRollEffectiveMacro
} from "./macros/macro-helper.js";


/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log("Initializing Cypher System");

  // CONFIG.debug.hooks = true;

  game.cyphersystem = {
    CypherActor,
    CypherItem,
    quickRollMacro,
    easedRollMacro,
    hinderedRollMacro,
    easedRollEffectiveMacro,
    hinderedRollEffectiveMacro,
    diceRollMacro,
    recoveryRollMacro,
    spendEffortMacro,
    itemRollMacro,
    allInOneRollMacro,
    allInOneRollDialog,
    toggleDragRuler,
    resetDragRulerDefaults
  };

  // Register system settings
  game.settings.register("cyphersystem", "effectiveDifficulty", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingRollMacro"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingRollMacroHint"),
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });

  game.settings.register("cyphersystem", "itemMacrosUseAllInOne", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingMacroAllInOne"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingMacroAllInOneHint"),
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });

  game.settings.register("cyphersystem", "welcomeMessage", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingShowWelcome"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingShowWelcomeHint"),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  // Set an initiative formula for the system
  CONFIG.Combat.initiative = {
    formula: "1d20 + @settings.initiative.initiativeBonus",
    decimals: 0
  };
  Combat.prototype._getInitiativeFormula = _getInitiativeFormula;

  // Define custom Entity classes
  CONFIG.Actor.entityClass = CypherActor;
  CONFIG.Item.entityClass = CypherItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cypher", CypherActorSheetPC, {types: ['PC'], makeDefault: true});
  Actors.registerSheet("cypher", CypherActorSheetNPC, {types: ['NPC'], makeDefault: false});
  Actors.registerSheet("cypher", CypherActorSheetToken, {types: ['Token'], makeDefault: false});
  Actors.registerSheet("cypher", CypherActorSheetCommunity, {types: ['Community'], makeDefault: false});
  Actors.registerSheet("cypher", CypherActorSheetCompanion, {types: ['Companion'], makeDefault: false});
  Actors.registerSheet("cypher", CypherActorSheetVehicle, {types: ['Vehicle'], makeDefault: false});
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cypher", CypherItemSheet, {makeDefault: true});

  //Pre-load HTML templates
  preloadHandlebarsTemplates();
});

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/cyphersystem/templates/equipment.html",
    "systems/cyphersystem/templates/equipment-settings.html",
    "systems/cyphersystem/templates/skills.html",
    "systems/cyphersystem/templates/skillsSortedByRating.html",
    "systems/cyphersystem/templates/teenSkills.html",
    "systems/cyphersystem/templates/teenSkillsSortedByRating.html",
    "systems/cyphersystem/templates/currenciesUpToThree.html",
    "systems/cyphersystem/templates/currenciesUpToSix.html",
    "systems/cyphersystem/templates/abilities.html",
    "systems/cyphersystem/templates/teenAbilities.html",
    "systems/cyphersystem/templates/equipment.html",
    "systems/cyphersystem/templates/ammo.html",
    "systems/cyphersystem/templates/armor.html",
    "systems/cyphersystem/templates/armorTotal.html",
    "systems/cyphersystem/templates/armorWithoutTotal.html",
    "systems/cyphersystem/templates/artifacts.html",
    "systems/cyphersystem/templates/cyphers.html",
    "systems/cyphersystem/templates/materials.html",
    "systems/cyphersystem/templates/oddities.html",
    "systems/cyphersystem/templates/teenArmor.html"
  ];
  return loadTemplates(templatePaths);
}

Hooks.on("canvasReady", canvas => {
  console.log(`The canvas was just rendered for scene: ${canvas.scene._id}`);
  for (let t of canvas.tokens.objects.children) {
    if (t.getFlag("cyphersystem", "toggleDragRuler")) {
      // do nothing
    } else {
      if (t.actor.data.type !== "Token" && t.actor.data.type !== "Vehicle") {
        t.setFlag("cyphersystem", "toggleDragRuler", true);
      } else {
        t.setFlag("cyphersystem", "toggleDragRuler", false);
      }
    }
  }
});

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createCyphersystemMacro(data, slot));

  // Update existing characters
  for (let a of game.actors.entities) {
    if (!a.data.data.settings.equipment.cyphersName) a.update({"data.settings.equipment.cyphersName": ""});
    if (!a.data.data.settings.equipment.artifactsName) a.update({"data.settings.equipment.artifactsName": ""});
    if (!a.data.data.settings.equipment.odditiesName) a.update({"data.settings.equipment.odditiesName": ""});
    if (!a.data.data.settings.equipment.materialName) a.update({"data.settings.equipment.materialName": ""});
    if (!a.data.data.settings.equipment.cyphers && a.type === "PC") a.update({"data.settings.equipment.cyphers": true});
  }

  // Fix for case-sensitive OSs
  for (let a of game.actors.entities) {
    for (let i of a.data.items) {
      if (i.img == `systems/cyphersystem/icons/items/${i.type}.svg` || i.img == `icons/svg/mystery-man.svg`) i.img = `systems/cyphersystem/icons/items/${i.type.toLowerCase()}.svg`;
      a.updateEmbeddedEntity('OwnedItem', i)
    }
  }

  if (game.settings.get("cyphersystem", "welcomeMessage")) sendWelcomeMessage();
});

function sendWelcomeMessage() {
  let message = "<p style='margin:5px 0 5px 0; text-align:center'><b>" + game.i18n.localize("CYPHERSYSTEM.WelcomeMessage") + "</b></p><p style='text-align:center'><a href='https://github.com/mrkwnzl/cyphersystem-foundryvtt/wiki/Getting-Started'>" + game.i18n.localize("CYPHERSYSTEM.GettingStarted") + "</a> | <a href='https://github.com/mrkwnzl/cyphersystem-foundryvtt/wiki'>" + game.i18n.localize("CYPHERSYSTEM.UserManual") + "</a> | <a href='https://github.com/mrkwnzl/cyphersystem-foundryvtt'>GitHub</a></p>";
  ChatMessage.create({
    content: message
  })
}

Hooks.on("preCreateItem", (itemData) => {
  if (!itemData.img) itemData.img = `systems/cyphersystem/icons/items/${itemData.type.toLowerCase()}.svg`;
});

Hooks.on("preCreateOwnedItem", (actor, itemData) => {
  if (!itemData.img) itemData.img = `systems/cyphersystem/icons/items/${itemData.type.toLowerCase()}.svg`;
});

Hooks.on("updateOwnedItem", (actor, itemData) => {

});

const _getInitiativeFormula = function(combatant) {
  if (combatant.actor.data.type == "PC") {
    return "1d20 + @settings.initiative.initiativeBonus";
  } else if (combatant.actor.data.type == "NPC" || combatant.actor.data.type == "Companion") {
    return String(combatant.actor.data.data.level * 3) + " + @settings.initiative.initiativeBonus - 0.5";
  } else if (combatant.actor.data.type == "Community") {
    return String(combatant.actor.data.data.rank * 3) + " + @settings.initiative.initiativeBonus";
  } else {
    return String(combatant.actor.data.data.level * 3) + "- 0.5";
  }
}

Hooks.once("dragRuler.ready", (SpeedProvider) => {
  class CypherSystemSpeedProvider extends SpeedProvider {
    get colors() {
      return [
        {id: "immediate", default: 0x0000FF, name: "immediate"},
        {id: "short", default: 0x008000, name: "short"},
        {id: "long", default: 0xFFA500, name: "long"},
        {id: "veryLong", default: 0xFF0000, name: "very long"}
      ]
    }

    getRanges(token) {
      let immediate = 0;
      let short = 0;
      let long = 0;
      let veryLong = 0;
      if (token.scene.data.gridUnits == "m" || token.scene.data.gridUnits == "meter" || token.scene.data.gridUnits == "metre" || token.scene.data.gridUnits == "mètre" || token.scene.data.gridUnits == game.i18n.localize("CYPHERSYSTEM.UnitDistanceMeter")) {
        immediate = 3;
        short = 15;
        long = 30;
        veryLong = 150;
      } else if (token.scene.data.gridUnits == "ft" || token.scene.data.gridUnits == "ft." || token.scene.data.gridUnits == "feet" || token.scene.data.gridUnits == game.i18n.localize("CYPHERSYSTEM.UnitDistanceFeet")) {
        immediate = 10;
        short = 50;
        long = 100;
        veryLong = 500;
      }

      const ranges = [
        {range: immediate, color: "immediate"},
        {range: short, color: "short"},
        {range: long, color: "long"},
        {range: veryLong, color: "veryLong"}
      ]
      return ranges
    }

    get defaultUnreachableColor() {
      return 0x000000
    }

    usesRuler(token) {
      if (token.data.flags.cyphersystem.toggleDragRuler) {
        return true
      } else {
        return false
      }
    }
  }

  dragRuler.registerSystem("cyphersystem", CypherSystemSpeedProvider)
})

/**
* Set default values for new actors' tokens
*/
Hooks.on("preCreateActor", (actorData) => {
  // if (!actorData.img) actorData.img = `systems/cyphersystem/icons/actors/${actorData.type.toLowerCase()}.svg`;
  // if (!actorData.Token.img) actorData.Token.img = actorData.img;

  if (actorData.type == "NPC")
  mergeObject(actorData, {
    "token.bar1": {"attribute": "health"},
    "token.bar2": {"attribute": "level"},
    "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
    "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
    "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL
  })

  if (actorData.type == "Companion")
  mergeObject(actorData, {
    "token.bar1": {"attribute": "health"},
    "token.bar2": {"attribute": "level"},
    "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
    "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
    "token.disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
    "token.actorLink": true
  })

  if (actorData.type == "PC" || actorData.type == "Community")
  mergeObject(actorData, {
    "token.displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
    "token.disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY,
    "token.actorLink": true
  })

  if (actorData.type == "Token")
  mergeObject(actorData, {
    "token.displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
    "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL
  })
})

Hooks.on("preCreateToken", function(_scene, data) {
  if (!data.actorId) return;
  let actor = game.actors.get(data.actorId);

  // Support for Drag Ruler
  if (actor.data.type !== "Token" && actor.data.type !== "Community") {
    setProperty(data, "flags.cyphersystem.toggleDragRuler", true)
    console.log("HERE!");
  } else {
    setProperty(data, "flags.cyphersystem.toggleDragRuler", false)
  }

  // Support for Bar Brawl
  if (actor.data.type === "PC") {
    setProperty(data, "flags.barbrawl.resourceBars", {
      "bar1": {
        id: "bar1",
        mincolor: "#0000FF",
        maxcolor: "#0000FF",
        position: "bottom-inner",
        attribute: "pools.intellect",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      },
      "bar2": {
        id: "bar2",
        mincolor: "#00FF00",
        maxcolor: "#00FF00",
        position: "bottom-inner",
        attribute: "pools.speed",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      },
      "bar3": {
        id: "bar3",
        mincolor: "#FF0000",
        maxcolor: "#FF0000",
        position: "bottom-inner",
        attribute: "pools.might",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      }
    })
  } else if (actor.data.type === "NPC" || actor.data.type === "NPC") {
    setProperty(data, "flags.barbrawl.resourceBars", {
      "bar1": {
        id: "bar1",
        mincolor: "#0000FF",
        maxcolor: "#0000FF",
        position: "top-inner",
        attribute: "level",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      },
      "bar2": {
        id: "bar2",
        mincolor: "#FF0000",
        maxcolor: "#FF0000",
        position: "bottom-inner",
        attribute: "health",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      }
    })
  } else if (actor.data.type === "Community") {
    setProperty(data, "flags.barbrawl.resourceBars", {
      "bar1": {
        id: "bar1",
        mincolor: "#0000FF",
        maxcolor: "#0000FF",
        position: "top-inner",
        attribute: "rank",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      },
      "bar2": {
        id: "bar2",
        mincolor: "#0000FF",
        maxcolor: "#0000FF",
        position: "bottom-inner",
        attribute: "infrastructure",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      },
      "bar3": {
        id: "bar3",
        mincolor: "#FF0000",
        maxcolor: "#FF0000",
        position: "bottom-inner",
        attribute: "health",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      }
    })
  }
});

Hooks.on("updateCombat", function() {
  let combatant = game.combat.combatant;

  if (combatant.actor.data.type == "Token" && combatant.actor.data.data.settings.isCounter == true && combatant.actor.data.data.settings.counting == "down") {
    let token = canvas.tokens.get(combatant.tokenId);
    let newQuantity = token.actor.data.data.quantity.value - 1;
    token.actor.update({"data.quantity.value": newQuantity});
  } else if (combatant.actor.data.type == "Token" && combatant.actor.data.data.settings.isCounter == true && combatant.actor.data.data.settings.counting == "up") {
    let token = canvas.tokens.get(combatant.tokenId);
    let newQuantity = token.actor.data.data.quantity.value + 1;
    token.actor.update({"data.quantity.value": newQuantity});
  }
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
* Create a Macro from an Item drop.
* Get an existing item macro if one exists, otherwise create a new one.
* @param {Object} data     The dropped data
* @param {number} slot     The hotbar slot to use
* @returns {Promise}
*/
async function createCyphersystemMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.CanOnlyCreateMacroForOwnedItems"));
  const item = data.data;

  // Create the macro command
  const command = itemMacroString(item._id);

  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: {"cyphersystem.itemMacro": true}
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/* -------------------------------------------- */
/*  Macros                                      */
/* -------------------------------------------- */

// Background functions
function titleCase(phrase) {
  const words = phrase.split(" ");

  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }

  return words.join(" ");
}

// Macros
function itemRollMacro(actor, itemID, pool, skill, assets, effort1, effort2, additionalSteps, additionalCost, damage, effort3, damagePerLOE) {
  const owner = game.actors.find(actor => actor.items.get(itemID));
  let pointsPaid = true;

  if (!actor || actor.data.type != "PC") {
    return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.MacroOnlyUsedBy", {name: owner.name}))
  }

  const item = actor.getOwnedItem(itemID);

  if (item == null) {
    return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.MacroOnlyUsedBy", {name: owner.name}))
  }

  if (game.settings.get("cyphersystem", "itemMacrosUseAllInOne")) {
    if (!skill) skill = "Practiced";
    if (!assets) assets = 0;
    if (!effort1) effort1 = 0;
    if (!effort2) effort2 = 0;
    if (!effort3) effort3 = 0;
    if (!additionalCost) additionalCost = 0;
    if (!additionalSteps) additionalSteps = 0;
    if (!damage) damage = 0;
    if (!pool) pool = "Might";
    if (!damagePerLOE) damagePerLOE = 3;

    let stepModifier = (additionalSteps < 0) ? "hindered" : "eased";

    if (item.type == "skill" || item.type == "teen Skill") {
      skill = item.data.data.skillLevel;
    }

    if (item.type == "power Shift") {
      additionalSteps = item.data.data.powerShiftValue;
    }

    if (item.type == "attack" || item.type == "teen Attack") {
      skill = item.data.data.skillRating;
      additionalSteps = item.data.data.modifiedBy;
      stepModifier = item.data.data.modified;
      damage = item.data.data.damage;
    }

    if (item.type == "ability" || item.type == "teen Ability") {
      pool = item.data.data.costPool;
      let checkPlus = item.data.data.costPoints.slice(-1)
      if (checkPlus == "+") {
        let cost = item.data.data.costPoints.slice(0, -1);
        additionalCost = parseInt(cost);
      } else {
        let cost = item.data.data.costPoints;
        additionalCost = parseInt(cost);
      }
    }

    allInOneRollDialog(actor, pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, item.name, damage, effort3, damagePerLOE)
  } else {
    itemRollMacroQuick(actor, itemID);
  }
}

function itemRollMacroQuick (actor, itemID) {
  const owner = game.actors.find(actor => actor.items.get(itemID));
  const item = actor.getOwnedItem(itemID);

  let info = "";
  let modifier = 0;
  let pointsPaid = true;

  if (item.type == "skill" || item.type == "teen Skill") {
    info = titleCase(item.type) + ". " + game.i18n.localize("CYPHERSYSTEM.Level") + ": " + item.data.data.skillLevel;
    if (item.data.data.skillLevel == game.i18n.localize("CYPHERSYSTEM.Inability")) modifier = -1;
    if (item.data.data.skillLevel == game.i18n.localize("CYPHERSYSTEM.Trained")) modifier = 1;
    if (item.data.data.skillLevel == game.i18n.localize("CYPHERSYSTEM.Specialized")) modifier = 2;
  } else if (item.type == "power Shift") {
    let name = game.i18n.localize("CYPHERSYSTEM.PowerShifts");
    let shifts = (item.data.data.powerShiftValue == 1) ? " " + game.i18n.localize("CYPHERSYSTEM.Shift") : " " + game.i18n.localize("CYPHERSYSTEM.Shifts");
    if (actor.data.data.settings.powerShifts.powerShiftsName != 0) {
      name = actor.data.data.settings.powerShifts.powerShiftsName.slice(0, -1);
    }
    info = name + ". " + item.data.data.powerShiftValue + shifts;
    modifier = item.data.data.powerShiftValue;
  } else if (item.type == "attack" || item.type == "teen Attack") {
    let modifiedBy = item.data.data.modifiedBy;
    info = titleCase(item.type) + ". " + game.i18n.localize("CYPHERSYSTEM.Damage") + ": " + item.data.data.damage;
    if (item.data.data.modified == "hindered") modifiedBy = item.data.data.modifiedBy * -1;
    let skillRating = 0;
    if (item.data.data.skillRating == game.i18n.localize("CYPHERSYSTEM.Inability")) skillRating = -1;
    if (item.data.data.skillRating == game.i18n.localize("CYPHERSYSTEM.Trained")) skillRating = 1;
    if (item.data.data.skillRating == game.i18n.localize("CYPHERSYSTEM.Specialized")) skillRating = 2;
    modifier = skillRating + modifiedBy;
  } else if (item.type == "ability" || item.type == "teen Ability") {
    let cost = "";
    let pointCost;
    if (item.data.data.costPoints != "" && item.data.data.costPoints != "0") {
      let points = " " + game.i18n.localize("CYPHERSYSTEM.Points");
      let edge;
      let edgeText = "";
      if (item.data.data.costPool == "Might") {
        edge = actor.data.data.pools.mightEdge;
      } else if (item.data.data.costPool == "Speed") {
        edge = actor.data.data.pools.speedEdge;
      } else if (item.data.data.costPool == "Intellect") {
        edge = actor.data.data.pools.intellectEdge;
      }
      pointCost = item.data.data.costPoints - edge;
      if (pointCost < 0) pointCost = 0;
      if (item.data.data.costPoints == "1") points = " " + game.i18n.localize("CYPHERSYSTEM.Point");
      if (edge > 0) edgeText = " (" + item.data.data.costPoints + "-" + edge + ") ";
      cost = ". " + game.i18n.localize("CYPHERSYSTEM.Cost") + ": " + item.data.data.costPoints + edgeText + " " + item.data.data.costPool + points;
    }
    info = titleCase(item.type) + cost
    pointsPaid = payPoolPoints(actor, item.data.data.costPoints, item.data.data.costPool)
  } else if (item.type == "cypher") {
    let level = "";
    if (item.data.data.level != "") level = " " + game.i18n.localize("CYPHERSYSTEM.Level") + ": " + item.data.data.level;
    info = "Cypher." + level;
  } else if (item.type == "artifact") {
    let level = "";
    if (item.data.data.level != "") level = " " + game.i18n.localize("CYPHERSYSTEM.Level") + ": " + item.data.data.level + ".";
    info = game.i18n.localize("CYPHERSYSTEM.Artifact") + "." + level + " " + game.i18n.localize("CYPHERSYSTEM.Depletion") + ": " + item.data.data.depletion;
  } else {
    info = titleCase(item.type)
  }

  if (pointsPaid == true) {
    diceRoller(item.name, info, modifier, 0);
  }
}

function toggleDragRuler(token) {
  if (!game.modules.get("drag-ruler").active) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ActivateDragRuler"));
  if (!token) {
    return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.SelectAToken"))
  }

  if (!token.data.flags.cyphersystem.toggleDragRuler) {
    token.setFlag("cyphersystem", "toggleDragRuler", true);
    ui.notifications.info(game.i18n.format("CYPHERSYSTEM.EnabledDragRuler", {name: token.name}));
  } else if (token.data.flags.cyphersystem.toggleDragRuler) {
    token.setFlag("cyphersystem", "toggleDragRuler", false);
    ui.notifications.info(game.i18n.format("CYPHERSYSTEM.DisabledDragRuler", {name: token.name}));
  }
}

function resetDragRulerDefaults() {
  if (!game.modules.get("drag-ruler").active) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ActivateDragRuler"));
  for (let t of canvas.tokens.objects.children) {
    if (t.actor.data.type !== "Token" && t.actor.data.type !== "Vehicle") {
      t.setFlag("cyphersystem", "toggleDragRuler", true);
    } else {
      t.setFlag("cyphersystem", "toggleDragRuler", false);
    }
  }
  ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.AllTokenDragRuler"));
}
