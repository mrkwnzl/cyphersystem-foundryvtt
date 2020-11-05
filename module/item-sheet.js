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
        // Return a single sheet for all item types.
        // return `${path}/item-sheet.html`;

        // Alternatively, you could use the following return statement to do a
        // unique item sheet by type, like `weapon-sheet.html`.
        return `${path}/item-${itemType}-sheet.html`;
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        const data = super.getData();
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
