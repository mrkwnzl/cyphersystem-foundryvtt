/**
* Extend the basic ItemSheet with some very simple modifications
* @extends {ItemSheet}
*/
export class CypherItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "item", "item-sheet"],
      template: "systems/cyphersystem/templates/item-sheet.html",
      width: 550,
      height: 630,
      resizable: false,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
    });
  }

  /** @override */
  get template() {
    const path = "systems/cyphersystem/templates";
    const itemType = this.item.data.type.toLowerCase();
    return `${path}/item-${itemType}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const superData = super.getData();
    const data = superData.data;
    data.item = superData.item;
    data.dtypes = ["String", "Number", "Boolean"];

    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
  }
}
