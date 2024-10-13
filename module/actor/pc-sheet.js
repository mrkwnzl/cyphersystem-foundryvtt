/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
import {CypherActorSheet} from "./actor-sheet.js";

import {
  recoveryRollMacro,
  diceRollMacro
} from "../macros/macros.js";
import {isExclusiveTagActive} from "../utilities/actor-utilities.js";
import {rollEngineMain} from "../utilities/roll-engine/roll-engine-main.js";
import {disableMultiRoll} from "../forms/roll-engine-dialog-sheet.js";

export class CypherActorSheetPC extends CypherActorSheet {

  // Reposition dice tray
  _onResize(event) {
    super._onResize(event);
  };

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "actor", "pc"],
      template: "systems/cyphersystem/templates/actor-sheets/pc-sheet.html",
      width: 650,
      height: 750,
      resizable: true,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body"}],
      scrollY: [".sheet-body", ".tab", ".skills", ".description", ".combat", ".items", ".abilities", ".settings", ".tags", ".editor-content"]
    });
  }

  /**
  * Additional data preparations
  */
  async getData() {
    const data = await super.getData();
    const actorData = data.actor;

    // Sheet settings
    data.sheetSettings.rollButtons = game.settings.get("cyphersystem", "rollButtons");
    data.sheetSettings.useAllInOne = game.settings.get("cyphersystem", "itemMacrosUseAllInOne");
    data.sheetSettings.multiRollActive = this.actor.getFlag("cyphersystem", "multiRoll.active");
    data.sheetSettings.multiRollEffort = (this.actor.getFlag("cyphersystem", "multiRoll.active") === true && this.actor.getFlag("cyphersystem", "multiRoll.modifiers.effort") != 0) ? "multi-roll-active" : "";
    data.sheetSettings.multiRollMightEdge = (this.actor.getFlag("cyphersystem", "multiRoll.active") === true && this.actor.getFlag("cyphersystem", "multiRoll.modifiers.might.edge") != 0) ? "multi-roll-active" : "";
    data.sheetSettings.multiRollSpeedEdge = (this.actor.getFlag("cyphersystem", "multiRoll.active") === true && this.actor.getFlag("cyphersystem", "multiRoll.modifiers.speed.edge") != 0) ? "multi-roll-active" : "";
    data.sheetSettings.multiRollIntellectEdge = (this.actor.getFlag("cyphersystem", "multiRoll.active") === true && this.actor.getFlag("cyphersystem", "multiRoll.modifiers.intellect.edge") != 0) ? "multi-roll-active" : "";
    data.sheetSettings.isExclusiveTagActive = isExclusiveTagActive(this.actor);
    const diceTraySettings = ["hidden", "left", "right"];
    data.sheetSettings.diceTray = diceTraySettings[game.settings.get("cyphersystem", "diceTray")];

    data.sheetSettings.disabledStaticStats = (this.actor.getFlag("cyphersystem", "disabledStaticStats") || this.actor.getFlag("cyphersystem", "multiRoll.active")) ? "disabled" : "";

    // Select options
    data.unmaskedFormChoices = {
      "Mask": "CYPHERSYSTEM.Mask",
      "Teen": "CYPHERSYSTEM.Teen"
    };

    if (this.actor.system.settings.combat.additionalStepDamageTrack.active && !this.actor.system.basic.unmaskedForm == "Teen") {
      let hurtLabel = this.actor.system.settings.combat.additionalStepDamageTrack.label || game.i18n.localize("CYPHERSYSTEM.Hurt");

      data.damageTrackChoices = {
        "Hale": "CYPHERSYSTEM.Hale",
        "Hurt": hurtLabel,
        "Impaired": "CYPHERSYSTEM.Impaired",
        "Debilitated": "CYPHERSYSTEM.Debilitated"
      };
    } else {
      data.damageTrackChoices = {
        "Hale": "CYPHERSYSTEM.Hale",
        "Impaired": "CYPHERSYSTEM.Impaired",
        "Debilitated": "CYPHERSYSTEM.Debilitated"
      };
    }

    data.gameModeChoices = {
      "Cypher": "CYPHERSYSTEM.Cypher",
      "Unmasked": "CYPHERSYSTEM.Unmasked",
      "Strange": "CYPHERSYSTEM.Strange"
    };

    data.sheetCustomizationChoices = {
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

    data.recoveryRollsChoices = {
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

    data.currencyChoices = {
      "1": 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6,
    };

    return data;
  }

  /**
  * Additional event listeners for PC sheets
  */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;

    /**
    * Combat tab functions
    */
    // Add to Lasting Damage
    html.find('.plus-one-damage').click(clickEvent => {
      const item = this.actor.items.get($(clickEvent.currentTarget).parents(".item").data("itemId"));
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = item.system.basic.damage + amount;
      item.update({"system.basic.damage": newValue});
    });

    // Subtract from Lasting Damage
    html.find('.minus-one-damage').click(clickEvent => {
      const item = this.actor.items.get($(clickEvent.currentTarget).parents(".item").data("itemId"));
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = item.system.basic.damage - amount;
      item.update({"system.basic.damage": newValue});
    });

    // Add to stress points
    html.find('.plus-one-stress').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 3 : 1;
      let newValue = this.actor.system.combat.stress.quantity + amount;
      this.actor.update({"system.combat.stress.quantity": newValue});
    });

    // Subtract from stress points
    html.find('.minus-one-stress').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 3 : 1;
      let newValue = Math.max(this.actor.system.combat.stress.quantity - amount, 0);
      this.actor.update({"system.combat.stress.quantity": newValue});
    });

    // Add to stress levels
    html.find('.plus-one-stress-level').click(clickEvent => {
      let newValue = this.actor.system.combat.stress.levels + 1;
      this.actor.update({"system.combat.stress.levels": newValue});
    });

    // Subtract from stress levels
    html.find('.minus-one-stress-level').click(clickEvent => {
      let newValue = Math.max(this.actor.system.combat.stress.levels - 1, 0);
      this.actor.update({"system.combat.stress.levels": newValue});
    });

    // Add to supernatural stress
    html.find('.plus-one-supernatural-stress').click(clickEvent => {
      let newValue = this.actor.system.combat.stress.supernaturalLevels + 1;
      this.actor.update({"system.combat.stress.supernaturalLevels": newValue});
    });

    // Subtract from supernatural stress
    html.find('.minus-one-supernatural-stress').click(clickEvent => {
      let newValue = Math.max(this.actor.system.combat.stress.supernaturalLevels - 1, 0);
      this.actor.update({"system.combat.stress.supernaturalLevels": newValue});
    });

    // Reset stress
    html.find('.reset-stress').click(clickEvent => {
      this.actor.update({
        "system.combat.stress.quantity": 0,
        "system.combat.stress.levels": 0,
      });
    });

    // Change Armor Active
    html.find('.armor-active').click(clickEvent => {
      const item = this.actor.items.get($(clickEvent.currentTarget).parents(".item").data("itemId"));
      let newValue = (item.system.active) ? false : true;
      item.update({"system.active": newValue});
    });

    // Apply damage track to rolls
    html.find('.apply-impaired').click(clickEvent => {
      let newValue = (this.actor.system.combat.damageTrack.applyImpaired) ? false : true;
      this.actor.update({"system.combat.damageTrack.applyImpaired": newValue});
    });

    html.find('.apply-debilitated').click(clickEvent => {
      let newValue = (this.actor.system.combat.damageTrack.applyDebilitated) ? false : true;
      this.actor.update({"system.combat.damageTrack.applyDebilitated": newValue});
    });

    html.find('.apply-impaired-teen').click(clickEvent => {
      let newValue = (this.actor.system.teen.combat.damage.applyImpaired) ? false : true;
      this.actor.update({"system.teen.combat.damage.applyImpaired": newValue});
    });

    html.find('.apply-debilitated-teen').click(clickEvent => {
      let newValue = (this.actor.system.teen.combat.damage.applyDebilitated) ? false : true;
      this.actor.update({"system.teen.combat.damage.applyDebilitated": newValue});
    });

    /**
    * Pool management
    */
    // Increase Might
    html.find('.increase-might').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.pools.might.value + amount;
      this.actor.update({"system.pools.might.value": newValue});
    });

    // Decrease Might
    html.find('.decrease-might').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.pools.might.value - amount;
      this.actor.update({"system.pools.might.value": newValue});
    });

    // Reset Might
    html.find('.reset-might').click(clickEvent => {
      let lastingDamage = 0;
      for (let item of this.actor.items) {
        if (item.type == "lasting-damage" && item.system.basic.pool == "Might" && !item.system.archived) {
          lastingDamage = lastingDamage + item.system.basic.damage;
        }
      }
      this.actor.update({"system.pools.might.value": this.actor.system.pools.might.max - lastingDamage});
    });

    // Increase Speed
    html.find('.increase-speed').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.pools.speed.value + amount;
      this.actor.update({"system.pools.speed.value": newValue});
    });

    // Decrease Speed
    html.find('.decrease-speed').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.pools.speed.value - amount;
      this.actor.update({"system.pools.speed.value": newValue});
    });

    // Reset Speed
    html.find('.reset-speed').click(clickEvent => {
      let lastingDamage = 0;
      for (let item of this.actor.items) {
        if (item.type == "lasting-damage" && item.system.basic.pool == "Speed" && !item.system.archived) {
          lastingDamage = lastingDamage + item.system.basic.damage;
        }
      }
      this.actor.update({"system.pools.speed.value": this.actor.system.pools.speed.max - lastingDamage});
    });

    // Increase Intellect
    html.find('.increase-intellect').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.pools.intellect.value + amount;
      this.actor.update({"system.pools.intellect.value": newValue});
    });

    // Decrease Intellect
    html.find('.decrease-intellect').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.pools.intellect.value - amount;
      this.actor.update({"system.pools.intellect.value": newValue});
    });

    // Reset Intellect
    html.find('.reset-intellect').click(clickEvent => {
      let lastingDamage = 0;
      for (let item of this.actor.items) {
        if (item.type == "lasting-damage" && item.system.basic.pool == "Intellect" && !item.system.archived) {
          lastingDamage = lastingDamage + item.system.basic.damage;
        }
      }
      this.actor.update({"system.pools.intellect.value": this.actor.system.pools.intellect.max - lastingDamage});
    });

    // Increase Additional
    html.find('.increase-additional').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.pools.additional.value + amount;
      this.actor.update({"system.pools.additional.value": newValue});
    });

    // Decrease Additional
    html.find('.decrease-additional').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.pools.additional.value - amount;
      this.actor.update({"system.pools.additional.value": newValue});
    });

    // Reset Additional Pool
    html.find('.reset-additionalPool').click(clickEvent => {
      this.actor.update({"system.pools.additional.value": this.actor.system.pools.additional.max});
    });

    /**
    * Teen pool management
    */
    // Increase Teen Might
    html.find('.increase-teen-might').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.teen.pools.might.value + amount;
      this.actor.update({"system.teen.pools.might.value": newValue});
    });

    // Decrease Teen Might
    html.find('.decrease-teen-might').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.teen.pools.might.value - amount;
      this.actor.update({"system.teen.pools.might.value": newValue});
    });

    // Reset Teen Might
    html.find('.reset-teen-might').click(clickEvent => {
      let lastingDamage = 0;
      for (let item of this.actor.items) {
        if (item.type == "lasting-damage" && item.system.settings.general.unmaskedForm == "Teen" && item.system.basic.pool == "Might" && !item.system.archived) {
          lastingDamage = lastingDamage + item.system.basic.damage;
        }
      }
      this.actor.update({"system.teen.pools.might.value": this.actor.system.teen.pools.might.max - lastingDamage});
    });

    // Increase Teen Speed
    html.find('.increase-teen-speed').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.teen.pools.speed.value + amount;
      this.actor.update({"system.teen.pools.speed.value": newValue});
    });

    // Decrease Teen Speed
    html.find('.decrease-teen-speed').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.teen.pools.speed.value - amount;
      this.actor.update({"system.teen.pools.speed.value": newValue});
    });

    // Reset Teen Speed
    html.find('.reset-teen-speed').click(clickEvent => {
      let lastingDamage = 0;
      for (let item of this.actor.items) {
        if (item.type == "lasting-damage" && item.system.settings.general.unmaskedForm == "Teen" && item.system.basic.pool == "Speed" && !item.system.archived) {
          lastingDamage = lastingDamage + item.system.basic.damage;
        }
      }
      this.actor.update({"system.teen.pools.speed.value": this.actor.system.teen.pools.speed.max - lastingDamage});
    });

    // Increase Teen Intellect
    html.find('.increase-teen-intellect').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.teen.pools.intellect.value + amount;
      this.actor.update({"system.teen.pools.intellect.value": newValue});
    });

    // Decrease Teen Intellect
    html.find('.decrease-teen-intellect').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.teen.pools.intellect.value - amount;
      this.actor.update({"system.teen.pools.intellect.value": newValue});
    });

    // Reset Teen Intellect
    html.find('.reset-teen-intellect').click(clickEvent => {
      let lastingDamage = 0;
      for (let item of this.actor.items) {
        if (item.type == "lasting-damage" && item.system.settings.general.unmaskedForm == "Teen" && item.system.basic.pool == "Intellect" && !item.system.archived) {
          lastingDamage = lastingDamage + item.system.basic.damage;
        }
      }
      this.actor.update({"system.teen.pools.intellect.value": this.actor.system.teen.pools.intellect.max - lastingDamage});
    });

    // Increase Teen Additional
    html.find('.increase-teen-additional').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.teen.pools.additional.value + amount;
      this.actor.update({"system.teen.pools.additional.value": newValue});
    });

    // Decrease Teen Additional
    html.find('.decrease-teen-additional').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.teen.pools.additional.value - amount;
      this.actor.update({"system.teen.pools.additional.value": newValue});
    });

    // Reset Additional Teen Pool
    html.find('.reset-teen-additionalPool').click(clickEvent => {
      this.actor.update({"system.teen.pools.additional.value": this.actor.system.teen.pools.additional.max});
    });

    /**
    * Roll buttons
    */

    // Might roll button
    html.find('.might-roll').click(clickEvent => {
      // Check for AiO dialog
      rollEngineMain({actorUuid: this.actor.uuid, pool: "Might"});
    });

    // Speed roll button
    html.find('.speed-roll').click(clickEvent => {
      // Check for AiO dialog
      rollEngineMain({actorUuid: this.actor.uuid, pool: "Speed"});
    });

    // Intellect roll button
    html.find('.intellect-roll').click(clickEvent => {
      // Check for AiO dialog
      rollEngineMain({actorUuid: this.actor.uuid, pool: "Intellect"});
    });

    // Recovery roll button
    html.find('.recovery-roll').click(clickEvent => {
      recoveryRollMacro(this.actor, "", true);
    });

    // d6 roll button
    html.find('.dice-tray-d6').click(clickEvent => {
      diceRollMacro("d6", this.actor);
    });

    // d10 roll button
    html.find('.dice-tray-d10').click(clickEvent => {
      diceRollMacro("d10", this.actor);
    });

    // d20 roll button
    html.find('.dice-tray-d20').click(clickEvent => {
      diceRollMacro("d20", this.actor);
    });

    // d100 roll button
    html.find('.dice-tray-d100').click(clickEvent => {
      diceRollMacro("d100", this.actor);
    });

    /**
    * General PC functions
    */
    // Increase XP
    html.find('.increase-xp').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.basic.xp + amount;
      this.actor.update({"system.basic.xp": newValue});
    });

    // Decrease XP
    html.find('.decrease-xp').click(clickEvent => {
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = this.actor.system.basic.xp - amount;
      this.actor.update({"system.basic.xp": newValue});
    });

    // Reset Advancements
    html.find('.reset-advancement').click(clickEvent => {
      this.actor.update({
        "system.basic.advancement.stats": false,
        "system.basic.advancement.effort": false,
        "system.basic.advancement.edge": false,
        "system.basic.advancement.skill": false,
        "system.basic.advancement.other": false
      });
    });

    // Reset Recovery Rolls
    html.find('.reset-recovery-rolls').click(clickEvent => {
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
    });

    // Disable multi roll
    html.find('.disable-multi-roll').click(clickEvent => {
      disableMultiRoll(this.actor);
    });

    // Toggle Temporary Power Shift
    html.find('.power-shift-temporary').click(clickEvent => {
      const item = this.actor.items.get($(clickEvent.currentTarget).parents(".item").data("itemId"));
      let newValue = (item.system.basic.temporary) ? false : true;
      item.update({"system.basic.temporary": newValue});
    });

    // Toggle Favorite
    html.find('.item-favorite').click(clickEvent => {
      const item = this.actor.items.get($(clickEvent.currentTarget).parents(".item").data("itemId"));
      let newValue = (item.system.favorite) ? false : true;
      item.update({"system.favorite": newValue});
    });
  }
}
