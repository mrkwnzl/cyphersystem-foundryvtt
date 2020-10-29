/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
export class CypherCommunitySheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["cyphersystem", "sheet", "actor", "community"],
            template: "systems/cyphersystem/templates/community-sheet.html",
            width: 600,
            height: 560,
            resizable: false,
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
            scrollY: [".sheet-body", ".tab", ".skills", ".biography", ".combat", ".items", ".abilities", ".settings"],
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
            
            // Prepare items.
            if (this.actor.data.type == 'Community') {
                this.cyphersystem(data);
            }

            return data;
        }
        
        /**
        * Organize and classify Items for Character sheets.
        *
        * @param {Object} actorData The actor to prepare.
        *
        * @return {undefined}
        */
        cyphersystem(sheetData) {
            const actorData = sheetData.actor;

            // Initialize containers. Const, weil es ein container ist, dessen Inhalt veränderbar ist.
            const equipment = [];
            const armor = [];
            const cyphers = [];
            const artifacts = [];
            const oddities = [];
            const materials = [];
            const ammo = [];

            // Iterate through items, allocating to containers
            // let totalWeight = 0;
            for (let i of sheetData.items) {
                // let item = i.data;
                i.img = i.img || DEFAULT_TOKEN;
      
                // Append to containers.
                if (i.type === 'equipment') {
                    equipment.push(i);
                }
                else if (i.type === 'ammo') {
                    ammo.push(i);
                }
                else if (i.type === 'armor') {
                    armor.push(i);
                }
                else if (i.type === 'cypher') {
                    cyphers.push(i);
                }
                else if (i.type === 'artifact') {
                    artifacts.push(i);
                }
                else if (i.type === 'oddity') {
                    oddities.push(i);
                }
                else if (i.type === 'material') {
                    materials.push(i);
                }
            }
    
            function byNameAscending(itemA, itemB) {
                let nameA = itemA.name.toLowerCase();
                let nameB = itemB.name.toLowerCase();

                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                return 0;
            }
    
            equipment.sort(byNameAscending);
            armor.sort(byNameAscending);
            cyphers.sort(byNameAscending);
            artifacts.sort(byNameAscending);
            oddities.sort(byNameAscending);
            materials.sort(byNameAscending);
            ammo.sort(byNameAscending);

            // Assign and return
            actorData.equipment = equipment;
            actorData.armor = armor;
            actorData.cyphers = cyphers;
            actorData.artifacts = artifacts;
            actorData.oddities = oddities;
            actorData.materials = materials;
            actorData.ammo = ammo;
  
        }
  
        /* -------------------------------------------- */

        /** @override */
        activateListeners(html) {
            super.activateListeners(html);

            // Everything below here is only needed if the sheet is editable
            if (!this.options.editable) return;

            // Reset Infrastructure
            html.find('.reset-infrastructure').click(clickEvent => {
                this.actor.update({
                    "data.infrastructure.value": this.actor.data.data.infrastructure.max
                }).then(item => {
                    this.render();
                });
            });
      
            // Reset Health
            html.find('.reset-health').click(clickEvent => {
                this.actor.update({
                    "data.health.value": this.actor.data.data.health.max
                }).then(item => {
                    this.render();
                });
            });
    
            function showSheetForActorAndItemWithID(actor, itemID) {
                const item = actor.getOwnedItem(itemID);
                item.sheet.render(true);
            }
    
            function itemForClickEvent(clickEvent) {
                return $(clickEvent.currentTarget).parents(".item");
            }
    
            // Add Inventory Item
            html.find('.item-create').click(clickEvent => {
                const itemCreatedPromise = this._onItemCreate(clickEvent);
                itemCreatedPromise.then(itemData => {
                    showSheetForActorAndItemWithID(this.actor, itemData._id);
                });
            });
    
            // Update Inventory Item
            html.find('.item-edit').click(clickEvent => {
                const editedItem = itemForClickEvent(clickEvent);
                showSheetForActorAndItemWithID(this.actor, editedItem.data("itemId"));
            });
    
            // Delete Inventory Item
            html.find('.item-delete').click(clickEvent => {
                const deletedItem = itemForClickEvent(clickEvent);
                this.actor.deleteOwnedItem(deletedItem.data("itemId"));
                deletedItem.slideUp(200, () => this.render(false));
            });
    
            // Show Item Description
            html.find('.item-description').click(clickEvent => {
                const shownItem = itemForClickEvent(clickEvent);
                const item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", shownItem.data("itemId")));
                if (window.event.ctrlKey || window.event.metaKey) {
                    let message = "<b>" + item.type.capitalize() + ": " + item.name + "</b>" + "<br>" + item.data.description;
                    ChatMessage.create({
                        speaker: ChatMessage.getSpeaker(),
                        content: message
                    })
                } else {
                    if (item.data.showDescription === true) {
                        item.data.showDescription = false;
                    }
                    else {
                        item.data.showDescription = true;
                    }
                    this.actor.updateEmbeddedEntity('OwnedItem', item);
                }
            });
            
            // Add 1 to Quantity
            html.find('.plus-one').click(clickEvent => {
                const shownItem = itemForClickEvent(clickEvent);
                const item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", shownItem.data("itemId")));
                item.data.quantity = item.data.quantity + 1;
                this.actor.updateEmbeddedEntity('OwnedItem', item);
            });
    
            // Subtract 1 from Quantity
            html.find('.minus-one').click(clickEvent => {
                const shownItem = itemForClickEvent(clickEvent);
                const item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", shownItem.data("itemId")));
                item.data.quantity = item.data.quantity - 1;
                this.actor.updateEmbeddedEntity('OwnedItem', item);
            });
            
            // Drag events for macros.
            if (this.actor.owner) {
                let handler = ev => this._onDragStart(ev);
                // Find all items on the character sheet.
                html.find('li.item').each((i, li) => {
                    // Ignore for the header row.
                    if (li.classList.contains("item-header")) return;
                    // Add draggable attribute and dragstart listener.
                    li.setAttribute("draggable", true);
                    li.addEventListener("dragstart", handler, false);
                });
            }
        }
        
        /**
        * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
        * @param {Event} event   The originating click event
        * @private
        */
        _onItemCreate(event) {
            event.preventDefault();
            const header = event.currentTarget;
            // Get the type of item to create.
            const type = header.dataset.type;
            // Grab any data associated with this control.
            const data = duplicate(header.dataset);
            // Initialize a default name.
            const name = `[New ${type.capitalize()}]`;
            // Prepare the item object.
            const itemData = {
                name: name,
                type: type,
                data: data
            };
            // Remove the type from the dataset since it's in the itemData.type prop.
            delete itemData.data["type"];

            // Finally, create the item!
            return this.actor.createOwnedItem(itemData);
        }
    }
