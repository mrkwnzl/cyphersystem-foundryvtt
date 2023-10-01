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

    for (let i of data.items) {
      if (i.type == 'attack') {

        let skillRating = 0;
        // parseInt to correct old error
        let modifiedBy = parseInt(i.system.basic.steps);
        let totalModifier = 0;
        let totalModified = "";

        if (i.system.basic.skillRating == "Inability") skillRating = -1;
        if (i.system.basic.skillRating == "Trained") skillRating = 1;
        if (i.system.basic.skillRating == "Specialized") skillRating = 2;

        if (i.system.basic.modifier == "hindered") modifiedBy = modifiedBy * -1;

        totalModifier = skillRating + modifiedBy;

        if (totalModifier == 1) totalModified = game.i18n.localize("CYPHERSYSTEM.eased");
        if (totalModifier >= 2) totalModified = game.i18n.format("CYPHERSYSTEM.easedBySteps", {amount: totalModifier});
        if (totalModifier == -1) totalModified = game.i18n.localize("CYPHERSYSTEM.hindered");
        if (totalModifier <= -2) totalModified = game.i18n.format("CYPHERSYSTEM.hinderedBySteps", {amount: Math.abs(totalModifier)});

        // Assign and return
        if (i.system.totalModified != totalModified) {
          i.system.totalModified = totalModified;
          this.actor.updateEmbeddedDocuments("Item", [i]);
        }
      }
    }

    // Update armor
    let armorTotal = 0;
    let speedCostTotal = 0;
    let teenArmorTotal = 0;
    let teenSpeedCostTotal = 0;

    for (let piece of data.itemLists.armor) {
      if (piece.system.active === true && piece.system.archived === false) {
        armorTotal = armorTotal + piece.system.basic.rating;
        speedCostTotal = speedCostTotal + piece.system.basic.cost;
      }
    }

    for (let piece of data.itemLists.teenArmor) {
      if (piece.system.active === true && piece.system.archived === false) {
        teenArmorTotal = teenArmorTotal + piece.system.basic.rating;
        teenSpeedCostTotal = teenSpeedCostTotal + piece.system.basic.cost;
      }
    }

    if (this.actor.system.combat.armor.ratingTotal != armorTotal || this.actor.system.combat.armor.costTotal != speedCostTotal || this.actor.system.teen.combat.armor.armorValueTotal != teenArmorTotal || this.actor.system.teen.combat.armor.speedCostTotal != teenSpeedCostTotal) {
      this.actor.update({
        "system.combat.armor.ratingTotal": armorTotal,
        "system.combat.armor.costTotal": speedCostTotal,
        "system.teen.combat.armor.armorValueTotal": teenArmorTotal,
        "system.teen.combat.armor.speedCostTotal": teenSpeedCostTotal
      });
    }

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
  }
}
