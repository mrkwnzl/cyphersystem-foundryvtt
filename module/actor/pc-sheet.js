/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
import { CypherActorSheet } from "./actor-sheet.js";

import {
  recoveryRollMacro,
  diceRollMacro
} from "../macros/macros.js";
import { isExclusiveTagActive } from "../utilities/actor-utilities.js";
import { rollEngineMain } from "../utilities/roll-engine/roll-engine-main.js";
import { disableMultiRoll } from "../forms/roll-engine-dialog-sheet.js";

export class CypherActorSheetPC extends CypherActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body" }],
      scrollY: [".sheet-body", ".tab", ".skills", ".description", ".combat", ".items", ".abilities", ".settings", ".tags", ".editor-content"]
    });
  }


  static DEFAULT_OPTIONS = {
    classes: ["pc"],
    position: {
      width: 650,
      height: 750,
    },
    actions: {
      plusOneDamage: this.#onPlusOneDamage,
      minusOneDamage: this.#onMinusOneDamage,
      plusOneStress: this.#onPlusOneStress,
      minusOneStress: this.#onMinusOneStress,
      plusOneStressLevel: this.#onPlusOneStressLevel,
      minusOneStressLevel: this.#onMinusOneStressLevel,
      plusOneSupernaturalStress: this.#onPlusOneSupernaturalStress,
      minusOneSupernaturalStress: this.#minusOneSupernaturalStress,
      resetStress: this.#resetStress,
      armorActive: this.#armorActive,
      resetPool: this.#onResetPool,
      rollPool: this.#rollPool,
      recoveryRoll: this.#recoveryRoll,
      rollDiceTray: this.#rollDiceTray,
      increaseXp: this.#increaseXp,
      decreaseXp: this.#decreaseXp,
      resetAdvancement: this.#resetAdvancement,
      resetRecoveryRolls: this.#resetRecoveryRolls,
      disableMultiRoll: this.#disableMultiRoll,
      powerShiftTemporary: this.#powerShiftTemporary,
      itemFavorite: this.#itemFavorite,
    }
  }

  static PARTS = {
    pc: { template: "systems/cyphersystem/templates/actor-sheets/pc-sheet.html", scrollable: [".scrollable"] }
  }

  static TABS = {
    primary: {
      tabs: [
        { id: 'skills', cssClass: "item", label: "CYPHERSYSTEM.Skills" }, // not limited
        { id: 'combat', cssClass: "item", label: "CYPHERSYSTEM.Combat" }, // not limited
        { id: 'abilities', cssClass: "item", label: "CYPHERSYSTEM.Abilities" }, // not limited
        { id: 'items', cssClass: "item", label: "CYPHERSYSTEM.Equipment" }, // not limited
        { id: 'notes', cssClass: "item narrow", tooltip: "CYPHERSYSTEM.Notes", icon: "fa-item fa-regular fa-file-pen" },
        { id: 'description', cssClass: "item narrow", tooltip: "CYPHERSYSTEM.Description", icon: "fa-item fa-regular fa-file-circle-info" },
        { id: 'tags', cssClass: "item narrow", tooltip: "CYPHERSYSTEM.Tags", icon: "fa-item fa-solid fa-hashtag" }, // might change to Recursions
        { id: 'settings', cssClass: "item narrow", icon: "fa-item fa-solid fa-gear" } // not limited
      ],
      initial: "skills"
    },
    gm: {
      tabs: [
        { id: 'skills', cssClass: "item", label: "CYPHERSYSTEM.Skills" }, // not limited
        { id: 'combat', cssClass: "item", label: "CYPHERSYSTEM.Combat" }, // not limited
        { id: 'abilities', cssClass: "item", label: "CYPHERSYSTEM.Abilities" }, // not limited
        { id: 'items', cssClass: "item", label: "CYPHERSYSTEM.Equipment" }, // not limited
        { id: 'notes', cssClass: "item narrow", tooltip: "CYPHERSYSTEM.Notes", icon: "fa-item fa-regular fa-file-pen" },
        { id: 'gm-notes', cssClass: "item narrow", tooltip: "CYPHERSYSTEM.GMNotes", icon: "fa-item fa-regular fa-file-shield" },
        { id: 'description', cssClass: "item narrow", tooltip: "CYPHERSYSTEM.Description", icon: "fa-item fa-regular fa-file-circle-info" },
        { id: 'tags', cssClass: "item narrow", tooltip: "CYPHERSYSTEM.Tags", icon: "fa-item fa-solid fa-hashtag" }, // might change to Recursions
        { id: 'settings', cssClass: "item narrow", icon: "fa-item fa-solid fa-gear" } // not limited
      ],
      initial: "skills"
    },
    limited: {
      tabs: [
        { id: 'description', cssClass: "item", label: "CYPHERSYSTEM.Description" }
      ],
      initial: "description"
    }
  }

  /**
  * Additional data preparations
  */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    if (context.sheetSettings.isGM) context.tabs = this._prepareTabs('gm');
    if (context.tabs.tags) {
      if (context.actor.system.settings.general.gameMode === "Strange") {
        context.tabs.tags.icon = "fa-item fa-solid fa-at";
        context.tabs.tags.toolip = "CYPHERSYSTEM.Recursions";
      } else if (!context.actor.system.settings.general.tags.active || context.actor.system.basic.unmaskedForm !== "Mask")
        delete context.tabs.tags;
    }

    const actorData = context.actor;

    // Sheet settings
    context.sheetSettings.rollButtons = game.settings.get("cyphersystem", "rollButtons");
    context.sheetSettings.useAllInOne = game.settings.get("cyphersystem", "itemMacrosUseAllInOne");
    context.sheetSettings.multiRollActive = this.actor.getFlag("cyphersystem", "multiRoll.active");
    context.sheetSettings.multiRollEffort = (this.actor.getFlag("cyphersystem", "multiRoll.active") === true && this.actor.getFlag("cyphersystem", "multiRoll.modifiers.effort") != 0) ? "multi-roll-active" : "";
    context.sheetSettings.multiRollMightEdge = (this.actor.getFlag("cyphersystem", "multiRoll.active") === true && this.actor.getFlag("cyphersystem", "multiRoll.modifiers.might.edge") != 0) ? "multi-roll-active" : "";
    context.sheetSettings.multiRollSpeedEdge = (this.actor.getFlag("cyphersystem", "multiRoll.active") === true && this.actor.getFlag("cyphersystem", "multiRoll.modifiers.speed.edge") != 0) ? "multi-roll-active" : "";
    context.sheetSettings.multiRollIntellectEdge = (this.actor.getFlag("cyphersystem", "multiRoll.active") === true && this.actor.getFlag("cyphersystem", "multiRoll.modifiers.intellect.edge") != 0) ? "multi-roll-active" : "";
    context.sheetSettings.isExclusiveTagActive = isExclusiveTagActive(this.actor);
    const diceTraySettings = ["hidden", "left", "right"];
    context.sheetSettings.diceTray = diceTraySettings[game.settings.get("cyphersystem", "diceTray")];

    context.sheetSettings.disabledStaticStats = (this.actor.getFlag("cyphersystem", "disabledStaticStats") || this.actor.getFlag("cyphersystem", "multiRoll.active")) ? "disabled" : "";

    // Select options
    context.unmaskedFormChoices = {
      "Mask": "CYPHERSYSTEM.Mask",
      "Teen": "CYPHERSYSTEM.Teen"
    };

    if (this.actor.system.settings.combat.additionalStepDamageTrack.active && this.actor.system.basic.unmaskedForm !== "Teen") {
      let hurtLabel = this.actor.system.settings.combat.additionalStepDamageTrack.label || game.i18n.localize("CYPHERSYSTEM.Hurt");

      context.damageTrackChoices = {
        "Hale": "CYPHERSYSTEM.Hale",
        "Hurt": hurtLabel,
        "Impaired": "CYPHERSYSTEM.Impaired",
        "Debilitated": "CYPHERSYSTEM.Debilitated"
      };
    } else {
      context.damageTrackChoices = {
        "Hale": "CYPHERSYSTEM.Hale",
        "Impaired": "CYPHERSYSTEM.Impaired",
        "Debilitated": "CYPHERSYSTEM.Debilitated"
      };
    }

    context.gameModeChoices = {
      "Cypher": "CYPHERSYSTEM.Cypher",
      "Unmasked": "CYPHERSYSTEM.Unmasked",
      "Strange": "CYPHERSYSTEM.Strange"
    };

    context.sheetCustomizationChoices = {
      "backgroundImage": {
        "foundry": "CYPHERSYSTEM.BGImageFoundry",
        "cypher-blue": "CYPHERSYSTEM.BGImageCypherBlue",
        "plain metal": "CYPHERSYSTEM.BGImageMetal",
        "paper": "CYPHERSYSTEM.BGImagePaper",
        "plain pride": "CYPHERSYSTEM.BGImagePride",
        "plain blue": "CYPHERSYSTEM.BGImagePlainBlue",
        "plain green": "CYPHERSYSTEM.BGImagePlainGreen",
        "plain grey": "CYPHERSYSTEM.BGImagePlainGrey",
        "plain purple": "CYPHERSYSTEM.BGImagePlainPurple",
        "plain red": "CYPHERSYSTEM.BGImagePlainRed",
        "plain yellow": "CYPHERSYSTEM.BGImagePlainYellow",
        "custom": "CYPHERSYSTEM.BGImageCustom"
      },
      "backgroundIcon": {
        "none": "CYPHERSYSTEM.BGIconNone",
        "bat": "CYPHERSYSTEM.BGIconBat",
        "bat-mask": "CYPHERSYSTEM.BGIconBatMask",
        "battered-axe": "CYPHERSYSTEM.BGIconBatteredAxe",
        "battle-gear": "CYPHERSYSTEM.BGIconBattleGear",
        "bear": "CYPHERSYSTEM.BGIconBear",
        "bow-arrow": "CYPHERSYSTEM.BGIconBowArrow",
        "circuitry": "CYPHERSYSTEM.BGIconCircuitry",
        "csrd-logo": "CYPHERSYSTEM.BGIconCypherLogo",
        "holy-symbol": "CYPHERSYSTEM.BGIconHolySymbol",
        "hood": "CYPHERSYSTEM.BGIconHood",
        "orb-wand": "CYPHERSYSTEM.BGIconOrbWand",
        "wizard-staff": "CYPHERSYSTEM.BGIconWizardStaff",
        "wolf": "CYPHERSYSTEM.BGIconWolf",
        "custom": "CYPHERSYSTEM.BGIconCustom"
      },
      "logoImage": {
        "none": "CYPHERSYSTEM.CSLogoNone",
        "black": "CYPHERSYSTEM.CSLogoBlack",
        "white": "CYPHERSYSTEM.CSLogoWhite",
        "color": "CYPHERSYSTEM.CSLogoColor",
        "custom": "CYPHERSYSTEM.CSLogoCustom"
      }
    };

    context.recoveryRollsChoices = {
      "numberOneActionRecoveries": {
        "1": 1,
        "2": 2,
        "3": 3,
        "4": 4,
        "5": 5,
        "6": 6,
        "7": 7
      },
      "numberTenMinuteRecoveries": {
        "0": 0,
        "1": 1,
        "2": 2
      }
    };

    context.currencyChoices = {
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6,
    };

    return context;
  }

  /**
  * Additional event listeners for PC sheets
  */

  // if (!this.options.editable) return;

  /**
  * Combat tab functions
  */
  // Add to Lasting Damage
  static async #onPlusOneDamage(event, target) {
    const item = this.actor.items.get(target.closest('.item').dataset.itemId);
    let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
    let newValue = item.system.basic.damage + amount;
    item.update({ "system.basic.damage": newValue });
  };

  // Subtract from Lasting Damage
  static async #onMinusOneDamage(event, target) {
    const item = this.actor.items.get(target.closest('.item').dataset.itemId);
    let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
    let newValue = item.system.basic.damage - amount;
    item.update({ "system.basic.damage": newValue });
  };

  // Add to stress points
  static async #onPlusOneStress(event, target) {
    let amount = (game.keyboard.isModifierActive('Alt')) ? 3 : 1;
    let newValue = this.actor.system.combat.stress.quantity + amount;
    this.actor.update({ "system.combat.stress.quantity": newValue });
  };

  // Subtract from stress points
  static async #onMinusOneStress(event, target) {
    let amount = (game.keyboard.isModifierActive('Alt')) ? 3 : 1;
    let newValue = Math.max(this.actor.system.combat.stress.quantity - amount, 0);
    this.actor.update({ "system.combat.stress.quantity": newValue });
  };

  // Add to stress levels
  static async #onPlusOneStressLevel(event, target) {
    let newValue = this.actor.system.combat.stress.levels + 1;
    this.actor.update({ "system.combat.stress.levels": newValue });
  };

  // Subtract from stress levels
  static async #onMinusOneStressLevel(event, target) {
    let newValue = Math.max(this.actor.system.combat.stress.levels - 1, 0);
    this.actor.update({ "system.combat.stress.levels": newValue });
  };

  // Add to supernatural stress
  static async #onPlusOneSupernaturalStress(event, target) {
    let newValue = this.actor.system.combat.stress.supernaturalLevels + 1;
    this.actor.update({ "system.combat.stress.supernaturalLevels": newValue });
  };

  // Subtract from supernatural stress
  static async #minusOneSupernaturalStress(event, target) {
    let newValue = Math.max(this.actor.system.combat.stress.supernaturalLevels - 1, 0);
    this.actor.update({ "system.combat.stress.supernaturalLevels": newValue });
  };

  // Reset stress
  static async #resetStress(event, target) {
    this.actor.update({
      "system.combat.stress.quantity": 0,
      "system.combat.stress.levels": 0,
    });
  };

  // Change Armor Active
  static async #armorActive(event, target) {
    const item = this.actor.items.get(target.closest('.item').dataset.itemId);
    let newValue = (item.system.active) ? false : true;
    item.update({ "system.active": newValue });
  };

  /**
  * Pool management
  */

  // Reset Might
  static async #onResetPool(event, target) {
    if (!this.isEditable) return;
    const field = target.dataset.field;
    const isTeen = field.includes('.teen.');

    let lastingDamage = 0;
    for (let item of this.actor.items) {
      if (item.type == "lasting-damage" && !item.system.archived && field.endsWith(item.system.basic.pool.toLowerCase) &&
        (!isTeen || item.system.settings.general.unmaskedForm == "Teen")) {
        lastingDamage = lastingDamage + item.system.basic.damage;
      }
    }
    this.actor.update({ [`${field}.value`]: foundry.utils.getProperty(this.actor, field).max - lastingDamage });
  };

  /**
  * Roll buttons
  */

  // Might/Speed/Intellect roll button
  static async #rollPool(event, target) {
    rollEngineMain({ actorUuid: this.actor.uuid, pool: target.dataset.pool });
  };

  // Recovery roll button
  static async #recoveryRoll(event, target) {
    recoveryRollMacro(this.actor, "", true);
  };

  // d6 roll button
  static async #rollDiceTray(event, target) {
    diceRollMacro(target.dice, this.actor);
  };

  /**
  * General PC functions
  */
  // Increase XP
  static async #increaseXp(event, target) {
    let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
    let newValue = this.actor.system.basic.xp + amount;
    this.actor.update({ "system.basic.xp": newValue });
  };

  // Decrease XP
  static async #decreaseXp(event, target) {
    let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
    let newValue = this.actor.system.basic.xp - amount;
    this.actor.update({ "system.basic.xp": newValue });
  };

  // Reset Advancements
  static async #resetAdvancement(event, target) {
    this.actor.update({
      "system.basic.advancement.stats": false,
      "system.basic.advancement.effort": false,
      "system.basic.advancement.edge": false,
      "system.basic.advancement.skill": false,
      "system.basic.advancement.other": false
    });
  };

  // Reset Recovery Rolls
  static async #resetRecoveryRolls(event, target) {
    this.actor.update({
      "system.combat.recoveries.oneAction": false,
      "system.combat.recoveries.oneAction2": false,
      "system.combat.recoveries.oneAction3": false,
      "system.combat.recoveries.oneAction4": false,
      "system.combat.recoveries.oneAction5": false,
      "system.combat.recoveries.oneAction6": false,
      "system.combat.recoveries.oneAction7": false,
      "system.combat.recoveries.tenMinutes": false,
      "system.combat.recoveries.tenMinutes2": false,
      "system.combat.recoveries.oneHour": false,
      "system.combat.recoveries.tenHours": false
    });
  };

  // Disable multi roll
  static async #disableMultiRoll(event, target) {
    disableMultiRoll(this.actor);
  };

  // Toggle Temporary Power Shift
  static async #powerShiftTemporary(event, target) {
    const item = this.actor.items.get(target.closest('.item').dataset.itemId);
    item.update({ "system.basic.temporary": !item.system.basic.temporary });
  };

  // Toggle Favorite
  static async #itemFavorite(event, target) {
    const item = this.actor.items.get(target.closest('.item').dataset.itemId);
    item.update({ "system.favorite": !item.system.favorite });
  };
}
