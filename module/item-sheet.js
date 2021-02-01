/**
* Extend the basic ItemSheet with some very simple modifications
* @extends {ItemSheet}
*/
export class CypherItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "item", "item-sheet"],
      template: "systems/cyphersystem/templates/item-sheet.html",
      width: 550,
      height: 560,
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
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];

    if (this.item.data.type == 'attack' || this.item.data.type == 'teen Attack') {
      this.attackFunctions(data);
    }

    return data;
  }

  attackFunctions(sheetData) {
    const item = sheetData.item;

    let skillRating = 0;
    let modifiedBy = item.data.modifiedBy;
    let totalModifier = 0;
    let totalModified = "";

    if (item.data.skillRating == "Inability") skillRating = -1;
    if (item.data.skillRating == "Trained") skillRating = 1;
    if (item.data.skillRating == "Specialized") skillRating = 2;

    if (item.data.modified == "hindered") modifiedBy = modifiedBy * -1;

    totalModifier = skillRating + modifiedBy;

    if (totalModifier == 1) totalModified = "eased";
    if (totalModifier >= 2) totalModified = "eased by " + totalModifier + " steps";
    if (totalModifier == -1) totalModified = "hindered";
    if (totalModifier <= -2) totalModified = "hindered by " + Math.abs(totalModifier) + " steps";

    // Assign and return
    this.item.update({"data.totalModified": totalModified});
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;
  }
}
