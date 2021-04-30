// Import Modules
import {CypherActor} from "./actor.js";
import {CypherItem} from "./item.js";
import {CypherItemSheet} from "./item-sheet.js";
import {CypherActorSheet} from "./actor-sheet.js";
import {CypherNPCSheet} from "./NPC-sheet.js";
import {CypherTokenSheet} from "./token-sheet.js";
import {CypherCommunitySheet} from "./community-sheet.js";
import {CypherCompanionSheet} from "./companion-sheet.js";
import {CypherVehicleSheet} from "./vehicle-sheet.js";


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
  Actors.registerSheet("cypher", CypherActorSheet, {types: ['PC'], makeDefault: true});
  Actors.registerSheet("cypher", CypherNPCSheet, {types: ['NPC'], makeDefault: false});
  Actors.registerSheet("cypher", CypherTokenSheet, {types: ['Token'], makeDefault: false});
  Actors.registerSheet("cypher", CypherCommunitySheet, {types: ['Community'], makeDefault: false});
  Actors.registerSheet("cypher", CypherCompanionSheet, {types: ['Companion'], makeDefault: false});
  Actors.registerSheet("cypher", CypherVehicleSheet, {types: ['Vehicle'], makeDefault: false});
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

// Hooks.once("canvasReady", canvas => {
//   console.log("Hallo");
//   for (let t of canvas.tokens.objects.children) {
//
//     console.log(t.getFlag("cyphersystem", "toggleDragRuler"));
//     if (t.getFlag("cyphersystem", "toggleDragRuler") == true) {
//       // do nothing
//     } else {
//       if (t.actor.data.type !== "Token" && t.actor.data.type !== "Vehicle") {
//         t.setFlag("cyphersystem", "toggleDragRuler", true);
//       } else {
//         t.setFlag("cyphersystem", "toggleDragRuler", false);
//       }
//     }
//   }
// });

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createCyphersystemMacro(data, slot));

  // Calculate totalModified for existing characters
  for (let a of game.actors.entities) {
    for (let i of a.data.items) {
      if (i.type == "attack" || i.type == "teen Attack") {
        if (i.data.totalModified == "") {
          let skillRating = 0;
          let modifiedBy = i.data.modifiedBy;
          let totalModifier = 0;
          let totalModified = "";

          if (i.data.skillRating == "Inability") skillRating = -1;
          if (i.data.skillRating == "Trained") skillRating = 1;
          if (i.data.skillRating == "Specialized") skillRating = 2;

          if (i.data.modified == "hindered") modifiedBy = modifiedBy * -1;

          totalModifier = skillRating + modifiedBy;

          if (totalModifier == 1) totalModified = game.i18n.localize("CYPHERSYSTEM.Eased");
		  if (totalModifier >= 2) totalModified = game.i18n.format("CYPHERSYSTEM.EasedBySteps", {amount: totalModifier});
		  if (totalModifier == -1) totalModified = game.i18n.localize("CYPHERSYSTEM.Hindered");
		  if (totalModifier <= -2) totalModified = game.i18n.format("CYPHERSYSTEM.HinderedBySteps", {amount: Math.abs(totalModifier)});

          i.data.totalModified = totalModified;

          a.updateEmbeddedEntity('OwnedItem', i)
        }
      }
    }
    if (!a.data.data.settings.equipment.cyphersName) a.update({"data.settings.equipment.cyphersName": ""});
    if (!a.data.data.settings.equipment.artifactsName) a.update({"data.settings.equipment.artifactsName": ""});
    if (!a.data.data.settings.equipment.odditiesName) a.update({"data.settings.equipment.odditiesName": ""});
    if (!a.data.data.settings.equipment.materialName) a.update({"data.settings.equipment.materialName": ""});
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
      if (token.scene.data.gridUnits == "m" || token.scene.data.gridUnits == "meter" || token.scene.data.gridUnits == "metre" || token.scene.data.gridUnits == "mètre") {
        immediate = 3;
        short = 15;
        long = 30;
        veryLong = 150;
      } else if (token.scene.data.gridUnits == "ft" || token.scene.data.gridUnits == "ft." || token.scene.data.gridUnits == "feet") {
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
  const command = `// Change the defaults for the macro dialog.
// Some values are overwritten by the items and can’t be changed.
// Change the values after the equal sign.
// Keep the quotation marks where there are any.

// What Pool is used to pay the cost?
// Might, Speed, or Intellect?
// Abilities overwrite this value.
let pool = "Might";

// What is the skill level?
// Inability, Practiced, Trained, or Specialized?
// Skills and Attacks overwrite this value.
let skill = "Practiced";

// How many assets do you have?
// 0, 1, or 2?
let assets = 0;

// How many levels of Effort to ease the task?
// 0, 1, 2, 3, 4, 5, or 6?
let effortTask = 0;

// How many levels of Effort for other uses?
// 0, 1, 2, 3, 4, 5, or 6?
let effortOther = 0;

// How many steps is the roll eased or hindered (excl. Effort)?
// Eased: positive value. Hindered: negative value.
// Cannot be changed for Attacks and Power Shifts.
let modifier = 0;

// How many additional Pool points does it cost (excl. Effort)?
// Abilities overwrite this value.
let poolPointCost = 0;

// How much damage?
// Attacks overwrite this value.
let damage = 0;

// How many levels of Effort for extra damage?
// 0, 1, 2, 3, 4, 5, or 6?
let effortDamage = 0;

// How much extra damage per level of Effort?
// Generally, this is 3.
// Area attacks usually only deal 2 points of damage per level.
let damagePerLevel = 3;


// Do not change anything below

game.cyphersystem.itemRollMacro(actor, "${item._id}", pool, skill, assets, effortTask, effortOther, modifier, poolPointCost, damage, effortDamage, damagePerLevel);`;

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
function diceRoller(title, info, modifier) {
  let roll = new Roll("1d20").roll();
  let difficulty = Math.floor(roll.result / 3);
  let difficultyResult = determineDifficultyResult(roll, difficulty, modifier);
  let effect = "";
  let modifiedBy = "";

  if (roll.result == 1) {
    effect = "<span style='color:red'><b>" + game.i18n.localize("CYPHERSYSTEM.GMIntrusion") + "</b></span>";
  } else if (roll.result == 17) {
    effect = "<span style='color:blue'><b>" + game.i18n.localize("CYPHERSYSTEM.OneDamage") + "</b></span>"
  } else if (roll.result == 18) {
    effect = "<span style='color:blue'><b>" + game.i18n.localize("CYPHERSYSTEM.TwoDamage") + "</b></span>"
  } else if (roll.result == 19) {
    effect = "<span style='color:green'><b>" + game.i18n.localize("CYPHERSYSTEM.MinorEffectRoll") + "</b></span>"
  } else if (roll.result == 20) {
    effect = "<span style='color:green'><b>" + game.i18n.localize("CYPHERSYSTEM.MajorEffectRoll") + "</b></span>"
  }

  if (modifier > 1) {
    modifiedBy = game.i18n.localize("CYPHERSYSTEM.EasedBy") + " " + modifier + " " + game.i18n.localize("CYPHERSYSTEM.Steps") + ". "
  } else if (modifier == 1) {
    modifiedBy = game.i18n.localize("CYPHERSYSTEM.Eased") + ". "
  } else if (modifier == -1) {
    modifiedBy = game.i18n.localize("CYPHERSYSTEM.Hindered") + ". "
  } else if (modifier < -1) {
    modifiedBy = game.i18n.localize("CYPHERSYSTEM.HinderedBy") + " " + Math.abs(modifier) + " " + game.i18n.localize("CYPHERSYSTEM.Steps") + ". "
  }

  if (info != "") {
    info = "<hr style='margin-top: 1px; margin-bottom: 2px;'>" + info + "<hr style='margin-top: 1px; margin-bottom: 2px;'>"
  } else {
    info = "<hr style='margin-top: 1px; margin-bottom: 2px;'>"
  }

  let flavor = "<b>" + title + "</b>" + info + modifiedBy + game.i18n.localize("CYPHERSYSTEM.RollBeatDifficulty") + " " + difficultyResult + "<br>" + effect;

  roll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: flavor
  });
}

function determineDifficultyResult(roll, difficulty, modifier) {
  let symbol = "+";

  if (!game.settings.get("cyphersystem", "effectiveDifficulty")) {
    return difficulty;
  } else {
    let difficultyTotal = difficulty + parseInt(modifier);
    if (modifier < 0) {
      symbol = "-"
    }
    return difficultyTotal + " (" + difficulty + symbol + Math.abs(modifier) + ")";
  }
}

// Macros
function quickRollMacro(title) {
  diceRoller(title, "", 0, 0)
}

function easedRollMacro() {
  let d = new Dialog({
    title: game.i18n.localize("CYPHERSYSTEM.EasedStatRoll"),
    content: `<div align="center"><label style='display: inline-block; text-align: right'><b>${game.i18n.localize("CYPHERSYSTEM.EasedBy")}: </b></label>
    <input style='width: 50px; margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=1 data-dtype='Number'/></div>`,
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Roll"),
        callback: (html) => diceRoller(game.i18n.localize("CYPHERSYSTEM.StatRoll"), "", html.find('input').val(), 0)
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
        callback: () => { }
      }
    },
    default: "roll",
    close: () => { }
  });
  d.render(true);
}

function hinderedRollMacro() {
  let d = new Dialog({
    title: game.i18n.localize("CYPHERSYSTEM.HinderedStatRoll"),
    content: `<div align="center"><label style='display: inline-block; text-align: right'><b>${game.i18n.localize("CYPHERSYSTEM.HinderedBy")}: </b></label>
    <input style='width: 50px; margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=1 data-dtype='Number'/></div>`,
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Roll"),
        callback: (html) => diceRoller(game.i18n.localize("CYPHERSYSTEM.StatRoll"), "", html.find('input').val()*-1, 0)
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
        callback: () => { }
      }
    },
    default: "roll",
    close: () => { }
  });
  d.render(true);
}

function easedRollEffectiveMacro() {
  ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.EasedRollEffectiveMacro"))
}

function hinderedRollEffectiveMacro() {
  ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.HinderedRollEffectiveMacro"))
}

function diceRollMacro(dice) {
  if (dice.charAt(0) == "d") dice = "1" + dice;

  let roll = new Roll(dice).roll();

  roll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: "<b>" + dice + " " + game.i18n.localize("CYPHERSYSTEM.Roll") + "</b>"
  });
}

function recoveryRollMacro(actor) {
  if (actor && actor.data.type == "PC") {
    let roll = new Roll(actor.data.data.recoveries.recoveryRoll).roll();

    roll.toMessage({
      speaker: ChatMessage.getSpeaker(),
      flavor: "<b>" + game.i18n.localize("CYPHERSYSTEM.RecoveryRoll") + "</b>"
    });
  } else {
    ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"))
  }
}

function spendEffortMacro(actor) {
  if (actor.data.data.damage.damageTrack == "Debilitated") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.DebilitatedPCEffort"))

  if (actor && actor.data.type == "PC") {
    let d = new Dialog({
      title: game.i18n.localize("CYPHERSYSTEM.SpendEffort"),
      content: `<div align="center">
      <label style='display: inline-block; width: 98px; text-align: right'><b>${game.i18n.localize("CYPHERSYSTEM.Pool")}: </b></label>
      <select name='pool' id='pool' style='width: 98px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
      <option value='Might'>${game.i18n.localize("CYPHERSYSTEM.Might")}</option><option value='Speed'>${game.i18n.localize("CYPHERSYSTEM.Speed")}</option>
      <option value='Intellect'>${game.i18n.localize("CYPHERSYSTEM.Intellect")}</option>
      </select><br>
      <label style='display: inline-block; width: 98px; text-align: right'><b>${game.i18n.localize("CYPHERSYSTEM.LevelOfEffort")}: </b></label>
      <input name='level' id='level' style='width: 98px; margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=1 data-dtype='Number'/></div>`,
      buttons: {
        roll: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("CYPHERSYSTEM.Apply"),
          callback: (html) => applyToPool(html.find('select').val(), html.find('input').val())
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
          callback: () => { }
        }
      },
      default: "roll",
      close: () => { }
    });
    d.render(true);

    function applyToPool(pool, level) {
      let cost;
      let impaired = 0;

      if (actor.data.data.damage.damageTrack == "Impaired") impaired = level;

      if (pool == "Might") {
        cost = (level * 2) + 1 + parseInt(impaired);
      } else if (pool == "Intellect") {
        cost = (level * 2) + 1 + parseInt(impaired);
      } else if (pool == "Speed") {
        cost = (level * 2) + 1 + (level * actor.data.data.armor.speedCostTotal) + parseInt(impaired);
      }

      payPoolPoints(actor, cost, pool);
    }
  } else {
    ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"))
  }
}

function allInOneRollMacro(actor, title, info, cost, pool, modifier) {
  if (!actor || actor.data.type != "PC") {
    return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"))
  }

  if (actor.data.data.damage.damageTrack == "Debilitated") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.DebilitatedPCEffort"))

  const pointsPaid = payPoolPoints(actor, cost, pool);
  if (pointsPaid == true) diceRoller(title, info, modifier);
}

function payPoolPoints(actor, cost, pool){
  pool = pool.toLowerCase();

  if (pool == "might") {
    cost = cost - actor.data.data.pools.mightEdge;
    if (cost < 0) cost = 0;
    if (cost > actor.data.data.pools.might.value) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughMight"));
      return false;
    }
    let newMight = actor.data.data.pools.might.value - cost;
    actor.update({"data.pools.might.value": newMight})
  } else if (pool == "speed") {
    cost = cost - actor.data.data.pools.speedEdge;
    if (cost < 0) cost = 0;
    if (cost > actor.data.data.pools.speed.value) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughSpeed"));
      return false;
    }
    let newSpeed = actor.data.data.pools.speed.value - cost;
    actor.update({"data.pools.speed.value": newSpeed})
  } else if (pool == "intellect") {
    cost = cost - actor.data.data.pools.intellectEdge;
    if (cost < 0) cost = 0;
    if (cost > actor.data.data.pools.intellect.value) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughIntellect"));
      return false;
    }
    let newIntellect = actor.data.data.pools.intellect.value - cost;
    actor.update({"data.pools.intellect.value": newIntellect})
  }

  return true;
}

function allInOneRollDialog(actor, pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE) {
  if (!actor || actor.data.type != "PC") {
    return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"))
  }

  if (actor.data.data.damage.damageTrack == "Debilitated") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.DebilitatedPCEffort"))

  if (!damage) damage = 0;
  if (!damagePerLOE) damagePerLOE = 3;

  let d = new Dialog({
    title: game.i18n.localize("CYPHERSYSTEM.AllInOneRoll"),
    content: createContent(actor, pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE),
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Roll"),
        callback: (html) => {
          applyToMacro(html.find('#pool').val(), html.find('#skill').val(), html.find('#assets').val(), html.find('#effort1').val(), html.find('#effort2').val(), html.find('#additionalCost').val(), html.find('#additionalSteps').val(), html.find('#stepModifier').val(), title, html.find('#damage').val(), html.find('#effort3').val(), html.find('#damagePerLOE').val());
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
        callback: () => { }
      }
    },
    default: "roll",
    close: () => { }
  });
  d.render(true);

  function applyToMacro(pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE) {
    let cost = parseInt(additionalCost);
    let effort = parseInt(effort1) + parseInt(effort2) + parseInt(effort3);
    if (stepModifier == "hindered") additionalSteps = parseInt(additionalSteps) * -1;
    let modifier = parseInt(skill) + parseInt(assets) + parseInt(effort1) + parseInt(additionalSteps);
    let skillRating = game.i18n.localize("CYPHERSYSTEM.Practiced");
    let steps = " " + game.i18n.localize("CYPHERSYSTEM.Steps");
    let points = " " + game.i18n.localize("CYPHERSYSTEM.Points");
    let rollEffort = " " + game.i18n.localize("CYPHERSYSTEM.levels");
    let otherEffort = " " + game.i18n.localize("CYPHERSYSTEM.levels");
    let damageEffortLevel = " " + game.i18n.localize("CYPHERSYSTEM.levels");
    let attackModifier = "";
    let damageEffort = parseInt(damagePerLOE) * parseInt(effort3);
    let totalDamage = parseInt(damage) + parseInt(damageEffort);

    if (skill == 2) skillRating = game.i18n.localize("CYPHERSYSTEM.Specialized");
    if (skill == 1) skillRating = game.i18n.localize("CYPHERSYSTEM.Trained");
    if (skill == -1) skillRating = game.i18n.localize("CYPHERSYSTEM.Inability");

    if (effort > actor.data.data.basic.effort) {
      additionalSteps = Math.abs(additionalSteps);
      allInOneRollDialog(actor, pool, skillRating, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier);
      return ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.SpendTooMuchEffort"));
    }

    let armorCost = 0;

    if (pool == "Speed") armorCost = parseInt(effort) * parseInt(actor.data.data.armor.speedCostTotal);

    let edge = 0;

    if (pool == "Might") {
      edge = actor.data.data.pools.mightEdge;
    } else if (pool == "Speed") {
      edge = actor.data.data.pools.speedEdge;
    } else if (pool == "Intellect") {
      edge = actor.data.data.pools.intellectEdge;
    }

    let impaired = 0;

    if (actor.data.data.damage.damageTrack == "Impaired") impaired = effort;

    if (effort > 0) {
      cost = (effort * 2) + 1 + parseInt(additionalCost) + parseInt(armorCost) + parseInt(impaired);
    } else {
      cost = parseInt(additionalCost);
    }

    let totalCost = cost - edge;
    if (totalCost < 0) totalCost = 0;

    if (pool == "Might" && totalCost > actor.data.data.pools.might.value || pool == "Speed" && totalCost > actor.data.data.pools.speed.value || pool == "Intellect" && totalCost > actor.data.data.pools.intellect.value) {
      additionalSteps = Math.abs(additionalSteps);
      allInOneRollDialog(actor, pool, skillRating, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier);
      return ui.notifications.notify(game.i18n.format("CYPHERSYSTEM.NotEnoughPoint", {pool: pool}));
    }

    if (additionalSteps == 1 || additionalSteps == -1) steps = " " + game.i18n.localize("CYPHERSYSTEM.Step");

    if (cost == 1) points = " " + game.i18n.localize("CYPHERSYSTEM.Point");

    if (title == "") title = pool + " " + game.i18n.localize("CYPHERSYSTEM.Roll");

    if (effort1 == 1) rollEffort = " " + game.i18n.localize("CYPHERSYSTEM.level");

    if (effort2 == 1) otherEffort = " " + game.i18n.localize("CYPHERSYSTEM.level");

    if (damageEffort == 1) damageEffortLevel = " " + game.i18n.localize("CYPHERSYSTEM.level");

    if (damage != 0 || effort3 != 0) {
      attackModifier = "<hr style='margin-top: 1px; margin-bottom: 2px;'>" + game.i18n.localize("CYPHERSYSTEM.EffortForDamage") + ": " + effort3 + damageEffortLevel + "<br>" + game.i18n.localize("CYPHERSYSTEM.Damage") + ": " + totalDamage + " (" + damage + "+" + damageEffort + ")" + "<hr style='margin-top: 1px; margin-bottom: 2px;'>";
    } else {
      attackModifier = "<hr style='margin-top: 1px; margin-bottom: 2px;'>"
    }

    let info = game.i18n.localize("CYPHERSYSTEM.SkillLevel") + ": " + skillRating + "<br>" + game.i18n.localize("CYPHERSYSTEM.Assets") + ": " + assets + "<br>" + game.i18n.localize("CYPHERSYSTEM.EffortForTask") + ": " + effort1 + rollEffort + "<br>" + game.i18n.localize("CYPHERSYSTEM.EffortForOther") + ": " + effort2 + otherEffort + attackModifier + game.i18n.localize("CYPHERSYSTEM.Difficulty") + ": " + titleCase(stepModifier) + " " + game.i18n.localize("CYPHERSYSTEM.By") + " " + Math.abs(additionalSteps) + " " + game.i18n.localize("CYPHERSYSTEM.Additional") + " " + steps + "<br>" + game.i18n.localize("CYPHERSYSTEM.TotalCost") + ": " + totalCost + " " + pool + points

    allInOneRollMacro(actor, title, info, cost, pool, modifier);
  }
}

function createContent(actor, pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE) {
  let content = `<div align="center">
  <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.BasicModifiers")}</b></label><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Pool")}:</label>
  <select name='pool' id='pool' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value='Might' ${(pool == "Might" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Might")}</option>
  <option value='Speed' ${(pool == "Speed" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Speed")}</option>
  <option value='Intellect' ${(pool == "Intellect" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Intellect")}</option>
  </select><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}:</label>
  <select name='skill' id='skill' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  {{#select skill}}
  <option value=-1 ${(skill == "Inability" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Inability")}</option>
  <option value=0 ${(skill == "Practiced" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Practiced")}</option>
  <option value=1 ${(skill == "Trained" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Trained")}</option>
  <option value=2 ${(skill == "Specialized" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Specialized")}</option>
  {{/select}}
  </select><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Assets")}:</label>
  <select name='assets' id='assets' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value=0 ${(assets == 0 ? "selected" : "")}>0</option>
  <option value=1 ${(assets == 1 ? "selected" : "")}>1</option>
  <option value=2 ${(assets == 2 ? "selected" : "")}>2</option>
  </select><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.EffortForTask")}:</label>
  <select name='effort1' id='effort1' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value=0 ${(effort1 == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.None")}</option>
  <option value=1 ${(effort1 == 1 ? "selected" : "")}>1 ${game.i18n.localize("CYPHERSYSTEM.Level")}</option>
  <option value=2 ${(effort1 == 2 ? "selected" : "")}>2 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=3 ${(effort1 == 3 ? "selected" : "")}>3 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=4 ${(effort1 == 4 ? "selected" : "")}>4 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=5 ${(effort1 == 5 ? "selected" : "")}>5 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=6 ${(effort1 == 6 ? "selected" : "")}>6 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  </select><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.EffortForOther")}:</label>
  <select name='effort2' id='effort2' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value=0 ${(effort2 == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.None")}</option>
  <option value=1 ${(effort2 == 1 ? "selected" : "")}>1 ${game.i18n.localize("CYPHERSYSTEM.Level")}</option>
  <option value=2 ${(effort2 == 2 ? "selected" : "")}>2 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=3 ${(effort2 == 3 ? "selected" : "")}>3 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=4 ${(effort2 == 4 ? "selected" : "")}>4 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=5 ${(effort2 == 5 ? "selected" : "")}>5 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=6 ${(effort2 == 6 ? "selected" : "")}>6 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  </select><br>
  <hr>
  <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.AttackModifiers")}</b></label><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Damage")}:</label>
  <input name='damage' id='damage' type='number' value=${damage} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center'/><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.EffortForDamage")}:</label>
  <select name='effort3' id='effort3' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value=0 ${(effort3 == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.None")}</option>
  <option value=1 ${(effort3 == 1 ? "selected" : "")}>1 ${game.i18n.localize("CYPHERSYSTEM.Level")}</option>
  <option value=2 ${(effort3 == 2 ? "selected" : "")}>2 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=3 ${(effort3 == 3 ? "selected" : "")}>3 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=4 ${(effort3 == 4 ? "selected" : "")}>4 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=5 ${(effort3 == 5 ? "selected" : "")}>5 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=6 ${(effort3 == 6 ? "selected" : "")}>6 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  </select><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.DamageLevelEffort")}:</label>
  <input name='damagePerLOE' id='damagePerLOE' type='number' value=${damagePerLOE} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center'/><br>
  <hr>
  <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.AdditionalModifiers")}</b></label><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Difficulty")}:</label>
  <select name='stepModifier' id='stepModifier' style='height: 26px; width: 110px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value='eased' ${(stepModifier == 'eased' ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.EasedBy")}</option>
  <option value='hindered' ${(stepModifier == 'hindered' ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.HinderedBy")}</option>
  </select>
  <input name='additionalSteps' id='additionalSteps' type='number' value=${additionalSteps} style='width: 57px; margin-left: 0px; margin-bottom: 5px; text-align: center'/><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.PoolCost")}:</label>
  <input name='additionalCost' id='additionalCost' type='number' value=${additionalCost} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center'/><br>
  <hr>
  <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.CharacterInfo")}</b></label><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Effort")}:</label>
  <input name='effort' id='effort' type='number' value=${actor.data.data.basic.effort} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.MightPoolEdge")}:</label>
  <input name='might' id='might' type='text' value='${actor.data.data.pools.might.value}/${actor.data.data.pools.might.max} (${actor.data.data.pools.mightEdge})' style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.SpeedPoolEdge")}:</label>
  <input name='speed' id='speed' type='text' value='${actor.data.data.pools.speed.value}/${actor.data.data.pools.speed.max} (${actor.data.data.pools.speedEdge})' style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.IntellectPoolEdge")}:</label>
  <input name='intellect' id='intellect' type='text' value='${actor.data.data.pools.intellect.value}/${actor.data.data.pools.intellect.max} (${actor.data.data.pools.intellectEdge})' style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
  </div>
  `;
  return content;
}

function titleCase (phrase) {
  const words = phrase.split(" ");

  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }

  return words.join(" ");
}

function itemRollMacro (actor, itemID, pool, skill, assets, effort1, effort2, additionalSteps, additionalCost, damage, effort3, damagePerLOE) {
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
    if (!skill) skill = game.i18n.localize("CYPHERSYSTEM.Practiced");
    if (!assets) assets = 0;
    if (!effort1) effort1 = 0;
    if (!effort2) effort2 = 0;
    if (!effort3) effort3 = 0;
    if (!additionalCost) additionalCost = 0;
    if (!additionalSteps) additionalSteps = 0;
    if (!damage) damage = 0;
    if (!pool) pool = game.i18n.localize("CYPHERSYSTEM.Might");
    if (!damagePerLOE) damagePerLOE = 3;

    let stepModifier = (additionalSteps < 0) ? game.i18n.localize("CYPHERSYSTEM.Hindered") : game.i18n.localize("CYPHERSYSTEM.Eased");

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
  if (!token) {
    return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.SelectAToken"))
  }
  if (!game.modules.get("drag-ruler").active) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ActivateDragRuler"));

  if (!token.data.flags.cyphersystem.toggleDragRuler) {
    token.setFlag("cyphersystem", "toggleDragRuler", true)
    ui.notifications.info(game.i18n.format("CYPHERSYSTEM.EnabledDragRuler", {name: token.name}));
  } else if (token.data.flags.cyphersystem.toggleDragRuler) {
    token.setFlag("cyphersystem", "toggleDragRuler", false)
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
  ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.AllTokenDragRuler"))
}
