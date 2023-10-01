/**
* Extend the basic ItemSheet with some very simple modifications
* @extends {ItemSheet}
*/

import {getBackgroundIcon, getBackgroundIconOpacity, getBackgroundIconPath, getBackgroundImage, getBackgroundImageOverlayOpacity, getBackgroundImagePath} from "../forms/sheet-customization.js";
import {renameTag} from "../macros/macro-helper.js";
import {htmlEscape} from "../utilities/html-escape.js";

export class CypherItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "item", "item-sheet"],
      width: 575,
      height: 675,
      resizable: true,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      scrollY: [".sheet-body", ".tab"]
    });
  }

  /** @override */
  get template() {
    const path = "systems/cyphersystem/templates/item-sheets";
    const itemType = this.item.type;
    return `${path}/${itemType}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = await super.getData();

    // Fallback for empty input fields
    if (["skill", "ability", "attack"].includes(this.item.type)) {
      if (!this.item.system.basic?.cost) {
        this.item.update({"system.basic.cost": 0});
      }
      if (!this.item.system.basic?.damage) {
        this.item.update({"system.basic.damage": 0});
      }
      if (!this.item.system.basic?.steps) {
        this.item.update({"system.basic.steps": 0});
      }
      if (!this.item.system.settings?.rollButton?.additionalCost) {
        this.item.update({"system.settings.rollButton.additionalCost": 0});
      }
      if (!this.item.system.settings?.rollButton?.bonus) {
        this.item.update({"system.settings.rollButton.bonus": 0});
      }
      if (!this.item.system.settings?.rollButton?.additionalSteps) {
        this.item.update({"system.settings.rollButton.additionalSteps": 0});
      }
      if (!this.item.system.settings?.rollButton?.damage) {
        this.item.update({"system.settings.rollButton.damage": 0});
      }
      if (!this.item.system.settings?.rollButton?.damagePerLOE) {
        this.item.update({"system.settings.rollButton.damagePerLOE": 0});
      }
    }

    // Sheet settings
    data.sheetSettings = {};
    data.sheetSettings.isGM = game.user.isGM;
    data.sheetSettings.isObserver = !this.options.editable;
    data.sheetSettings.rollButtons = game.settings.get("cyphersystem", "rollButtons");
    data.sheetSettings.useAllInOne = game.settings.get("cyphersystem", "itemMacrosUseAllInOne");
    data.sheetSettings.spells = game.i18n.localize("CYPHERSYSTEM.Spells");
    data.sheetSettings.identified = this.item.system.basic?.identified;
    data.sheetSettings.editor = (game.settings.get("cyphersystem", "sheetEditor") == 1) ? "tinymce" : "prosemirror";

    // Enriched HTML
    data.enrichedHTML = {};
    data.enrichedHTML.description = await TextEditor.enrichHTML(this.item.system.description, {async: true, secrets: this.item.isOwner, relativeTo: this.item});

    data.actor = data.item.parent ? data.item.parent : "";

    // Sheet customizations
    // -- Get root css variables
    let root = document.querySelector(':root');

    // -- Sheet settings
    data.sheetSettings.backgroundImageBaseSetting = "background-image";

    data.sheetSettings.backgroundImage = getBackgroundImage();
    if (data.sheetSettings.backgroundImage == "custom") {
      data.sheetSettings.backgroundImagePath = "/" + getBackgroundImagePath();
      data.sheetSettings.backgroundOverlayOpacity = getBackgroundImageOverlayOpacity();
    }
    data.sheetSettings.backgroundIcon = getBackgroundIcon();
    data.sheetSettings.backgroundIconPath = "/" + getBackgroundIconPath();
    data.sheetSettings.backgroundIconOpacity = getBackgroundIconOpacity();

    if (data.sheetSettings.backgroundIcon == "custom") {
      if (!data.sheetSettings.backgroundIconPath) {
        data.sheetSettings.backgroundIconPath = "/systems/cyphersystem/icons/background/icon-transparent.webp";
      }
    } else {
      data.sheetSettings.backgroundIconPath = "/systems/cyphersystem/icons/background/icon-" + getBackgroundIcon() + ".svg";
    }

    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // html.find("input[name='system.basic.cost']").change(changeEvent => {
    //   if ($(changeEvent.currentTarget.value) == "") {
    //     $(changeEvent.currentTarget.value) = 0;
    //   }
    // });

    html.find('.identify-item').click(clickEvent => {
      if (this.item.system.basic.identified) {
        this.item.update({"system.basic.identified": false});
      } else {
        this.item.update({"system.basic.identified": true});
      }
    });

    html.find('.input-tag').change(changeEvent => {
      if (!this.item.actor?.id) return;
      let currentTag = "#" + htmlEscape(this.item.name.trim());
      let newTag = "#" + htmlEscape(changeEvent.target.value.trim());
      let actor = game.actors.get(this.item.actor.id);

      renameTag(actor, currentTag, newTag);
    });

    html.find('.input-recursion').change(changeEvent => {
      if (!this.item.actor?.id) return;
      let currentTag = "@" + htmlEscape(this.item.name.trim());
      let newTag = "@" + htmlEscape(changeEvent.target.value.trim());
      let actor = game.actors.get(this.item.actor.id);

      renameTag(actor, currentTag, newTag);
    });

    html.find('.copy-as-skill').click(async clickEvent => {
      let actor = this.item.actor;
      if (!actor) return;
      let item = this.item;
      if (!["ability"].includes(item.type)) return;

      let itemData = {
        name: item.name,
        type: "skill",
        "system.settings.rollButton": item.system.settings.rollButton,
        "system.description": item.system.description,
        "system.basic.rating": item.system.settings.rollButton.skill,
        "system.settings.rollButton.pool": item.system.basic.pool,
        "system.settings.rollButton.additionalCost": item.system.basic.cost
      };

      await actor.createEmbeddedDocuments("Item", [itemData]);

      return ui.notifications.info(game.i18n.format("CYPHERSYSTEM.ItemCreatedAsSkill", {item: item.name}));
    });

    html.find('.copy-as-attack').click(async clickEvent => {
      let actor = this.item.actor;
      if (!actor) return;
      let item = this.item;
      if (!["ability"].includes(item.type)) return;

      let itemData = {
        name: item.name,
        type: "attack",
        "system.settings.rollButton": item.system.settings.rollButton,
        "system.description": item.system.description,
        "system.basic.type": "special ability",
        "system.basic.damage": item.system.settings.rollButton.damage,
        "system.basic.modifier": item.system.settings.rollButton.stepModifier,
        "system.basic.steps": item.system.settings.rollButton.additionalSteps,
        "system.basic.skillRating": item.system.settings.rollButton.skill,
        "system.settings.rollButton.pool": item.system.basic.pool,
        "system.settings.rollButton.additionalCost": item.system.basic.cost
      };

      await actor.createEmbeddedDocuments("Item", [itemData]);

      return ui.notifications.info(game.i18n.format("CYPHERSYSTEM.ItemCreatedAsAttack", {item: item.name}));
    });

    html.find('.copy-as-equipment').click(async clickEvent => {
      let actor = this.item.actor;
      if (!actor) return;
      let item = this.item;
      if (!["attack", "armor"].includes(item.type)) return;

      let itemData = {
        name: item.name,
        type: "equipment",
        "system.description": item.system.description
      };

      await actor.createEmbeddedDocuments("Item", [itemData]);

      return ui.notifications.info(game.i18n.format("CYPHERSYSTEM.ItemCreatedAsEquipment", {item: item.name}));
    });

    html.find('.copy-as-armor').click(async clickEvent => {
      let actor = this.item.actor;
      if (!actor) return;
      let item = this.item;
      if (!["attack", "armor"].includes(item.type)) return;

      let itemData = {
        name: item.name,
        type: "armor",
        "system.description": item.system.description,
        "system.basic.type": "special ability"
      };

      await actor.createEmbeddedDocuments("Item", [itemData]);

      return ui.notifications.info(game.i18n.format("CYPHERSYSTEM.ItemCreatedAsArmor", {item: item.name}));
    });
  }
}
