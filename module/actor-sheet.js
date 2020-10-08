/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class CypherActorSheet extends ActorSheet {

  /** @override */
	static get defaultOptions() {
	  return mergeObject(super.defaultOptions, {
  	  classes: ["cyphersystem", "sheet", "actor"],
  	  template: "systems/cyphersystem/templates/actor-sheet.html",
      width: 600,
      height: 700,
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
    
    equipment.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });

    abilities.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });

    skills.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });

    attacks.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });

    armor.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });

    lastingDamage.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });

    powerShifts.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });
    
    cyphers.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });
    
    artifacts.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });
    
    oddities.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });
    
    teenSkills.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });
    
    teenAbilities.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });
    
    teenAttacks.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });
    
    teenArmor.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });
    
    teenLastingDamage.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });
    
    materials.sort((a, b) => {
      let fa = a.name.toLowerCase(),
      fb = b.name.toLowerCase();

      if (fa < fb) {
        return -1;
      }
      if (fa > fb) {
        return 1;
      }
      return 0;
    });

    // let, weil der Wert selbst verändert wird.
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
    
    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
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
