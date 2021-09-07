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
      height: 645,
      resizable: false,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
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
    const data = superData.data;
    data.item = superData.item;
    data.data.isGM = game.user.isGM;
    data.data.isObserver = !this.options.editable;
    data.data.rollButtons = game.settings.get("cyphersystem", "rollButtons");
    data.dtypes = ["String", "Number", "Boolean"];

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
  }
}
