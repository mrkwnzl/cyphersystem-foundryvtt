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
      width: 650,
      height: 700,
      resizable: false,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body"}],
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

  // Reset Health
  html.find('.reset-health').click(clickEvent => {
    this.actor.update({
      "data.health.value": this.actor.data.data.health.max
    }).then(item => {
      this.render();
    });
  });

  // Increase Health
  html.find('.increase-health').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = this.actor.data.data.health.value + amount;
    this.actor.update({"data.health.value": newValue});
  });

  // Decrease Health
  html.find('.decrease-health').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = this.actor.data.data.health.value - amount;
    this.actor.update({"data.health.value": newValue});
  });

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
    if (event.ctrlKey || event.metaKey) {
      let message = "";
      let brackets = "";
      // let description = "";
      let description = "<hr style='margin:3px 0;'><img class='description-image-chat' src='" + item.img + "' width='50' height='50'/>" + item.data.description;
	  let points = "";
      let notes = "";
      if (item.data.notes != "") notes = ", " + item.data.notes;
      if (item.type == "skill" || item.type == "teen Skill") {
        brackets = " (" + item.data.skillLevel + ")";
      } else if (item.type == "power Shift") {
        brackets = " (" + item.data.powerShiftValue + " " + game.i18n.localize("CYPHERSYSTEM.Shifts") + ")";
      } else if (item.type == "ability" || item.type == "teen Ability") {
		points = (item.data.costPoints == "1") ? " " + game.i18n.localize("CYPHERSYSTEM.Point") : " " + game.i18n.localize("CYPHERSYSTEM.Points");
        if (item.data.costPoints != 0 && item.data.costPoints != 0) brackets = " (" + item.data.costPoints + " " + item.data.costPool + points + ")";
      } else if (item.type == "attack") {
		points = (item.data.damage == 1) ? " " + game.i18n.localize("CYPHERSYSTEM.PointOfDamage") : " " + game.i18n.localize("CYPHERSYSTEM.PointsOfDamage");
        let damage = ", " + item.data.damage + " " + points;
        let attackType = item.data.attackType;
        let range = "";
        if (item.data.range != "") range = ", " + item.data.range;
        brackets = " (" + attackType + damage + range + notes + ")";
      } else if (item.type == "armor" || item.type == "teen Armor") {
        brackets = " (" + item.data.armorType + notes + ")";
      } else if (item.type == "lasting Damage"){
        let permanent = "";
        if (item.data.damageType == "Permanent") permanent = ", " + game.i18n.localize("CYPHERSYSTEM.permanent");
        brackets = " (" + item.data.lastingDamagePool + permanent + ")";
      } else {
        if (item.data.level != "") brackets = " (" + game.i18n.localize("CYPHERSYSTEM.level") + " " + item.data.level + ")";
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
  // if (!this.actor.owner) return false;
  const item = await Item.fromDropData(data);
  const itemData = duplicate(item.data);

  // Handle item sorting within the same Actor
  const actor = this.actor;
  let sameActor = (data.actorId === actor._id) || (actor.isToken && (data.tokenId === actor.token.id));
  if (sameActor) return this._onSortItem(event, itemData);

  // Get origin actor. If any, get originItem
  let originActor;
  if (!data.tokenId) {
    originActor = game.actors.get(data.actorId);
  } else {
    originActor = canvas.tokens.get(data.tokenId).actor;
  }
  let originItem;
  if (originActor) { originItem = originActor.items.find(i => i.data._id === item.data._id) };

  // Create the owned item or increase quantity
  const itemOwned = actor.items.find(i => i.data.name === item.data.name && i.data.type === item.data.type);

  let hasQuantity = false;

  if ("quantity" in item.data.data) hasQuantity = true;

  // Activate settings for items
  if (itemData.type == "artifact") actor.update({"data.settings.equipment.artifacts": true});
  if (itemData.type == "cypher") actor.update({"data.settings.equipment.cyphers": true});
  if (itemData.type == "oddity") actor.update({"data.settings.equipment.oddities": true});
  if (itemData.type == "material") actor.update({"data.settings.equipment.materials": true});
  if (itemData.type == "ammo") actor.update({"data.settings.equipment.ammo": true});
  if (itemData.type == "power Shift") actor.update({"data.settings.powerShifts.active": true});
  if (itemData.type == "lasting Damage") actor.update({"data.settings.lastingDamage.active": true});
  if (itemData.type == "teen lasting Damage") actor.update({"data.settings.lastingDamage.active": true});

  if (!hasQuantity) {
    if (!itemOwned) this._onDropItemCreate(itemData);
    if (itemOwned) return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.AlreadyHasThisItem", {actor: actor.name}));
    if ((event.ctrlKey || event.metaKey) && originActor) {
      let d = new Dialog({
        title: game.i18n.localize("CYPHERSYSTEM.ItemShouldBeArchivedOrDeleted"),
        content: "",
        buttons: {
          move: {
            icon: '<i class="fas fa-archive"></i>',
            label: game.i18n.localize("CYPHERSYSTEM.Archive"),
            callback: (html) => archiveItem()
          },
          moveAll: {
            icon: '<i class="fas fa-trash"></i>',
            label: game.i18n.localize("CYPHERSYSTEM.Delete"),
            callback: (html) => deleteItem()
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
            callback: () => { }
          }
        },
        default: "move",
        close: () => { }
      });
      d.render(true);

      function archiveItem() {
        originItem.update({"data.archived": true})
      }

      function deleteItem() {
        originItem.delete();
      }
    }
  } else {
    if ((event.ctrlKey || event.metaKey) || item.data.data.quantity == null) {
      let maxQuantity = item.data.data.quantity;
      if (maxQuantity <= 0 && maxQuantity != null) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.CannotMoveNotOwnedItem"));
      let quantity = 1;
      moveDialog(quantity, itemData);

      function moveDialog(quantity, itemData) {
        // if (!quantity) quanitity = 1;
        let d = new Dialog({
          title: game.i18n.format("CYPHERSYSTEM.MoveItem", {name: itemData.name}),
          content: createContent(quantity),
          buttons: buttons(),
          default: "move",
          close: () => { }
        });
        d.render(true);
      }

      function createContent(quantity) {
        let maxQuantityText = "";
        if (maxQuantity != null) maxQuantityText = `&nbsp;&nbsp;${game.i18n.localize("CYPHERSYSTEM.Of")} ${maxQuantity}`;
        let content = `<div align="center">
        <label style='display: inline-block; width: 98px; text-align: right'><b>${game.i18n.localize("CYPHERSYSTEM.Quantity")}/${game.i18n.localize("CYPHERSYSTEM.Units")}: </b></label>
        <input name='quantity' id='quantity' style='width: 75px; margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=${quantity} data-dtype='Number'/>` + maxQuantityText + `</div>`;
        return content;
      }

      function buttons() {
        if (maxQuantity != null) {
          return ({move: {icon: '<i class="fas fa-share-square"></i>', label: game.i18n.localize("CYPHERSYSTEM.Move"), callback: (html) => moveItems(html.find('#quantity').val(), itemData)}, moveAll: {icon: '<i class="fas fa-share-square"></i>', label: game.i18n.localize("CYPHERSYSTEM.MoveAll"), callback: (html) => moveItems(maxQuantity, itemData)}, cancel: {icon: '<i class="fas fa-times"></i>', label: game.i18n.localize("CYPHERSYSTEM.Cancel"), callback: () => { }}})
        } else {
          return ({move: {icon: '<i class="fas fa-share-square"></i>', label: game.i18n.localize("CYPHERSYSTEM.Move"), callback: (html) => moveItems(html.find('#quantity').val(), itemData)}, cancel: {icon: '<i class="fas fa-times"></i>', label: game.i18n.localize("CYPHERSYSTEM.Cancel"), callback: () => { }}})
        }
      }

      function moveItems(quantity, itemData) {
        quantity = parseInt(quantity);
        if (item.data.data.quantity != null && (quantity > item.data.data.quantity || quantity <= 0)) {
          moveDialog(quantity, itemData);
          return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.CanOnlyMoveCertainAmountOfItems", {max: item.data.data.quantity}));
        }
        if (item.data.data.quantity && originActor) {
          let oldQuantity = item.data.data.quantity - parseInt(quantity);
          originItem.update({"data.quantity": oldQuantity});
        }
        if (!itemOwned) {
          itemData.data.quantity = quantity;
          actor.createOwnedItem(itemData);
        } else {
          let newQuantity = parseInt(itemOwned.data.data.quantity) + parseInt(quantity);
          itemOwned.update({"data.quantity": newQuantity});
        }
      }
    } else {
      if (!itemOwned) {
        if (!item.data.data.quantity) {
          itemData.data.quantity = 0;
        }
        this._onDropItemCreate(itemData);
      } else {
        let newQuantity = itemOwned.data.data.quantity + item.data.data.quantity;
        itemOwned.update({"data.quantity": newQuantity});
      }
    }
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
  let types = {
		"Ability": game.i18n.localize("ITEM.TypeAbility"),
		"Ammo": game.i18n.localize("ITEM.TypeAmmo"),
		"Armor": game.i18n.localize("ITEM.TypeArmor"),
		"Artifact": game.i18n.localize("ITEM.TypeArtifact"),
		"Attack": game.i18n.localize("ITEM.TypeAttack"),
		"Cypher": game.i18n.localize("ITEM.TypeCypher"),
		"Equipment": game.i18n.localize("ITEM.TypeEquipment"),
		"Lasting Damage": game.i18n.localize("ITEM.TypeLastingDamage"),
		"Material": game.i18n.localize("ITEM.TypeMaterial"),
		"Oddity": game.i18n.localize("ITEM.TypeOddity"),
		"Power Shift": game.i18n.localize("ITEM.TypePowerShift"),
		"Skill": game.i18n.localize("ITEM.TypeSkill"),
		"Teen Ability": game.i18n.localize("ITEM.TypeTeenAbility"),
		"Teen Armor": game.i18n.localize("ITEM.TypeTeenArmor"),
		"Teen Attack": game.i18n.localize("ITEM.TypeTeenAttack"),
		"Teen Lasting Damage": game.i18n.localize("ITEM.TypeTeenLastingDamage"),
		"Teen Skill": game.i18n.localize("ITEM.TypeTeenSkill"),
		"Default": game.i18n.localize("CYPHERSYSTEM.Items")
	};
  let itemType = (types[type.capitalize()] || types["Default"]);
  const name = game.i18n.format("ITEM.NewItem", {item: itemType});
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
