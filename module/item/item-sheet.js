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
      resizable: false,
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

    // Sheet settings
    data.sheetSettings = {};
    data.sheetSettings.isGM = game.user.isGM;
    data.sheetSettings.isObserver = !this.options.editable;
    data.sheetSettings.rollButtons = game.settings.get("cyphersystem", "rollButtons");
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
  }
}
