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
      height: 797,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills"}],
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
    const attacks = [];
    const armor = [];
    const lastingDamage = [];
    const powerShifts = [];
    const cyphers = [];
    const artifacts = [];
    const oddities = [];
    const teenSkills = [];
    const teenAbilities = [];
    const teenAttacks = [];
    const teenArmor = [];
    const teenLastingDamage = [];
    const materials = [];

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
      // let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;
      
      // Append to containers.
      if (i.type === 'equipment') {
        equipment.push(i);
      }
      else if (i.type === 'ability') {
        abilities.push(i);
      }
      else if (i.type === 'skill') {
        skills.push(i);
      }
      else if (i.type === 'attack') {
        attacks.push(i);
      }
      else if (i.type === 'armor') {
        armor.push(i);
      }
      else if (i.type === 'lasting Damage') {
        lastingDamage.push(i);
      }
      else if (i.type === 'power Shift') {
        powerShifts.push(i);
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
      else if (i.type === 'teen Skill') {
        teenSkills.push(i);
      }
      else if (i.type === 'teen Ability') {
        teenAbilities.push(i);
      }
      else if (i.type === 'teen Attack') {
        teenAttacks.push(i);
      }
      else if (i.type === 'teen Armor') {
        teenArmor.push(i);
      }
      else if (i.type === 'teen lasting Damage') {
        teenLastingDamage.push(i);
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
    abilities.sort(byNameAscending);
    skills.sort(byNameAscending);
    attacks.sort(byNameAscending);
    armor.sort(byNameAscending);
    lastingDamage.sort(byNameAscending);
    powerShifts.sort(byNameAscending);
    cyphers.sort(byNameAscending);
    artifacts.sort(byNameAscending);
    oddities.sort(byNameAscending);
    teenSkills.sort(byNameAscending);
    teenAbilities.sort(byNameAscending);
    teenAttacks.sort(byNameAscending);
    teenArmor.sort(byNameAscending);
    teenLastingDamage.sort(byNameAscending);
    materials.sort(byNameAscending);

    // let, weil der Wert selbst verändert wird: const würde erwarten, dass er unverändert bleibt
    let armorTotal = 0;
    let speedCostTotal = 0;
    let teenArmorTotal = 0;
    let teenSpeedCostTotal = 0;

    for (let piece of armor) {
      if (piece.data.armorActive === true) {
        armorTotal = armorTotal + piece.data.armorValue;
        speedCostTotal = speedCostTotal + piece.data.speedCost;
      }
    }
    
    for (let piece of teenArmor) {
      if (piece.data.armorActive === true) {
        teenArmorTotal = teenArmorTotal + piece.data.armorValue;
        teenSpeedCostTotal = teenSpeedCostTotal + piece.data.speedCost;
      }
    }

    // Assign and return
    actorData.data.armor.armorValueTotal = armorTotal;
    actorData.data.armor.speedCostTotal = speedCostTotal;
    actorData.data.teen.armor.armorValueTotal = teenArmorTotal;
    actorData.data.teen.armor.speedCostTotal = teenSpeedCostTotal;
    actorData.equipment = equipment;
    actorData.abilities = abilities;
    actorData.skills = skills;
    actorData.attacks = attacks;
    actorData.armor = armor;
    actorData.lastingDamage = lastingDamage;
    actorData.powerShifts = powerShifts;
    actorData.cyphers = cyphers;
    actorData.artifacts = artifacts;
    actorData.oddities = oddities;
    actorData.teenSkills = teenSkills;
    actorData.teenAbilities = teenAbilities;
    actorData.teenAttacks = teenAttacks;
    actorData.teenArmor = teenArmor;
    actorData.teenLastingDamage = teenLastingDamage;
    actorData.materials = materials;
  
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
      this.actor.deleteOwnedItem(deletedItem.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });
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
