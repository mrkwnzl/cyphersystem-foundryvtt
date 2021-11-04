/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
import { CypherActorSheet } from "./actor-sheet.js";

import {
  recoveryRollMacro,
  allInOneRollDialog
} from "../macros/macros.js";

export class CypherActorSheetPC extends CypherActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "actor", "pc"],
      template: "systems/cyphersystem/templates/actor/pc-sheet.html",
      width: 650,
      height: false,
      resizable: false,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body" }],
      scrollY: [".sheet-body", ".tab", ".skills", ".biography", ".combat", ".items", ".abilities", ".settings"]
    });
  }

  /**
  * Additional data preparations
  */
  getData() {
    const data = super.getData();
    const actorData = data.actor.data;
    data.data.rollButtons = game.settings.get("cyphersystem", "rollButtons");

    for (let i of data.items) {
      if (i.type == 'attack' || i.type == 'teen Attack') {

        let skillRating = 0;
        let modifiedBy = i.data.modifiedBy;
        let totalModifier = 0;
        let totalModified = "";

        if (i.data.skillRating == "Inability") skillRating = -1;
        if (i.data.skillRating == "Trained") skillRating = 1;
        if (i.data.skillRating == "Specialized") skillRating = 2;

        if (i.data.modified == "hindered") modifiedBy = modifiedBy * -1;

        totalModifier = skillRating + modifiedBy;

        if (totalModifier == 1) totalModified = game.i18n.localize("CYPHERSYSTEM.eased");
        if (totalModifier >= 2) totalModified = game.i18n.format("CYPHERSYSTEM.easedBySteps", { amount: totalModifier });
        if (totalModifier == -1) totalModified = game.i18n.localize("CYPHERSYSTEM.hindered");
        if (totalModifier <= -2) totalModified = game.i18n.format("CYPHERSYSTEM.hinderedBySteps", { amount: Math.abs(totalModifier) });

        // Assign and return
        i.data.totalModified = totalModified;
        this.actor.updateEmbeddedDocuments("Item", [i]);
      }
    }

    // Update armor
    let armorTotal = 0;
    let speedCostTotal = 0;
    let teenArmorTotal = 0;
    let teenSpeedCostTotal = 0;

    for (let piece of actorData.armor) {
      if (piece.data.armorActive === true && piece.data.archived === false) {
        armorTotal = armorTotal + piece.data.armorValue;
        speedCostTotal = speedCostTotal + piece.data.speedCost;
      }
    }

    for (let piece of actorData.teenArmor) {
      if (piece.data.armorActive === true && piece.data.archived === false) {
        teenArmorTotal = teenArmorTotal + piece.data.armorValue;
        teenSpeedCostTotal = teenSpeedCostTotal + piece.data.speedCost;
      }
    }

    this.actor.update({ "data.armor.armorValueTotal": armorTotal });
    this.actor.update({ "data.armor.speedCostTotal": speedCostTotal });
    this.actor.update({ "data.teen.armor.armorValueTotal": teenArmorTotal });
    this.actor.update({ "data.teen.armor.speedCostTotal": teenSpeedCostTotal });

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
      const shownItem = $(clickEvent.currentTarget).parents(".item");
      const item = duplicate(this.actor.items.get(shownItem.data("itemId")));
      let amount = (event.altKey) ? 10 : 1;
      item.data.lastingDamageAmount = item.data.lastingDamageAmount + amount;
      this.actor.updateEmbeddedDocuments("Item", [item]);
    });

    // Subtract from Lasting Damage
    html.find('.minus-one-damage').click(clickEvent => {
      const shownItem = $(clickEvent.currentTarget).parents(".item");
      const item = duplicate(this.actor.items.get(shownItem.data("itemId")));
      let amount = (event.altKey) ? 10 : 1;
      item.data.lastingDamageAmount = item.data.lastingDamageAmount - amount;
      this.actor.updateEmbeddedDocuments("Item", [item]);
    });

    // Change Armor Active
    html.find('.armor-active').click(clickEvent => {
      const shownItem = $(clickEvent.currentTarget).parents(".item");
      const item = duplicate(this.actor.items.get(shownItem.data("itemId")));
      if (item.data.armorActive === true) {
        item.data.armorActive = false;
      }
      else {
        item.data.armorActive = true;
      }
      this.actor.updateEmbeddedDocuments("Item", [item]);
    });

    // Apply damage track to rolls
    html.find('.apply-impaired').click(clickEvent => {
      let newValue = (this.actor.data.data.damage.applyImpaired) ? false : true;
      this.actor.update({ "data.damage.applyImpaired": newValue });
    });

    html.find('.apply-debilitated').click(clickEvent => {
      let newValue = (this.actor.data.data.damage.applyDebilitated) ? false : true;
      this.actor.update({ "data.damage.applyDebilitated": newValue });
    });

    html.find('.apply-impaired-teen').click(clickEvent => {
      let newValue = (this.actor.data.data.teen.damage.applyImpaired) ? false : true;
      this.actor.update({ "data.teen.damage.applyImpaired": newValue });
    });

    html.find('.apply-debilitated-teen').click(clickEvent => {
      let newValue = (this.actor.data.data.teen.damage.applyDebilitated) ? false : true;
      this.actor.update({ "data.teen.damage.applyDebilitated": newValue });
    });

    /**
    * Pool management
    */
    // Increase Might
    html.find('.increase-might').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.pools.might.value + amount;
      this.actor.update({ "data.pools.might.value": newValue });
    });

    // Decrease Might
    html.find('.decrease-might').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.pools.might.value - amount;
      this.actor.update({ "data.pools.might.value": newValue });
    });

    // Reset Might
    html.find('.reset-might').click(clickEvent => {
      let lastingDamage = 0;
      for (let item of this.actor.items) {
        if (item.data.type == "lasting Damage" && item.data.data.lastingDamagePool == "Might" && !item.data.data.archived) {
          lastingDamage = lastingDamage + item.data.data.lastingDamageAmount
        }
      }
      this.actor.update({
        "data.pools.might.value": this.actor.data.data.pools.might.max - lastingDamage
      })
    });

    // Increase Speed
    html.find('.increase-speed').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.pools.speed.value + amount;
      this.actor.update({ "data.pools.speed.value": newValue });
    });

    // Decrease Speed
    html.find('.decrease-speed').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.pools.speed.value - amount;
      this.actor.update({ "data.pools.speed.value": newValue });
    });

    // Reset Speed
    html.find('.reset-speed').click(clickEvent => {
      let lastingDamage = 0;
      for (let item of this.actor.items) {
        if (item.data.type == "lasting Damage" && item.data.data.lastingDamagePool == "Speed" && !item.data.data.archived) {
          lastingDamage = lastingDamage + item.data.data.lastingDamageAmount
        }
      }
      this.actor.update({
        "data.pools.speed.value": this.actor.data.data.pools.speed.max - lastingDamage
      })
    });

    // Increase Intellect
    html.find('.increase-intellect').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.pools.intellect.value + amount;
      this.actor.update({ "data.pools.intellect.value": newValue });
    });

    // Decrease Intellect
    html.find('.decrease-intellect').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.pools.intellect.value - amount;
      this.actor.update({ "data.pools.intellect.value": newValue });
    });

    // Reset Intellect
    html.find('.reset-intellect').click(clickEvent => {
      let lastingDamage = 0;
      for (let item of this.actor.items) {
        if (item.data.type == "lasting Damage" && item.data.data.lastingDamagePool == "Intellect" && !item.data.data.archived) {
          lastingDamage = lastingDamage + item.data.data.lastingDamageAmount
        }
      }
      this.actor.update({
        "data.pools.intellect.value": this.actor.data.data.pools.intellect.max - lastingDamage
      })
    });

    // Increase Additional
    html.find('.increase-additional').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.pools.additional.value + amount;
      this.actor.update({ "data.pools.additional.value": newValue });
    });

    // Decrease Additional
    html.find('.decrease-additional').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.pools.additional.value - amount;
      this.actor.update({ "data.pools.additional.value": newValue });
    });

    // Reset Additional Pool
    html.find('.reset-additionalPool').click(clickEvent => {
      this.actor.update({
        "data.pools.additional.value": this.actor.data.data.pools.additional.max
      })
    });

    /**
    * Teen pool management
    */
    // Increase Teen Might
    html.find('.increase-teen-might').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.teen.pools.might.value + amount;
      this.actor.update({ "data.teen.pools.might.value": newValue });
    });

    // Decrease Teen Might
    html.find('.decrease-teen-might').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.teen.pools.might.value - amount;
      this.actor.update({ "data.teen.pools.might.value": newValue });
    });

    // Reset Teen Might
    html.find('.reset-teen-might').click(clickEvent => {
      let lastingDamage = 0;
      for (let item of this.actor.items) {
        if (item.data.type == "teen lasting Damage" && item.data.data.lastingDamagePool == "Might" && !item.data.data.archived) {
          lastingDamage = lastingDamage + item.data.data.lastingDamageAmount
        }
      }
      this.actor.update({
        "data.teen.pools.might.value": this.actor.data.data.teen.pools.might.max - lastingDamage
      })
    });

    // Increase Teen Speed
    html.find('.increase-teen-speed').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.teen.pools.speed.value + amount;
      this.actor.update({ "data.teen.pools.speed.value": newValue });
    });

    // Decrease Teen Speed
    html.find('.decrease-teen-speed').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.teen.pools.speed.value - amount;
      this.actor.update({ "data.teen.pools.speed.value": newValue });
    });

    // Reset Teen Speed
    html.find('.reset-teen-speed').click(clickEvent => {
      let lastingDamage = 0;
      for (let item of this.actor.items) {
        if (item.data.type == "teen lasting Damage" && item.data.data.lastingDamagePool == "Speed" && !item.data.data.archived) {
          lastingDamage = lastingDamage + item.data.data.lastingDamageAmount
        }
      }
      this.actor.update({
        "data.teen.pools.speed.value": this.actor.data.data.teen.pools.speed.max - lastingDamage
      })
    });

    // Increase Teen Intellect
    html.find('.increase-teen-intellect').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.teen.pools.intellect.value + amount;
      this.actor.update({ "data.teen.pools.intellect.value": newValue });
    });

    // Decrease Teen Intellect
    html.find('.decrease-teen-intellect').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.teen.pools.intellect.value - amount;
      this.actor.update({ "data.teen.pools.intellect.value": newValue });
    });

    // Reset Teen Intellect
    html.find('.reset-teen-intellect').click(clickEvent => {
      let lastingDamage = 0;
      for (let item of this.actor.items) {
        if (item.data.type == "teen lasting Damage" && item.data.data.lastingDamagePool == "Intellect" && !item.data.data.archived) {
          lastingDamage = lastingDamage + item.data.data.lastingDamageAmount
        }
      }
      this.actor.update({
        "data.teen.pools.intellect.value": this.actor.data.data.teen.pools.intellect.max - lastingDamage
      })
    });

    // Increase Teen Additional
    html.find('.increase-teen-additional').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.teen.pools.additional.value + amount;
      this.actor.update({ "data.teen.pools.additional.value": newValue });
    });

    // Decrease Teen Additional
    html.find('.decrease-teen-additional').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.teen.pools.additional.value - amount;
      this.actor.update({ "data.teen.pools.additional.value": newValue });
    });

    // Reset Additional Teen Pool
    html.find('.reset-teen-additionalPool').click(clickEvent => {
      this.actor.update({
        "data.teen.pools.additional.value": this.actor.data.data.teen.pools.additional.max
      })
    });

    /**
    * Roll buttons
    */

    // Might roll button
    html.find('.might-roll').click(clickEvent => {
      // Check for AiO dialog
      let skipDialog = true;
      if ((game.settings.get("cyphersystem", "itemMacrosUseAllInOne") && !event.altKey) || (!game.settings.get("cyphersystem", "itemMacrosUseAllInOne") && event.altKey)) {
        skipDialog = false;
      };

      allInOneRollDialog(this.actor, "Might", "Practiced", 0, 0, 0, 0, 0, 0, game.i18n.localize("CYPHERSYSTEM.MightRoll"), 0, 0, 3, "", skipDialog)
    });

    // Speed roll button
    html.find('.speed-roll').click(clickEvent => {
      // Check for AiO dialog
      let skipDialog = true;
      if ((game.settings.get("cyphersystem", "itemMacrosUseAllInOne") && !event.altKey) || (!game.settings.get("cyphersystem", "itemMacrosUseAllInOne") && event.altKey)) {
        skipDialog = false;
      };

      allInOneRollDialog(this.actor, "Speed", "Practiced", 0, 0, 0, 0, 0, 0, game.i18n.localize("CYPHERSYSTEM.SpeedRoll"), 0, 0, 3, "", skipDialog)
    });

    // Intellect roll button
    html.find('.intellect-roll').click(clickEvent => {
      // Check for AiO dialog
      let skipDialog = true;
      if ((game.settings.get("cyphersystem", "itemMacrosUseAllInOne") && !event.altKey) || (!game.settings.get("cyphersystem", "itemMacrosUseAllInOne") && event.altKey)) {
        skipDialog = false;
      };

      allInOneRollDialog(this.actor, "Intellect", "Practiced", 0, 0, 0, 0, 0, 0, game.i18n.localize("CYPHERSYSTEM.IntellectRoll"), 0, 0, 3, "", skipDialog)
    });

    // Recovery roll button
    html.find('.recovery-roll').click(clickEvent => {
      const item = $(clickEvent.currentTarget).parents(".item");
      recoveryRollMacro(this.actor, "")
    });

    /**
    * General PC functions
    */
    // Increase XP
    html.find('.increase-xp').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.basic.xp + amount;
      this.actor.update({ "data.basic.xp": newValue });
    });

    // Decrease XP
    html.find('.decrease-xp').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.basic.xp - amount;
      this.actor.update({ "data.basic.xp": newValue });
    });

    // Reset Advancements
    html.find('.reset-advancement').click(clickEvent => {
      this.actor.update({
        "data.advancement.advStats": false,
        "data.advancement.advEffort": false,
        "data.advancement.advEdge": false,
        "data.advancement.advSkill": false,
        "data.advancement.advOther": false
      })
    });

    // Reset Recovery Rolls
    html.find('.reset-recovery-rolls').click(clickEvent => {
      this.actor.update({
        "data.recoveries.oneAction": false,
        "data.recoveries.oneActionTwo": false,
        "data.recoveries.oneActionThree": false,
        "data.recoveries.oneActionFour": false,
        "data.recoveries.oneActionFive": false,
        "data.recoveries.oneActionSix": false,
        "data.recoveries.oneActionSeven": false,
        "data.recoveries.tenMinutes": false,
        "data.recoveries.tenMinutesTwo": false,
        "data.recoveries.oneHour": false,
        "data.recoveries.tenHours": false
      })
    });
  }
}
