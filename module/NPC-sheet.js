/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
export class CypherNPCSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["cyphersystem", "sheet", "actor", "npc"],
            template: "systems/cyphersystem/templates/NPC-sheet.html",
            width: 600,
            height: 610,
            resizable: false,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
            dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
        });
    }

    /* -------------------------------------------- */

    /** @override */
    getData() {
        const data = super.getData();
        data.dtypes = ["String", "Number", "Boolean"];
        /**for ( let attr of Object.values(data.data.attributes) ) {
            attr.isCheckbox = attr.dtype === "Boolean";
            }*/

            return data;
        }



        /* -------------------------------------------- */

        /** @override */
        activateListeners(html) {
            super.activateListeners(html);

            // Everything below here is only needed if the sheet is editable
            if (!this.options.editable) return;
  
            // Reset Health
            html.find('.reset-health').click(clickEvent => {
                this.actor.update({
                    "data.health.value": this.actor.data.data.health.max
                }).then(item => {
                    this.render();
                });
            });
  
        }
    }