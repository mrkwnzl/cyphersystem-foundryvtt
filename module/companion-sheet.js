/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
export class CypherCompanionSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "actor", "companion"],
      template: "systems/cyphersystem/templates/companion-sheet.html",
      width: 600,
      height: 640,
      resizable: false,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills"}],
      scrollY: [".sheet-body", ".tab", ".skills", ".description", ".settings", ".items"],
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
  if (this.actor.data.type == 'Companion') {
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
  const abilities = [];
  const skills = [];
  const skillsSortedByRating = [];
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
    if (i.type === 'ability' && !hidden) {
      abilities.push(i);
    }
    else if (i.type === 'skill' && !hidden) {
      skills.push(i);
      skillsSortedByRating.push(i);
    }
    else if (i.type === 'equipment' && !hidden) {
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

  abilities.sort(byNameAscending);
  skills.sort(byNameAscending);
  skillsSortedByRating.sort(byNameAscending);
  equipment.sort(byNameAscending);
  armor.sort(byNameAscending);
  cyphers.sort(byNameAscending);
  artifacts.sort(byNameAscending);
  oddities.sort(byNameAscending);
  materials.sort(byNameAscending);
  ammo.sort(byNameAscending);

  // sort skills
  function bySkillRating(itemA, itemB) {
    let ratingA;
    let ratingB;

    if (itemA.data.skillLevel === 'Specialized') {ratingA = 1}
    else if (itemA.data.skillLevel === 'Trained') {ratingA = 2}
    else if (itemA.data.skillLevel === 'Practiced') {ratingA = 3}
    else if (itemA.data.skillLevel === 'Inability') {ratingA = 4}

    if (itemB.data.skillLevel === 'Specialized') {ratingB = 1}
    else if (itemB.data.skillLevel === 'Trained') {ratingB = 2}
    else if (itemB.data.skillLevel === 'Practiced') {ratingB = 3}
    else if (itemB.data.skillLevel === 'Inability') {ratingB = 4}

    if (ratingA < ratingB) {
      return -1;
    }
    if (ratingA > ratingB) {
      return 1;
    }
    return 0;
  }

  skillsSortedByRating.sort(bySkillRating);

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

  abilities.sort(byArchiveStatus);
  skills.sort(byArchiveStatus);
  skillsSortedByRating.sort(byArchiveStatus);
  equipment.sort(byArchiveStatus);
  armor.sort(byArchiveStatus);
  cyphers.sort(byArchiveStatus);
  artifacts.sort(byArchiveStatus);
  oddities.sort(byArchiveStatus);
  materials.sort(byArchiveStatus);
  ammo.sort(byArchiveStatus);

  // Assign and return
  actorData.abilities = abilities;
  actorData.skills = skills;
  actorData.skillsSortedByRating = skillsSortedByRating;
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
    if (item.data.showDescription === true) {
      item.data.showDescription = false;
    }
    else {
      item.data.showDescription = true;
    }
    this.actor.updateEmbeddedEntity('OwnedItem', item);
  });

  // Reset Health
  html.find('.reset-health').click(clickEvent => {
    this.actor.update({
      "data.health.value": this.actor.data.data.health.max
    }).then(item => {
      this.render();
    });
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
