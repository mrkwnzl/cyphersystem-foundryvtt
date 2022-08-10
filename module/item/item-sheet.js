/**
* Extend the basic ItemSheet with some very simple modifications
* @extends {ItemSheet}
*/

import {renameTag} from "../macros/macro-helper.js";
import {htmlEscape} from "../utilities/html-escape.js";

export class CypherItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "item", "item-sheet"],
      width: 550,
      height: 645,
      resizable: false,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      scrollY: [".sheet-body", ".tab"]
    });
  }

  /** @override */
  get template() {
    const path = "systems/cyphersystem/templates/item-sheets";
    const itemType = this.item.type.toLowerCase().replace(/ /g, "-").replace("teen-", "");
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
    data.sheetSettings.identified = this.item.system.identified;

    // Enriched HTML
    data.enrichedHTML = {};
    data.enrichedHTML.description = await TextEditor.enrichHTML(this.item.system.description, {async: true, secrets: this.item.isOwner});

    data.actor = data.item.parent ? data.item.parent : "";

    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find('.identify-item').click(clickEvent => {
      if (this.item.system.identified) {
        this.item.update({"system.identified": false})
      } else {
        this.item.update({"system.identified": true})
      }
    });

    html.find('.input-tag').change(changeEvent => {
      let currentTag = "#" + htmlEscape(this.item.name.trim());
      let newTag = "#" + htmlEscape(changeEvent.target.value.trim());
      let actor = game.actors.get(this.item.actor.id);

      renameTag(actor, currentTag, newTag);
    });

    html.find('.input-recursion').change(changeEvent => {
      let currentTag = "@" + htmlEscape(this.item.name.trim());
      let newTag = "@" + htmlEscape(changeEvent.target.value.trim());
      let actor = game.actors.get(this.item.actor.id);

      renameTag(actor, currentTag, newTag);
    });
  }
}
