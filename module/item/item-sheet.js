/**
* Extend the basic ItemSheet with some very simple modifications
* @extends {ItemSheet}
*/

import { renameTag } from "../macros/macro-helper.js";
import { htmlEscape } from "../utilities/html-escape.js";

export class CypherItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "item", "item-sheet"],
      template: "systems/cyphersystem/templates/item-sheet.html",
      width: 550,
      height: 645,
      resizable: false,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
      scrollY: [".sheet-body", ".tab"]
    });
  }

  /** @override */
  get template() {
    const path = "systems/cyphersystem/templates/item";
    const itemType = this.item.data.type.toLowerCase().replace(/ /g, "-");
    return `${path}/${itemType}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const superData = super.getData();
    console.log('superData', superData)
    const data = superData.data.system;
    data.item = superData.item;
    data.isGM = game.user.isGM;
    data.isObserver = !this.options.editable;
    data.rollButtons = game.settings.get("cyphersystem", "rollButtons");
    data.spells = game.i18n.localize("CYPHERSYSTEM.Spells");
    data.dtypes = ["String", "Number", "Boolean"];
    data.actor = data.item.parent ? data.item.parent.data : "";

    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find('.identify-item').click(clickEvent => {
      if (this.item.data.data.identified) {
        this.item.update({ "data.identified": false })
      } else {
        this.item.update({ "data.identified": true })
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
