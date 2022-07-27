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

export class CypherActorSheetPC extends CypherActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "actor", "pc"],
      template: "systems/cyphersystem/templates/actor-sheets/pc-sheet.html",
      width: 650,
      height: false,
      resizable: false,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body"}],
      scrollY: [".sheet-body", ".tab", ".skills", ".biography", ".combat", ".items", ".abilities", ".settings"]
    });
  }

  /**
  * Additional data preparations
  */
  async getData() {
    const data = await super.getData();
    const actorData = data.actor.system;

    // Sheet settings
    data.sheetSettings.rollButtons = game.settings.get("cyphersystem", "rollButtons");
    data.sheetSettings.isExclusiveTagActive = isExclusiveTagActive(this.actor);
    const diceTraySettings = ["hidden", "left", "right"];
    data.sheetSettings.diceTray = diceTraySettings[game.settings.get("cyphersystem", "diceTray")];
    data.sheetSettings.sheetWidth = (data.sheetSettings.diceTray == "right") ? this.actor.sheet.options.width : -32;

    if (game.modules.get("cyphersheets")) {
      if (game.modules.get("cyphersheets").active) {
        data.sheetSettings.backgroundImage = "foundry";
        data.sheetSettings.backgroundIcon = "none";
        data.sheetSettings.cyphersheetsModuleActive = true;
        data.sheetSettings.backgroundImageBaseSetting = "";
      } else {
        backgroundData();
      }
    } else {
      backgroundData();
    }

    function backgroundData() {
      data.sheetSettings.cyphersheetsModuleActive = false;
      data.sheetSettings.backgroundImageBaseSetting = "background-image";
      if (actorData.settings.gameMode.currentSheet == "Teen") {
        data.sheetSettings.backgroundImage = actorData.teen.settings.backgroundImage;
        data.sheetSettings.backgroundIcon = actorData.teen.settings.backgroundIcon;
      } else {
        data.sheetSettings.backgroundImage = actorData.settings.backgroundImage;
        data.sheetSettings.backgroundIcon = actorData.settings.backgroundIcon;
      }
    }

    data.sheetSettings.disabledStaticStats = (data.actor.getFlag("cyphersystem", "disabledStaticStats")) ? "disabled" : "";

    for (let i of data.items) {
      if (i.type == 'attack' || i.type == 'teen Attack') {

        let skillRating = 0;
        let modifiedBy = i.system.modifiedBy;
        let totalModifier = 0;
        let totalModified = "";

        if (i.system.skillRating == "Inability") skillRating = -1;
        if (i.system.skillRating == "Trained") skillRating = 1;
        if (i.system.skillRating == "Specialized") skillRating = 2;

        if (i.system.modified == "hindered") modifiedBy = modifiedBy * -1;

        totalModifier = skillRating + modifiedBy;

        if (totalModifier == 1) totalModified = game.i18n.localize("CYPHERSYSTEM.eased");
        if (totalModifier >= 2) totalModified = game.i18n.format("CYPHERSYSTEM.easedBySteps", {amount: totalModifier});
        if (totalModifier == -1) totalModified = game.i18n.localize("CYPHERSYSTEM.hindered");
        if (totalModifier <= -2) totalModified = game.i18n.format("CYPHERSYSTEM.hinderedBySteps", {amount: Math.abs(totalModifier)});

        // Assign and return
        i.system.totalModified = totalModified;
        this.actor.updateEmbeddedDocuments("Item", [i]);
      }
    }

    // Update armor
    let armorTotal = 0;
    let speedCostTotal = 0;
    let teenArmorTotal = 0;
    let teenSpeedCostTotal = 0;

    for (let piece of data.itemLists.armor) {
      if (piece.system.armorActive === true && piece.system.archived === false) {
        armorTotal = armorTotal + piece.system.armorValue;
        speedCostTotal = speedCostTotal + piece.system.speedCost;
      }
    }

    for (let piece of data.itemLists.teenArmor) {
      if (piece.system.armorActive === true && piece.system.archived === false) {
        teenArmorTotal = teenArmorTotal + piece.system.armorValue;
        teenSpeedCostTotal = teenSpeedCostTotal + piece.system.speedCost;
      }
    }

    this.actor.update({
      "system.armor.armorValueTotal": armorTotal,
      "system.armor.speedCostTotal": speedCostTotal,
      "system.teen.armor.armorValueTotal": teenArmorTotal,
      "system.teen.armor.speedCostTotal": teenSpeedCostTotal
    });

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
      let newValue = item.system.lastingDamageAmount + amount;
      item.update({"system.lastingDamageAmount": newValue});
    });

    // Subtract from Lasting Damage
    html.find('.minus-one-damage').click(clickEvent => {
      const item = this.actor.items.get($(clickEvent.currentTarget).parents(".item").data("itemId"));
      let amount = (game.keyboard.isModifierActive('Alt')) ? 10 : 1;
      let newValue = item.system.lastingDamageAmount - amount;
      item.update({"system.lastingDamageAmount": newValue});
    });

    // Change Armor Active
    html.find('.armor-active').click(clickEvent => {
      const item = this.actor.items.get($(clickEvent.currentTarget).parents(".item").data("itemId"));
      let newValue = (item.system.armorActive) ? false : true;
      item.update({"system.armorActive": newValue});
    });

    // Apply damage track to rolls
    html.find('.apply-impaired').click(clickEvent => {
      let newValue = (this.actor.system.damage.applyImpaired) ? false : true;
      this.actor.update({"system.damage.applyImpaired": newValue});
    });

    html.find('.apply-debilitated').click(clickEvent => {
      let newValue = (this.actor.system.damage.applyDebilitated) ? false : true;
      this.actor.update({"system.damage.applyDebilitated": newValue});
    });

    html.find('.apply-impaired-teen').click(clickEvent => {
      let newValue = (this.actor.system.teen.damage.applyImpaired) ? false : true;
      this.actor.update({"system.teen.damage.applyImpaired": newValue});
    });

    html.find('.apply-debilitated-teen').click(clickEvent => {
      let newValue = (this.actor.system.teen.damage.applyDebilitated) ? false : true;
      this.actor.update({"system.teen.damage.applyDebilitated": newValue});
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
        if (item.type == "lasting Damage" && item.system.lastingDamagePool == "Might" && !item.system.archived) {
          lastingDamage = lastingDamage + item.system.lastingDamageAmount
        }
      }
      this.actor.update({"system.pools.might.value": this.actor.system.pools.might.max - lastingDamage})
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
        if (item.type == "lasting Damage" && item.system.lastingDamagePool == "Speed" && !item.system.archived) {
          lastingDamage = lastingDamage + item.system.lastingDamageAmount
        }
      }
      this.actor.update({"system.pools.speed.value": this.actor.system.pools.speed.max - lastingDamage})
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
        if (item.type == "lasting Damage" && item.system.lastingDamagePool == "Intellect" && !item.system.archived) {
          lastingDamage = lastingDamage + item.system.lastingDamageAmount
        }
      }
      this.actor.update({"system.pools.intellect.value": this.actor.system.pools.intellect.max - lastingDamage})
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
      this.actor.update({"system.pools.additional.value": this.actor.system.pools.additional.max})
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
        if (item.type == "teen lasting Damage" && item.system.lastingDamagePool == "Might" && !item.system.archived) {
          lastingDamage = lastingDamage + item.system.lastingDamageAmount
        }
      }
      this.actor.update({"system.teen.pools.might.value": this.actor.system.teen.pools.might.max - lastingDamage})
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
        if (item.type == "teen lasting Damage" && item.system.lastingDamagePool == "Speed" && !item.system.archived) {
          lastingDamage = lastingDamage + item.system.lastingDamageAmount
        }
      }
      this.actor.update({"system.teen.pools.speed.value": this.actor.system.teen.pools.speed.max - lastingDamage})
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
        if (item.type == "teen lasting Damage" && item.system.lastingDamagePool == "Intellect" && !item.system.archived) {
          lastingDamage = lastingDamage + item.system.lastingDamageAmount
        }
      }
      this.actor.update({"system.teen.pools.intellect.value": this.actor.system.teen.pools.intellect.max - lastingDamage})
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
      this.actor.update({"system.teen.pools.additional.value": this.actor.system.teen.pools.additional.max})
    });

    /**
    * Roll buttons
    */

    // Might roll button
    html.find('.might-roll').click(clickEvent => {
      // Check for AiO dialog
      rollEngineMain(this.actor, "", "", "", "", false, "", "Might", "Practiced", 0, 0, 0, 0, 0, 3, 0, "eased", 0, 0);
    });

    // Speed roll button
    html.find('.speed-roll').click(clickEvent => {
      // Check for AiO dialog
      rollEngineMain(this.actor, "", "", "", "", false, "", "Speed", "Practiced", 0, 0, 0, 0, 0, 3, 0, "eased", 0, 0);
    });

    // Intellect roll button
    html.find('.intellect-roll').click(clickEvent => {
      // Check for AiO dialog
      rollEngineMain(this.actor, "", "", "", "", false, "", "Intellect", "Practiced", 0, 0, 0, 0, 0, 3, 0, "eased", 0, 0);
    });

    // Recovery roll button
    html.find('.recovery-roll').click(clickEvent => {
      recoveryRollMacro(this.actor, "", true)
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
        "system.advancement.advStats": false,
        "system.advancement.advEffort": false,
        "system.advancement.advEdge": false,
        "system.advancement.advSkill": false,
        "system.advancement.advOther": false
      })
    });

    // Reset Recovery Rolls
    html.find('.reset-recovery-rolls').click(clickEvent => {
      this.actor.update({
        "system.recoveries.oneAction": false,
        "system.recoveries.oneActionTwo": false,
        "system.recoveries.oneActionThree": false,
        "system.recoveries.oneActionFour": false,
        "system.recoveries.oneActionFive": false,
        "system.recoveries.oneActionSix": false,
        "system.recoveries.oneActionSeven": false,
        "system.recoveries.tenMinutes": false,
        "system.recoveries.tenMinutesTwo": false,
        "system.recoveries.oneHour": false,
        "system.recoveries.tenHours": false
      })
    });
  }
}
