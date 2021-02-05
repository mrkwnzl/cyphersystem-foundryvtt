/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
export class CypherTokenSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "actor", "token"],
      template: "systems/cyphersystem/templates/token-sheet.html",
      width: 600,
      height: 560,
      resizable: false,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      scrollY: [".sheet-body", ".tab", ".skills", ".description",".items",".settings"],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];

    // Prepare items.
    if (this.actor.data.type == 'Token') {
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

      let hidden = false;
      if (actorData.data.settings.hideArchived && i.data.archived) hidden = true;

      // Append to containers.
      if (i.type === 'equipment' && !hidden) {
        equipment.push(i);
      }
      else if (i.type === 'ammo' && !hidden) {
        ammo.push(i);
      }
      else if (i.type === 'armor' && !hidden) {
        armor.push(i);
      }
      else if (i.type === 'cypher' && !hidden) {
        cyphers.push(i);
      }
      else if (i.type === 'artifact' && !hidden) {
        artifacts.push(i);
      }
      else if (i.type === 'oddity' && !hidden) {
        oddities.push(i);
      }
      else if (i.type === 'material' && !hidden) {
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

    function byArchiveStatus(itemA, itemB) {
      let ratingA;
      let ratingB;

      if (!itemA.data.archived) itemA.data.archived = false;
      if (!itemB.data.archived) itemB.data.archived = false;

      if (itemA.data.archived === false) {ratingA = 1}
      else if (itemA.data.archived === true) {ratingA = 2}

      if (itemB.data.archived === false) {ratingB = 1}
      else if (itemB.data.archived === true) {ratingB = 2}

      if (ratingA < ratingB) {
        return -1;
      }
      if (ratingA > ratingB) {
        return 1;
      }
      return 0;
    }

    equipment.sort(byArchiveStatus);
    armor.sort(byArchiveStatus);
    cyphers.sort(byArchiveStatus);
    artifacts.sort(byArchiveStatus);
    oddities.sort(byArchiveStatus);
    materials.sort(byArchiveStatus);
    ammo.sort(byArchiveStatus);

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

    // Reset Quantity
    html.find('.reset-quantity').click(clickEvent => {
      this.actor.update({
        "data.quantity.value": this.actor.data.data.quantity.max
      }).then(item => {
        this.render();
      });
    });

    // Increase Quantity
    html.find('.increase-quantity').click(clickEvent => {
      let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
      let newValue = this.actor.data.data.quantity.value + amount;
      this.actor.update({"data.quantity.value": newValue});
    });

    // Decrease Quantity
    html.find('.decrease-quantity').click(clickEvent => {
      let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
      let newValue = this.actor.data.data.quantity.value - amount;
      this.actor.update({"data.quantity.value": newValue});
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
      if (event.ctrlKey || event.metaKey) {
        this.actor.deleteOwnedItem(deletedItem.data("itemId"));
        deletedItem.slideUp(200, () => this.render(false));
      } else {
        const item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", deletedItem.data("itemId")));

        if (item.data.archived === true) {
          item.data.archived = false;
        }
        else {
          item.data.archived = true;
        }
        this.actor.updateEmbeddedEntity('OwnedItem', item);
      }
    });

    // Show Item Description
    html.find('.item-description').click(clickEvent => {
      const shownItem = itemForClickEvent(clickEvent);
      const item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", shownItem.data("itemId")));
      if (event.ctrlKey || event.metaKey) {
        let message = "";
        let brackets = "";
        let description = "";
        if (item.data.description != "") description = "<hr style='margin:3px 0;'>" + item.data.description;
        let points = " points";
        let notes = "";
        if (item.data.notes != "") notes = ", " + item.data.notes;
        if (item.type == "skill" || item.type == "teen Skill") {
          brackets = " (" + item.data.skillLevel + ")";
        } else if (item.type == "power Shift") {
          brackets = " (" + item.data.powerShiftValue + " Shifts)"
        } else if (item.type == "ability" || item.type == "teen Ability") {
          if (item.data.costPoints == "1") points = " point"
          if (item.data.costPoints != 0 && item.data.costPoints != 0) brackets = " (" + item.data.costPoints + " " + item.data.costPool + points + ")"
        } else if (item.type == "attack") {
          if (item.data.damage == 1) points = " point"
          let damage = ", " + item.data.damage + points + " of damage"
          let attackType = item.data.attackType;
          let range = "";
          if (item.data.range != "") range = ", " + item.data.range;
          brackets = " (" + attackType + damage + range + notes + ")";
        } else if (item.type == "armor" || item.type == "teen Armor") {
          brackets = " (" + item.data.armorType + notes + ")";
        } else if (item.type == "lasting Damage"){
          let permanent = "";
          if (item.data.damageType == "Permanent") permanent = ", permanent";
          brackets = " (" + item.data.lastingDamagePool + permanent + ")";
        } else {
          if (item.data.level != "") brackets = " (level " + item.data.level + ")";
        }
        message = "<b>" + item.type.capitalize() + ": " + item.name + "</b>" + brackets + description;
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
      if (event.ctrlKey || event.metaKey) {
        item.data.quantity = item.data.quantity + 10;
      } else {
        item.data.quantity = item.data.quantity + 1;
      }
      this.actor.updateEmbeddedEntity('OwnedItem', item);
    });

    // Subtract 1 from Quantity
    html.find('.minus-one').click(clickEvent => {
      const shownItem = itemForClickEvent(clickEvent);
      const item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", shownItem.data("itemId")));
      if (event.ctrlKey || event.metaKey) {
        item.data.quantity = item.data.quantity - 10;
      } else {
        item.data.quantity = item.data.quantity - 1;
      }
      this.actor.updateEmbeddedEntity('OwnedItem', item);
    });

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = ev => this._onDragStart(ev);
      // Find all items on the character sheet.
      html.find('li.item').each((i, li) => {
        // Ignore for the header row.
        if (li.classList.contains("item-header")) return;
        if (li.classList.contains("non-draggable")) return;
        if (li.classList.contains("item-settings")) return;
        // Add draggable attribute and dragstart listener.
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {Object} data         The data transfer extracted from the event
   * @return {Promise<Object>}    A data object which describes the result of the drop
   * @private
   */
  async _onDropItem(event, data) {
    event.preventDefault();
    if (!this.actor.owner) return false;
    const item = await Item.fromDropData(data);
    const itemData = duplicate(item.data);

    // Handle item sorting within the same Actor
    const actor = this.actor;
    let sameActor = (data.actorId === actor._id) || (actor.isToken && (data.tokenId === actor.token.id));
    if (sameActor) return this._onSortItem(event, itemData);

    // Create the owned item or increase quantity
    const itemOwned = actor.items.find(i => i.data.name === item.data.name)
    let hasQuantity = false;

    if ("quantity" in item.data.data) hasQuantity = true;

    if (!itemOwned || !hasQuantity) {
      return this._onDropItemCreate(itemData);
    } else {
      let newQuantity = itemOwned.data.data.quantity + item.data.data.quantity;
      itemOwned.update({"data.quantity": newQuantity});
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
