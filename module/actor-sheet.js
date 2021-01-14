/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/

export class CypherActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "actor", "pc"],
      template: "systems/cyphersystem/templates/actor-sheet.html",
      width: 600,
      height: 735,
      resizable: false,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills"}],
      scrollY: [".sheet-body", ".tab", ".skills", ".biography", ".combat", ".items", ".abilities", ".settings"],
      dragDrop: [{dragSelector: ".item-list .item", dropSelector: null}]
    });
  }

  /** @override */
  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];

    // Prepare items.
    if (this.actor.data.type == 'PC') {
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
    const abilities = [];
    const skills = [];
    const skillsSortedByRating = [];
    const attacks = [];
    const armor = [];
    const lastingDamage = [];
    const powerShifts = [];
    const cyphers = [];
    const artifacts = [];
    const oddities = [];
    const teenSkills = [];
    const teenSkillsSortedByRating = [];
    const teenAbilities = [];
    const teenAttacks = [];
    const teenArmor = [];
    const teenLastingDamage = [];
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
      else if (i.type === 'ability' && !hidden) {
        abilities.push(i);
      }
      else if (i.type === 'skill' && !hidden) {
        skills.push(i);
        skillsSortedByRating.push(i);
      }
      else if (i.type === 'attack' && !hidden) {
        attacks.push(i);
      }
      else if (i.type === 'armor' && !hidden) {
        armor.push(i);
      }
      else if (i.type === 'lasting Damage' && !hidden) {
        lastingDamage.push(i);
      }
      else if (i.type === 'power Shift' && !hidden) {
        powerShifts.push(i);
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
      else if (i.type === 'teen Skill' && !hidden) {
        teenSkills.push(i);
        teenSkillsSortedByRating.push(i);
      }
      else if (i.type === 'teen Ability' && !hidden) {
        teenAbilities.push(i);
      }
      else if (i.type === 'teen Attack' && !hidden) {
        teenAttacks.push(i);
      }
      else if (i.type === 'teen Armor' && !hidden) {
        teenArmor.push(i);
      }
      else if (i.type === 'teen lasting Damage' && !hidden) {
        teenLastingDamage.push(i);
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
    abilities.sort(byNameAscending);
    skills.sort(byNameAscending);
    skillsSortedByRating.sort(byNameAscending);
    attacks.sort(byNameAscending);
    armor.sort(byNameAscending);
    lastingDamage.sort(byNameAscending);
    powerShifts.sort(byNameAscending);
    cyphers.sort(byNameAscending);
    artifacts.sort(byNameAscending);
    oddities.sort(byNameAscending);
    teenSkills.sort(byNameAscending);
    teenSkillsSortedByRating.sort(byNameAscending);
    teenAbilities.sort(byNameAscending);
    teenAttacks.sort(byNameAscending);
    teenArmor.sort(byNameAscending);
    teenLastingDamage.sort(byNameAscending);
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
    teenSkillsSortedByRating.sort(bySkillRating);

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
    abilities.sort(byArchiveStatus);
    skills.sort(byArchiveStatus);
    skillsSortedByRating.sort(byArchiveStatus);
    attacks.sort(byArchiveStatus);
    armor.sort(byArchiveStatus);
    lastingDamage.sort(byArchiveStatus);
    powerShifts.sort(byArchiveStatus);
    cyphers.sort(byArchiveStatus);
    artifacts.sort(byArchiveStatus);
    oddities.sort(byArchiveStatus);
    teenSkills.sort(byArchiveStatus);
    teenSkillsSortedByRating.sort(byArchiveStatus);
    teenAbilities.sort(byArchiveStatus);
    teenAttacks.sort(byArchiveStatus);
    teenArmor.sort(byArchiveStatus);
    teenLastingDamage.sort(byArchiveStatus);
    materials.sort(byArchiveStatus);
    ammo.sort(byArchiveStatus);
    skillsSortedByRating.sort(byArchiveStatus);
    teenSkillsSortedByRating.sort(byArchiveStatus);

    // let, weil der Wert selbst verändert wird: const würde erwarten, dass er unverändert bleibt
    let armorTotal = 0;
    let speedCostTotal = 0;
    let teenArmorTotal = 0;
    let teenSpeedCostTotal = 0;

    for (let piece of armor) {
      if (piece.data.armorActive === true && piece.data.archived === false) {
        armorTotal = armorTotal + piece.data.armorValue;
        speedCostTotal = speedCostTotal + piece.data.speedCost;
      }
    }

    for (let piece of teenArmor) {
      if (piece.data.armorActive === true && piece.data.archived === false) {
        teenArmorTotal = teenArmorTotal + piece.data.armorValue;
        teenSpeedCostTotal = teenSpeedCostTotal + piece.data.speedCost;
      }
    }

    // Assign and return
    this.actor.update({"data.armor.armorValueTotal": armorTotal});
    this.actor.update({"data.armor.speedCostTotal": speedCostTotal});
    this.actor.update({"data.teen.armor.armorValueTotal": teenArmorTotal});
    this.actor.update({"data.teen.armor.speedCostTotal": teenSpeedCostTotal});
    actorData.equipment = equipment;
    actorData.abilities = abilities;
    actorData.skills = skills;
    actorData.skillsSortedByRating = skillsSortedByRating;
    actorData.attacks = attacks;
    actorData.armor = armor;
    actorData.lastingDamage = lastingDamage;
    actorData.powerShifts = powerShifts;
    actorData.cyphers = cyphers;
    actorData.artifacts = artifacts;
    actorData.oddities = oddities;
    actorData.teenSkills = teenSkills;
    actorData.teenSkillsSortedByRating = teenSkillsSortedByRating;
    actorData.teenAbilities = teenAbilities;
    actorData.teenAttacks = teenAttacks;
    actorData.teenArmor = teenArmor;
    actorData.teenLastingDamage = teenLastingDamage;
    actorData.materials = materials;
    actorData.ammo = ammo;

  }

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
      if (event.ctrlKey || event.metaKey) {
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

    // Change Armor Active
    html.find('.armor-active').click(clickEvent => {
      const shownItem = itemForClickEvent(clickEvent);
      const item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", shownItem.data("itemId")));
      if (item.data.armorActive === true) {
        item.data.armorActive = false;
      }
      else {
        item.data.armorActive = true;
      }
      this.actor.updateEmbeddedEntity('OwnedItem', item);
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

    // Add 1 to Lasting Damage
    html.find('.plus-one-damage').click(clickEvent => {
      const shownItem = itemForClickEvent(clickEvent);
      const item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", shownItem.data("itemId")));
      item.data.lastingDamageAmount = item.data.lastingDamageAmount + 1;
      this.actor.updateEmbeddedEntity('OwnedItem', item);
    });

    // Subtract 1 from Lasting Damage
    html.find('.minus-one-damage').click(clickEvent => {
      const shownItem = itemForClickEvent(clickEvent);
      const item = duplicate(this.actor.getEmbeddedEntity("OwnedItem", shownItem.data("itemId")));
      item.data.lastingDamageAmount = item.data.lastingDamageAmount - 1;
      this.actor.updateEmbeddedEntity('OwnedItem', item);
    });

    // Reset Might
    html.find('.reset-might').click(clickEvent => {
      this.actor.update({
        "data.pools.might.value": this.actor.data.data.pools.might.max
      }).then(item => {
        this.render();
      });
    });

    // Reset Speed
    html.find('.reset-speed').click(clickEvent => {
      this.actor.update({
        "data.pools.speed.value": this.actor.data.data.pools.speed.max
      }).then(item => {
        this.render();
      });
    });

    // Reset Intellect
    html.find('.reset-intellect').click(clickEvent => {
      this.actor.update({
        "data.pools.intellect.value": this.actor.data.data.pools.intellect.max
      }).then(item => {
        this.render();
      });
    });

    // Reset Additional Pool
    html.find('.reset-additionalPool').click(clickEvent => {
      this.actor.update({
        "data.pools.additional.value": this.actor.data.data.pools.additional.max
      }).then(item => {
        this.render();
      });
    });

    // Reset Additional Teen Pool
    html.find('.reset-teen-additionalPool').click(clickEvent => {
      this.actor.update({
        "data.teen.pools.additional.value": this.actor.data.data.teen.pools.additional.max
      }).then(item => {
        this.render();
      });
    });

    // Reset Teen Might
    html.find('.reset-teen-might').click(clickEvent => {
      this.actor.update({
        "data.teen.pools.might.value": this.actor.data.data.teen.pools.might.max
      }).then(item => {
        this.render();
      });
    });

    // Reset Teen Speed
    html.find('.reset-teen-speed').click(clickEvent => {
      this.actor.update({
        "data.teen.pools.speed.value": this.actor.data.data.teen.pools.speed.max
      }).then(item => {
        this.render();
      });
    });

    // Reset Teen Might
    html.find('.reset-teen-intellect').click(clickEvent => {
      this.actor.update({
        "data.teen.pools.intellect.value": this.actor.data.data.teen.pools.intellect.max
      }).then(item => {
        this.render();
      });
    });

    // Reset Advancements
    html.find('.reset-advancement').click(clickEvent => {
      this.actor.update({
        "data.advancement.advStats": false,
        "data.advancement.advEffort": false,
        "data.advancement.advEdge": false,
        "data.advancement.advSkill": false,
        "data.advancement.advOther": false
      }).then(item => {
        this.render();
      });
    });

    // Reset Recovery Rolls
    html.find('.reset-recovery-rolls').click(clickEvent => {
      this.actor.update({
        "data.recoveries.oneAction": false,
        "data.recoveries.oneActionTwo": false,
        "data.recoveries.oneActionThree": false,
        "data.recoveries.oneActionFour": false,
        "data.recoveries.oneActionFive": false,
        "data.recoveries.tenMinutes": false,
        "data.recoveries.oneHour": false,
        "data.recoveries.tenHours": false
      }).then(item => {
        this.render();
      });
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
