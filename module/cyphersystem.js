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

// Import utility functions
import { preloadHandlebarsTemplates } from "./utilities/handlebar-templates.js";
import {
  deleteChatMessage,
  applyXPFromIntrusion,
  giveAdditionalXP
} from "./utilities/actor-utilities.js";
import { sendWelcomeMessage } from "./utilities/welcome-message.js";
import { createCyphersystemMacro } from "./utilities/create-macros.js";

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
  removeBarBrawlSettings,
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
  calculateAttackDifficulty,
  recursionMacro,
  tagMacro,
  renameTagMacro,
  disasterModeMacro
} from "./macros/macros.js";
import {
  diceRoller,
  easedRollEffectiveMacro,
  hinderedRollEffectiveMacro
} from "./macros/macro-helper.js";
import {
  chatCardMarkItemIdentified,
  chatCardProposeIntrusion,
  chatCardAskForIntrusion,
  chatCardIntrusionAccepted,
  chatCardIntrusionRefused,
  chatCardWelcomeMessage
} from "./utilities/chat-cards.js";
import { barBrawlOverwrite } from "./utilities/token-utilities.js";

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
    removeBarBrawlSettings,
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
    calculateAttackDifficulty,
    recursionMacro,
    tagMacro,
    renameTagMacro,
    disasterModeMacro,

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
    default: true,
    config: true
  });

  game.settings.register("cyphersystem", "diceTray", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingDiceTray"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingDiceTrayHint"),
    scope: "world",
    type: Number,
    default: 0,
    choices: {
      0: game.i18n.localize("CYPHERSYSTEM.SettingDiceTrayDisabled"),
      1: game.i18n.localize("CYPHERSYSTEM.SettingDiceTrayShowLeft"),
      2: game.i18n.localize("CYPHERSYSTEM.SettingDiceTrayShowRight")
    },
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
  game.settings.register("cyphersystem", "cypherIdentification", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingCypherIdentification"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingCypherIdentificationHint"),
    scope: "world",
    type: Number,
    default: 0,
    choices: {
      0: game.i18n.localize("CYPHERSYSTEM.SettingCypherIdentificationAsItem"),
      1: game.i18n.localize("CYPHERSYSTEM.SettingCypherIdentificationAlways"),
      2: game.i18n.localize("CYPHERSYSTEM.SettingCypherIdentificationNever")
    },
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

  game.settings.register("cyphersystem", "barBrawlDefaults", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingBarBrawlDefaults"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingBarBrawlDefaultsHint"),
    scope: "world",
    type: Boolean,
    default: true,
    config: game.modules.has("barbrawl") ? game.modules.get("barbrawl").active : false
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

  // Set an initiative formula for the system
  CONFIG.Combat.initiative = {
    formula: "1d20 + @settings.initiative.initiativeBonus",
    decimals: 0
  };

  Combatant.prototype._getInitiativeFormula = function () {
    let combatant = this.actor;
    if (combatant.data.type == "PC") {
      return "1d20";
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
  Actors.registerSheet("cypher", CypherActorSheetPC, {
    types: ['PC'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassPC"
  });
  Actors.registerSheet("cypher", CypherActorSheetNPC, {
    types: ['NPC'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassNPC"
  });
  Actors.registerSheet("cypher", CypherActorSheetToken, {
    types: ['Token'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassToken"
  });
  Actors.registerSheet("cypher", CypherActorSheetCommunity, {
    types: ['Community'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassCommunity"
  });
  Actors.registerSheet("cypher", CypherActorSheetCompanion, {
    types: ['Companion'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassCompanion"
  });
  Actors.registerSheet("cypher", CypherActorSheetVehicle, {
    types: ['Vehicle'],
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassVehicle"
  });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cypher", CypherItemSheet, {
    makeDefault: true,
    label: "CYPHERSYSTEM.SheetClassItem"
  });

  //Pre-load HTML templates
  preloadHandlebarsTemplates();

  game.socket.on('system.cyphersystem', (data) => {
    if (data.operation === 'deleteChatMessage') deleteChatMessage(data);
    if (data.operation === 'giveAdditionalXP') giveAdditionalXP(data);
  });
});

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

Hooks.on("preCreateItem", function (item) {
  if (item.data.img == "icons/svg/item-bag.svg") {
    item.data.update({ "img": `systems/cyphersystem/icons/items/${item.data.type.toLowerCase()}.svg` })
  }
});

Hooks.on("updateItem", function (item) {
  let description = item.data.data.description.replace("<p></p>", "");
  item.data.update({ "data.description": description });
});

Hooks.on("renderChatMessage", function (message, html, data) {
  // Event Listener to confirm cypher and artifact identification
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
    let initiativeRoll = html.find('.reroll-stat').data('initiative');
    let bonus = html.find('.reroll-stat').data('bonus');
    let actor = game.actors.get(html.find('.reroll-stat').data('actor'));
    diceRoller(title, info, modifier, initiativeRoll, actor, bonus);
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
  if (actor.data.type == "NPC") {
    actor.data.update({
      "token.bar1": { "attribute": "health" },
      "token.bar2": { "attribute": "level" },
      "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER,
      "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL
    });
  }

  if (actor.data.type == "Companion") {
    actor.data.update({
      "token.bar1": { "attribute": "health" },
      "token.bar2": { "attribute": "level" },
      "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER,
      "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL
    });
  }

  if (actor.data.type == "PC" || actor.data.type == "Community") {
    actor.data.update({
      "token.displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
      "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL,
      "token.actorLink": true
    });
  }

  if (actor.data.type == "Token") {
    actor.data.update({
      "token.bar1": { "attribute": "quantity" },
      "token.bar2": { "attribute": "level" },
      "token.displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
      "token.displayBars": CONST.TOKEN_DISPLAY_MODES.ALWAYS,
      "token.disposition": CONST.TOKEN_DISPOSITIONS.NEUTRAL
    });
  }
})

Hooks.on("preCreateToken", function (document, data) {
  if (!data.actorId) return;
  let actor = game.actors.get(data.actorId);

  // Support for Drag Ruler
  if (actor.data.type !== "Token" && actor.data.type !== "Community") {
    document.data.update({ "flags.cyphersystem.toggleDragRuler": true })
  } else {
    document.data.update({ "flags.cyphersystem.toggleDragRuler": false })
  }

  // Support for Bar Brawl
  if (game.modules.get("barbrawl").active && game.settings.get("cyphersystem", "barBrawlDefaults")) {
    barBrawlOverwrite(document, actor);
  }
});

Hooks.on("renderTokenConfig", function (tokenConfig, html, data) {
  if (game.modules.get("barbrawl").active && game.settings.get("cyphersystem", "barBrawlDefaults")) {
    const resource = html.find("a[data-tab='resources']").addClass('hidden-resource-barbrawl');
  }
});

Hooks.on("updateCombat", function () {
  if (game.user.isGM) {
    let combatant = (game.combat.combatant) ? game.combat.combatant.actor : "";

    if (combatant.type == "Token" && combatant.data.data.settings.isCounter == true) {
      let step = (!combatant.data.data.settings.counting) ? -1 : combatant.data.data.settings.counting;
      let newQuantity = combatant.data.data.quantity.value + step;
      combatant.update({ "data.quantity.value": newQuantity });
    }
  }
});

Hooks.on("createCombatant", function (combatant) {
  if (game.user.isGM) {
    let actor = combatant.actor.data;

    if (actor.type == "NPC") {
      combatant.update({ "initiative": (actor.data.level * 3) + actor.data.settings.initiative.initiativeBonus - 0.5 });
    } else if (actor.type == "Community" && !combatant.hasPlayerOwner) {
      combatant.update({ "initiative": (actor.data.rank * 3) + actor.data.settings.initiative.initiativeBonus - 0.5 });
    } else if (actor.type == "Community" && combatant.hasPlayerOwner) {
      combatant.update({ "initiative": (actor.data.rank * 3) + actor.data.settings.initiative.initiativeBonus });
    } else if (actor.type == "Vehicle") {
      combatant.update({ "initiative": (actor.data.level * 3) - 0.5 });
    }
  }
});