// Import actors & items
import { CypherActor } from "./actor/actor.js";
import { CypherItem } from "./item/item.js";

// Import actor & item sheets
import { CypherItemSheet } from "./item/item-sheet.js";
import { CypherActorSheet } from "./actor/actor-sheet.js";
import { CypherActorSheetPC } from "./actor/pc-sheet.js";
import { CypherActorSheetNPC } from "./actor/npc-sheet.js";
import { CypherActorSheetCommunity } from "./actor/community-sheet.js";
import { CypherActorSheetCompanion } from "./actor/companion-sheet.js";
import { CypherActorSheetToken } from "./actor/token-sheet.js";
import { CypherActorSheetVehicle } from "./actor/vehicle-sheet.js";

// Import macros
import {
  quickRollMacro,
  easedRollMacro,
  hinderedRollMacro,
  diceRollMacro,
  recoveryRollMacro,
  spendEffortMacro,
  allInOneRollMacro,
  allInOneRollDialog,
  itemRollMacro,
  toggleDragRuler,
  resetDragRulerDefaults,
  resetBarBrawlDefaults,
  quickStatChange,
  proposeIntrusion,
  changeSymbolForFractions,
  toggleAttacksOnSheet,
  toggleArmorOnSheet,
  translateToRecursion,
  archiveItemsWithTag,
  unarchiveItemsWithTag,
  archiveStatusByTag,
  toggleAlwaysShowDescriptionOnRoll
} from "./macros/macros.js";
import {
  diceRoller,
  easedRollEffectiveMacro,
  hinderedRollEffectiveMacro
} from "./macros/macro-helper.js";
import { itemMacroString } from "./macros/macro-strings.js";
import {
  chatCardMarkItemIdentified,
  chatCardProposeIntrusion,
  chatCardAskForIntrusion,
  chatCardIntrusionAccepted,
  chatCardIntrusionRefused,
  chatCardWelcomeMessage
} from "./chat-cards.js";

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function () {
  console.log("Initializing Cypher System");

  // CONFIG.debug.hooks = true;

  game.cyphersystem = {
    // Actor sheets
    CypherActor,
    CypherItem,
    CypherActorSheet,
    CypherActorSheetPC,
    CypherActorSheetNPC,
    CypherActorSheetCommunity,
    CypherActorSheetCompanion,
    CypherActorSheetVehicle,
    CypherActorSheetToken,

    // Macros
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
    resetDragRulerDefaults,
    resetBarBrawlDefaults,
    quickStatChange,
    proposeIntrusion,
    changeSymbolForFractions,
    toggleAttacksOnSheet,
    toggleArmorOnSheet,
    translateToRecursion,
    archiveItemsWithTag,
    unarchiveItemsWithTag,
    archiveStatusByTag,
    toggleAlwaysShowDescriptionOnRoll,

    // Chat cards
    chatCardMarkItemIdentified,
    chatCardProposeIntrusion,
    chatCardAskForIntrusion,
    chatCardIntrusionAccepted,
    chatCardIntrusionRefused,
    chatCardWelcomeMessage
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

  game.settings.register("cyphersystem", "rollButtons", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingRollButtons"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingRollButtonsHint"),
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

  game.settings.register("cyphersystem", "useSlashForFractions", {
    scope: "world",
    type: Boolean,
    default: true,
    config: false
  });

  game.settings.register("cyphersystem", "alwaysShowDescriptionOnRoll", {
    scope: "world",
    type: Boolean,
    default: false,
    config: false
  });

  // Register HTML-Handlebars
  Handlebars.registerHelper('enrichHTML', (html) => {
    if (!html) return "";
    return TextEditor.enrichHTML(html);
  });

  // Set an initiative formula for the system
  CONFIG.Combat.initiative = {
    formula: "1d20 + @settings.initiative.initiativeBonus",
    decimals: 0
  };

  Combatant.prototype._getInitiativeFormula = function () {
    let combatant = this.actor;
    if (combatant.data.type == "PC") {
      return "1d20 + @settings.initiative.initiativeBonus";
    } else if (combatant.data.type == "NPC" || combatant.data.type == "Companion") {
      return String(combatant.data.data.level * 3) + " + @settings.initiative.initiativeBonus - 0.5";
    } else if (combatant.data.type == "Community" && combatant.hasPlayerOwner) {
      return String(combatant.data.data.rank * 3) + " + @settings.initiative.initiativeBonus";
    } else if (combatant.data.type == "Community" && !combatant.hasPlayerOwner) {
      return String(combatant.data.data.rank * 3) + " + @settings.initiative.initiativeBonus - 0.5";
    } else {
      if (combatant.data.data.level >= 1) {
        return String(combatant.data.data.level * 3) + "- 0.5";
      } else {
        return String(combatant.data.data.level * 3)
      }
    }
  }

  // Define custom Entity classes
  CONFIG.Actor.documentClass = CypherActor;
  CONFIG.Item.documentClass = CypherItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cypher", CypherActorSheetPC, { types: ['PC'], makeDefault: true });
  Actors.registerSheet("cypher", CypherActorSheetNPC, { types: ['NPC'], makeDefault: true });
  Actors.registerSheet("cypher", CypherActorSheetToken, { types: ['Token'], makeDefault: true });
  Actors.registerSheet("cypher", CypherActorSheetCommunity, { types: ['Community'], makeDefault: true });
  Actors.registerSheet("cypher", CypherActorSheetCompanion, { types: ['Companion'], makeDefault: true });
  Actors.registerSheet("cypher", CypherActorSheetVehicle, { types: ['Vehicle'], makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cypher", CypherItemSheet, { makeDefault: true });

  //Pre-load HTML templates
  preloadHandlebarsTemplates();

  game.socket.on('system.cyphersystem', (data) => {
    if (data.operation === 'deleteChatMessage') deleteChatMessage(data);
    if (data.operation === 'giveAdditionalXP') giveAdditionalXP(data);
  });
});

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/cyphersystem/templates/tabs/equipment.html",
    "systems/cyphersystem/templates/tabs/equipment-settings.html",
    "systems/cyphersystem/templates/tabs/skills.html",
    "systems/cyphersystem/templates/tabs/teenSkills.html",
    "systems/cyphersystem/templates/tabs/currenciesUpToThree.html",
    "systems/cyphersystem/templates/tabs/currenciesUpToSix.html",
    "systems/cyphersystem/templates/tabs/abilities.html",
    "systems/cyphersystem/templates/tabs/teenAbilities.html",
    "systems/cyphersystem/templates/tabs/equipment.html",
    "systems/cyphersystem/templates/tabs/ammo.html",
    "systems/cyphersystem/templates/tabs/armor.html",
    "systems/cyphersystem/templates/tabs/armorTotal.html",
    "systems/cyphersystem/templates/tabs/armorWithoutTotal.html",
    "systems/cyphersystem/templates/tabs/artifacts.html",
    "systems/cyphersystem/templates/tabs/cyphers.html",
    "systems/cyphersystem/templates/tabs/materials.html",
    "systems/cyphersystem/templates/tabs/oddities.html",
    "systems/cyphersystem/templates/tabs/teenArmor.html",
    "systems/cyphersystem/templates/tabs/teenAttacks.html",
    "systems/cyphersystem/templates/tabs/attacks.html",
    "systems/cyphersystem/templates/tabs/item-settings.html",
    "systems/cyphersystem/templates/tabs/spells.html",
    "systems/cyphersystem/templates/tabs/abilitiesCategoryTwo.html",
    "systems/cyphersystem/templates/tabs/abilitiesCategoryThree.html",
    "systems/cyphersystem/templates/tabs/abilitiesCategoryFour.html",
    "systems/cyphersystem/templates/tabs/skillsCategoryTwo.html",
    "systems/cyphersystem/templates/tabs/skillsCategoryThree.html",
    "systems/cyphersystem/templates/tabs/skillsCategoryFour.html"
  ];
  return loadTemplates(templatePaths);
}

function deleteChatMessage(data) {
  if (game.user.isGM) game.messages.get(data.messageId).delete();
}

function giveAdditionalXP(data) {
  if (game.user.isGM) {
    let selectedActor = game.actors.get(data.selectedActorId);
    selectedActor.update({ "data.basic.xp": selectedActor.data.data.basic.xp + data.modifier });
  }
}

Hooks.on("canvasReady", function (canvas) {
  console.log(`The canvas was just rendered for scene: ${canvas.scene.id}`);
  for (let t of game.scenes.viewed.tokens) {
    if (t.getFlag("cyphersystem", "toggleDragRuler") !== undefined) {
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

Hooks.once("ready", async function () {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createCyphersystemMacro(data, slot));

  // Update existing characters
  for (let a of game.actors.contents) {
    if (!a.data.data.settings.equipment.cyphersName) a.update({ "data.settings.equipment.cyphersName": "" });
    if (!a.data.data.settings.equipment.artifactsName) a.update({ "data.settings.equipment.artifactsName": "" });
    if (!a.data.data.settings.equipment.odditiesName) a.update({ "data.settings.equipment.odditiesName": "" });
    if (!a.data.data.settings.equipment.materialName) a.update({ "data.settings.equipment.materialName": "" });
    if (a.data.type === "PC" && !a.data.data.settings.equipment.cyphers) a.update({ "data.settings.equipment.cyphers": true });
    if (a.data.type === "Token" && (a.data.data.settings.counting == "Down" || !a.data.data.settings.counting)) a.update({ "data.settings.counting": -1 });
    if (a.data.type === "Token" && a.data.data.settings.counting == "Up") a.update({ "data.settings.counting": 1 });
    if (a.data.type === "PC") {
      if (a.data.data.settings.additionalRecoveries.active) {
        a.update({
          "data.settings.additionalRecoveries.numberOneActionRecoveries": parseInt(a.data.data.settings.additionalRecoveries.howManyRecoveries) + 1,
          "data.settings.additionalRecoveries.active": false
        })
      }
    }
  }

  if (game.settings.get("cyphersystem", "welcomeMessage")) sendWelcomeMessage();
});

function sendWelcomeMessage() {
  ChatMessage.create({
    content: chatCardWelcomeMessage()
  })
}

Hooks.on("preCreateItem", function (item) {
  if (item.data.img == "icons/svg/item-bag.svg") {
    item.data.update({ "img": `systems/cyphersystem/icons/items/${item.data.type.toLowerCase()}.svg` })
  }
});

Hooks.on("renderChatMessage", function (message, html, data) {
  // Event Listener to confirm identification
  html.find('.confirm').click(clickEvent => {
    if (!game.user.isGM) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.OnlyGMCanIdentify"));
    let actor = game.actors.get(html.find('.confirm').data('actor'));
    let item = actor.items.get(html.find('.confirm').data('item'));
    item.update({ "data.identified": true });
    ui.notifications.notify(game.i18n.format("CYPHERSYSTEM.ConfirmIdentification", { item: item.name, actor: actor.name }));
  });

  // Event Listener for rerolls of stat rolls
  html.find('.reroll-stat').click(clickEvent => {
    let user = html.find('.reroll-stat').data('user');
    if (user !== game.user.id) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.WarnRerollUser"));
    let title = html.find('.reroll-stat').data('title');
    let info = html.find('.reroll-stat').data('info');
    let modifier = parseInt(html.find('.reroll-stat').data('modifier'));
    diceRoller(title, info, modifier);
  });

  // Event Listener for rerolls of recovery rolls
  html.find('.reroll-recovery').click(clickEvent => {
    let user = html.find('.reroll-recovery').data('user');
    if (user !== game.user.id) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.WarnRerollUser"));
    let dice = html.find('.reroll-recovery').data('dice');
    recoveryRollMacro("", dice);
  });

  // Event Listener for rerolls of dice rolls
  html.find('.reroll-dice-roll').click(clickEvent => {
    let user = html.find('.reroll-dice-roll').data('user');
    if (user !== game.user.id) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.WarnRerollUser"));
    let dice = html.find('.reroll-dice-roll').data('dice');
    diceRollMacro(dice);
  });

  // Event Listener for description in chat
  html.find('.chat-description').click(clickEvent => {
    const description = html.find('.chat-card-item-description');
    if (description.hasClass("expanded")) {
      description.slideUp();
      description.toggleClass("expanded");
    } else {
      description.slideDown();
      description.toggleClass("expanded");
    }
  });

  // Event Listener for accepting intrusions
  html.find('.accept-intrusion').click(clickEvent => {
    let actor = game.actors.get(html.find('.accept-intrusion').data('actor'));
    if (game.user.data.character != actor.data._id) return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.IntrusionWrongPlayer", { actor: actor.data.name }));

    // Create list of PCs
    let list = "";
    for (let actor of game.actors.contents) {
      if (actor.data.type === "PC" && actor.data._id != html.find('.accept-intrusion').data('actor')) list = list + `<option value=${actor.data._id}>${actor.data.name}</option>`;
    }

    // Create dialog content
    let content = `<div align="center"><label style='display: inline-block; text-align: right'><b>${game.i18n.localize("CYPHERSYSTEM.GiveAdditionalXPTo")}: </b></label>
    <select name='selectPC' id='selectPC' style='width: auto; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>`+ list + `</select></div>`

    // Create dialog
    let d = new Dialog({
      title: game.i18n.localize("CYPHERSYSTEM.GiveAdditionalXP"),
      content: content,
      buttons: {
        apply: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize("CYPHERSYSTEM.Apply"),
          callback: (html) => applyXPFromIntrusion(actor, html.find('#selectPC').val(), data.message._id, 1)
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
          callback: () => { }
        }
      },
      default: "apply",
      close: () => { }
    });
    d.render(true);
  });

  // Event Listener for refusing intrusions
  html.find('.refuse-intrusion').click(clickEvent => {
    let actor = game.actors.get(html.find('.refuse-intrusion').data('actor'));
    if (game.user.data.character != actor.data._id) return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.IntrusionWrongPlayer", { actor: actor.data.name }));
    applyXPFromIntrusion(actor, "", data.message._id, -1)
  });
});

// Function to apply XP when an intrusion is accepted
function applyXPFromIntrusion(actor, selectedActorId, messageId, modifier) {
  actor.update({ "data.basic.xp": actor.data.data.basic.xp + modifier });

  // Emit a socket event
  game.socket.emit('system.cyphersystem', { operation: 'giveAdditionalXP', selectedActorId: selectedActorId, modifier: modifier });
  game.socket.emit('system.cyphersystem', { operation: 'deleteChatMessage', messageId: messageId });

  let content = (modifier == 1) ? chatCardIntrusionAccepted(actor, selectedActorId) : chatCardIntrusionRefused(actor, selectedActorId);

  ChatMessage.create({
    content: content
  })
}

Hooks.once("dragRuler.ready", (SpeedProvider) => {
  class CypherSystemSpeedProvider extends SpeedProvider {
    get colors() {
      return [
        { id: "immediate", default: 0x0000FF, name: "immediate" },
        { id: "short", default: 0x008000, name: "short" },
        { id: "long", default: 0xFFA500, name: "long" },
        { id: "veryLong", default: 0xFF0000, name: "very long" }
      ]
    }

    getRanges(token) {
      let immediate = 0;
      let short = 0;
      let long = 0;
      let veryLong = 0;
      if (token.scene.data.gridUnits == "m" || token.scene.data.gridUnits == "meter" || token.scene.data.gridUnits == "metre" || token.scene.data.gridUnits == game.i18n.localize("CYPHERSYSTEM.UnitDistanceMeter")) {
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
        { range: immediate, color: "immediate" },
        { range: short, color: "short" },
        { range: long, color: "long" },
        { range: veryLong, color: "veryLong" }
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
Hooks.on("preCreateActor", function (actor) {
  // if (!actorData.img) actorData.img = `systems/cyphersystem/icons/actors/${actorData.type.toLowerCase()}.svg`;
  // if (!actorData.Token.img) actorData.Token.img = actorData.img;

  if (actor.data.type == "NPC") {
    actor.data.update({ "token.bar1": { "attribute": "health" } });
    actor.data.update({ "token.bar2": { "attribute": "level" } });
    actor.data.update({ "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER });
    actor.data.update({ "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER });
    actor.data.update({ "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL })
  }

  if (actor.data.type == "Companion") {
    actor.data.update({ "token.bar1": { "attribute": "health" } });
    actor.data.update({ "token.bar2": { "attribute": "level" } });
    actor.data.update({ "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER });
    actor.data.update({ "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER });
    actor.data.update({ "token.disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY })
  }

  if (actor.data.type == "PC" || actor.data.type == "Community") {
    actor.data.update({ "token.displayName": CONST.TOKEN_DISPLAY_MODES.HOVER });
    actor.data.update({ "token.disposition": CONST.TOKEN_DISPOSITIONS.FRIENDLY });
    actor.data.update({ "token.actorLink": true });
  }

  if (actor.data.type == "Token") {
    actor.data.update({ "token.bar1": { "attribute": "quantity" } });
    actor.data.update({ "token.bar2": { "attribute": "level" } });
    actor.data.update({ "token.displayName": CONST.TOKEN_DISPLAY_MODES.HOVER });
    actor.data.update({ "token.displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS });
    actor.data.update({ "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL })
  }
})

Hooks.on("preCreateToken", function (doc, data, options, userId) {
  if (!data.actorId) return;
  let actor = game.actors.get(data.actorId);

  // Support for Drag Ruler
  if (actor.data.type !== "Token" && actor.data.type !== "Community") {
    doc.data.update({ "flags.cyphersystem.toggleDragRuler": true })
  } else {
    doc.data.update({ "flags.cyphersystem.toggleDragRuler": false })
  }

  // Support for Bar Brawl
  if (actor.data.type === "PC") {
    doc.data.update({
      "flags.barbrawl.resourceBars": {
        "bar1": {
          id: "bar1",
          mincolor: "#0000FF",
          maxcolor: "#0000FF",
          position: "bottom-inner",
          attribute: "pools.intellect",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        },
        "bar2": {
          id: "bar2",
          mincolor: "#00FF00",
          maxcolor: "#00FF00",
          position: "bottom-inner",
          attribute: "pools.speed",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        },
        "bar3": {
          id: "bar3",
          mincolor: "#FF0000",
          maxcolor: "#FF0000",
          position: "bottom-inner",
          attribute: "pools.might",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        }
      }
    });
  } else if (actor.data.type === "NPC" || actor.data.type === "Companion") {
    doc.data.update({
      "flags.barbrawl.resourceBars": {
        "bar1": {
          id: "bar1",
          mincolor: "#0000FF",
          maxcolor: "#0000FF",
          position: "top-inner",
          attribute: "level",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        },
        "bar2": {
          id: "bar2",
          mincolor: "#FF0000",
          maxcolor: "#FF0000",
          position: "bottom-inner",
          attribute: "health",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        }
      }
    });
  } else if (actor.data.type === "Community") {
    doc.data.update({
      "flags.barbrawl.resourceBars": {
        "bar1": {
          id: "bar1",
          mincolor: "#0000FF",
          maxcolor: "#0000FF",
          position: "top-inner",
          attribute: "rank",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        },
        "bar2": {
          id: "bar2",
          mincolor: "#0000FF",
          maxcolor: "#0000FF",
          position: "bottom-inner",
          attribute: "infrastructure",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        },
        "bar3": {
          id: "bar3",
          mincolor: "#FF0000",
          maxcolor: "#FF0000",
          position: "bottom-inner",
          attribute: "health",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        }
      }
    });
  } else if (actor.data.type === "Token") {
    doc.data.update({
      "flags.barbrawl.resourceBars": {
        "bar1": {
          id: "bar1",
          mincolor: "#0000FF",
          maxcolor: "#0000FF",
          position: "top-inner",
          attribute: "level",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        },
        "bar2": {
          id: "bar2",
          mincolor: "#FF0000",
          maxcolor: "#FF0000",
          position: "bottom-inner",
          attribute: "quantity",
          visibility: CONST.TOKEN_DISPLAY_MODES.ALWAYS
        }
      }
    });
  }
});

Hooks.on("updateCombat", function () {
  let combatant = game.combat.combatant.actor;

  if (combatant.type == "Token" && combatant.data.data.settings.isCounter == true) {
    let newQuantity = combatant.data.data.quantity.value + combatant.data.data.settings.counting;
    combatant.update({ "data.quantity.value": newQuantity });
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
      flags: { "cyphersystem.itemMacro": true }
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}
