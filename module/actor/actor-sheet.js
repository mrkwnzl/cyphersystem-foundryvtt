/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/

import {
  chatCardMarkItemIdentified
} from "../utilities/chat-cards.js";

import {
  itemRollMacro,
  recursionMacro,
  tagMacro
} from "../macros/macros.js";

import {
  byNameAscending,
  bySkillRating,
  byArchiveStatus,
  byIdentifiedStatus
} from "../utilities/sorting.js";

import { useRecoveries } from "../utilities/actor-utilities.js";

export class CypherActorSheet extends ActorSheet {

  /** @override */
  getData() {
    const superData = super.getData();
    console.log('superData', superData)
    const data = superData.actor.data.system;
    const user = game.users.find(({_id}) => game.data.userId === _id);
    console.log('user', user, superData.actor.data._id, data )
    data.isGM = user?.isGM
    data.isLimited = this.actor.limited;
    data.isObserver = !this.options.editable;
    data.slashForFractions = game.settings.get("cyphersystem", "useSlashForFractions") ? "/" : "|";
    data.actor = superData.actor;
    data.items = superData.items;
    data.owner = superData.owner;
    data.options = superData.options;
    data.effects = superData.effects;

    data.dtypes = ["String", "Number", "Boolean"];

    // Prepare items
    this.cyphersystem(data);

    return data;
  }

  /**
  * Organize and classify Items for Character sheets.
  *
  * @param {Object} actorData The actor to prepare.
  *
  * @return {undefined}
  */
  cyphersystem(data) {
    const actorData = data.actor.data;

    // Initialize containers
    const equipment = [];
    const abilities = [];
    const spells = [];
    const abilitiesTwo = [];
    const abilitiesThree = [];
    const abilitiesFour = [];
    const skills = [];
    const skillsTwo = [];
    const skillsThree = [];
    const skillsFour = [];
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
    const ammo = [];
    const recursions = [];
    const tags = []

    // Iterate through items, allocating to containers
    for (let i of data.items) {
      // let item = i.data;
      i.img = i.img || DEFAULT_TOKEN;

      // Check for hidden item
      let hidden = false;
      if (actorData.data.settings.hideArchived && i.data.archived) hidden = true;

      // Check for roll button on level
      if (i.type == "cypher" || i.type == "artifact") {
        if (Roll.validate(i.data.level.toString()) && i.data.level && isNaN(i.data.level)) {
          i.data.rollForLevel = true;
        } else {
          i.data.rollForLevel = false;
        }
      }

      // Append to containers
      if (i.type === 'equipment' && !hidden) {
        equipment.push(i);
      }
      else if (i.type === 'ammo' && !hidden) {
        ammo.push(i);
      }
      else if (i.type === 'ability' && !hidden && !(i.data.sorting == "Spell" || i.data.sorting == "AbilityTwo" || i.data.sorting == "AbilityThree" || i.data.sorting == "AbilityFour")) {
        abilities.push(i);
      }
      else if (i.type === 'ability' && !hidden && i.data.sorting == "Spell") {
        spells.push(i);
      }
      else if (i.type === 'ability' && !hidden && i.data.sorting == "AbilityTwo") {
        abilitiesTwo.push(i);
      }
      else if (i.type === 'ability' && !hidden && i.data.sorting == "AbilityThree") {
        abilitiesThree.push(i);
      }
      else if (i.type === 'ability' && !hidden && i.data.sorting == "AbilityFour") {
        abilitiesFour.push(i);
      }
      else if (i.type === 'skill' && !hidden && !(i.data.sorting == "SkillTwo" || i.data.sorting == "SkillThree" || i.data.sorting == "SkillFour")) {
        skills.push(i);
      }
      else if (i.type === 'skill' && !hidden && i.data.sorting == "SkillTwo") {
        skillsTwo.push(i);
      }
      else if (i.type === 'skill' && !hidden && i.data.sorting == "SkillThree") {
        skillsThree.push(i);
      }
      else if (i.type === 'skill' && !hidden && i.data.sorting == "SkillFour") {
        skillsFour.push(i);
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
      else if (i.type === 'recursion' && !hidden) {
        recursions.push(i);
      }
      else if (i.type === 'tag' && !hidden) {
        tags.push(i);
      }
    }

    // Sort by name
    equipment.sort(byNameAscending);
    abilities.sort(byNameAscending);
    abilitiesTwo.sort(byNameAscending);
    abilitiesThree.sort(byNameAscending);
    abilitiesFour.sort(byNameAscending);
    spells.sort(byNameAscending);
    skills.sort(byNameAscending);
    skillsTwo.sort(byNameAscending);
    skillsThree.sort(byNameAscending);
    skillsFour.sort(byNameAscending);
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
    ammo.sort(byNameAscending);
    recursions.sort(byNameAscending);
    tags.sort(byNameAscending);

    // Sort by skill rating
    if (actorData.type == "PC" || actorData.type == "Companion") {
      if (actorData.data.settings.skills.sortByRating) {
        skills.sort(bySkillRating);
        skillsTwo.sort(bySkillRating);
        skillsThree.sort(bySkillRating);
        skillsFour.sort(bySkillRating);
        teenSkills.sort(bySkillRating);
      }
    }

    // Sort by identified status
    cyphers.sort(byIdentifiedStatus);
    artifacts.sort(byIdentifiedStatus);

    // Sort by archive status
    equipment.sort(byArchiveStatus);
    abilities.sort(byArchiveStatus);
    abilitiesTwo.sort(byArchiveStatus);
    abilitiesThree.sort(byArchiveStatus);
    abilitiesFour.sort(byArchiveStatus);
    spells.sort(byArchiveStatus);
    skills.sort(byArchiveStatus);
    skillsTwo.sort(byArchiveStatus);
    skillsThree.sort(byArchiveStatus);
    skillsFour.sort(byArchiveStatus);
    attacks.sort(byArchiveStatus);
    armor.sort(byArchiveStatus);
    lastingDamage.sort(byArchiveStatus);
    powerShifts.sort(byArchiveStatus);
    cyphers.sort(byArchiveStatus);
    artifacts.sort(byArchiveStatus);
    oddities.sort(byArchiveStatus);
    teenSkills.sort(byArchiveStatus);
    teenAbilities.sort(byArchiveStatus);
    teenAttacks.sort(byArchiveStatus);
    teenArmor.sort(byArchiveStatus);
    teenLastingDamage.sort(byArchiveStatus);
    materials.sort(byArchiveStatus);
    ammo.sort(byArchiveStatus);
    recursions.sort(byArchiveStatus);
    tags.sort(byArchiveStatus);

    // Check for spells
    if (spells.length > 0) {
      actorData.showSpells = true;
    } else {
      actorData.showSpells = false;
    }

    // Check for ability category 2
    if (abilitiesTwo.length > 0) {
      actorData.showAbilitiesTwo = true;
    } else {
      actorData.showAbilitiesTwo = false;
    }

    // Check for ability category 3
    if (abilitiesThree.length > 0) {
      actorData.showAbilitiesThree = true;
    } else {
      actorData.showAbilitiesThree = false;
    }

    // Check for ability category 4
    if (abilitiesFour.length > 0) {
      actorData.showAbilitiesFour = true;
    } else {
      actorData.showAbilitiesFour = false;
    }

    // Check for skill category 2
    if (skillsTwo.length > 0) {
      actorData.showSkillsTwo = true;
    } else {
      actorData.showSkillsTwo = false;
    }

    // Check for skill category 3
    if (skillsThree.length > 0) {
      actorData.showSkillsThree = true;
    } else {
      actorData.showSkillsThree = false;
    }

    // Check for skill category 4
    if (skillsFour.length > 0) {
      actorData.showSkillsFour = true;
    } else {
      actorData.showSkillsFour = false;
    }

    // Assign and return
    actorData.equipment = equipment;
    actorData.abilities = abilities;
    actorData.abilitiesTwo = abilitiesTwo;
    actorData.abilitiesThree = abilitiesThree;
    actorData.abilitiesFour = abilitiesFour;
    actorData.spells = spells;
    actorData.skills = skills;
    actorData.skillsTwo = skillsTwo;
    actorData.skillsThree = skillsThree;
    actorData.skillsFour = skillsFour;
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
    actorData.ammo = ammo;
    actorData.recursions = recursions;
    actorData.tags = tags;
  }

  /**
  * Event Listeners
  */

  /** @override */
  async activateListeners(html) {
    super.activateListeners(html);

    html.find('.item-description').click(async clickEvent => {
      if (!event.altKey) {
        const shownItem = $(clickEvent.currentTarget).parents(".item");
        const itemID = shownItem.data("itemId");

        if (game.user.expanded == undefined) {
          game.user.expanded = {};
        }

        if (game.user.expanded[itemID] == undefined || game.user.expanded[itemID] == false) {
          game.user.expanded[itemID] = true;
        } else {
          game.user.expanded[itemID] = false;
        }
        this._render(false);
      }
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    /**
    * Inventory management
    */

    // Add Inventory Item
    html.find('.item-create').click(clickEvent => {
      const itemCreatedPromise = this._onItemCreate(clickEvent);
      itemCreatedPromise.then(itemData => {
        this.actor.items.get(itemData.id).sheet.render(true);
      });
    });

    // Edit Inventory Item
    html.find('.item-edit').click(clickEvent => {
      const editedItem = $(clickEvent.currentTarget).parents(".item");
      this.actor.items.get(editedItem.data("itemId")).sheet.render(true);
    });

    // Mark Item Identified
    html.find('.identify-item').click(clickEvent => {
      const shownItem = $(clickEvent.currentTarget).parents(".item");
      const item = duplicate(this.actor.items.get(shownItem.data("itemId")));

      if (game.user.isGM) {
        item.data.identified = true;
        this.actor.updateEmbeddedDocuments("Item", [item]);
      } else {
        ChatMessage.create({
          content: chatCardMarkItemIdentified(this.actor, item),
          whisper: ChatMessage.getWhisperRecipients("GM"),
          blind: true
        })
      }
    });

    // Delete Inventory Item
    html.find('.item-delete').click(clickEvent => {
      const deletedItem = $(clickEvent.currentTarget).parents(".item");
      if (event.altKey) {
        this.actor.deleteEmbeddedDocuments("Item", [deletedItem.data("itemId")]);
      } else {
        const item = duplicate(this.actor.getEmbeddedDocument("Item", deletedItem.data("itemId")));

        if (item.data.archived === true) {
          item.data.archived = false;
        }
        else {
          item.data.archived = true;
        }
        this.actor.updateEmbeddedDocuments("Item", [item]);
      }
    });

    // Translate to recursion
    html.find('.item-recursion').click(async clickEvent => {
      const shownItem = $(clickEvent.currentTarget).parents(".item");
      const item = duplicate(this.actor.getEmbeddedDocument("Item", shownItem.data("itemId")));
      await recursionMacro(this.actor, item);
    });

    // (Un)Archive tag
    html.find('.item-tag').click(async clickEvent => {
      const shownItem = $(clickEvent.currentTarget).parents(".item");
      const item = duplicate(this.actor.getEmbeddedDocument("Item", shownItem.data("itemId")));
      await tagMacro(this.actor, item);
    });

    // Add to Quantity
    html.find('.plus-one').click(clickEvent => {
      const shownItem = $(clickEvent.currentTarget).parents(".item");
      const item = duplicate(this.actor.items.get(shownItem.data("itemId")));
      let amount = (event.altKey) ? 10 : 1;
      item.data.quantity = item.data.quantity + amount;
      this.actor.updateEmbeddedDocuments("Item", [item]);
    });

    // Subtract from Quantity
    html.find('.minus-one').click(clickEvent => {
      const shownItem = $(clickEvent.currentTarget).parents(".item");
      const item = duplicate(this.actor.items.get(shownItem.data("itemId")));
      let amount = (event.altKey) ? 10 : 1;
      item.data.quantity = item.data.quantity - amount;
      this.actor.updateEmbeddedDocuments("Item", [item]);
    });

    // Roll for level
    html.find('.rollForLevel').click(async clickEvent => {
      const shownItem = $(clickEvent.currentTarget).parents(".item");
      const item = duplicate(this.actor.items.get(shownItem.data("itemId")));
      let roll = await new Roll(item.data.level).evaluate({ async: false });
      roll.toMessage({
        speaker: ChatMessage.getSpeaker(),
        flavor: game.i18n.format("CYPHERSYSTEM.RollForLevel", { item: item.name })
      });
      item.data.level = roll.total;
      await this.actor.updateEmbeddedDocuments("Item", [item]);
    });

    /**
    * Roll buttons
    */

    // Item roll buttons
    html.find('.item-roll').click(clickEvent => {
      const shownItem = $(clickEvent.currentTarget).parents(".item");
      const item = duplicate(this.actor.items.get(shownItem.data("itemId")));

      itemRollMacro(this.actor, shownItem.data("itemId"), "", "", "", "", "", "", "", "", "", "", "", "", false, "")
    });

    // Item pay pool points buttons
    html.find('.item-pay').click(clickEvent => {
      const shownItem = $(clickEvent.currentTarget).parents(".item");
      const item = duplicate(this.actor.items.get(shownItem.data("itemId")));

      itemRollMacro(this.actor, shownItem.data("itemId"), "", "", "", "", "", "", "", "", "", "", "", "", true, "")
    });

    // Item cast spell button
    html.find('.cast-spell').click(clickEvent => {
      const shownItem = $(clickEvent.currentTarget).parents(".item");
      const item = duplicate(this.actor.items.get(shownItem.data("itemId")));

      let recoveryUsed = useRecoveries(this.actor, true);

      if (recoveryUsed == undefined) return;

      ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: game.i18n.format("CYPHERSYSTEM.CastingASpell", {
          name: this.actor.name,
          recoveryUsed: recoveryUsed,
          spellName: item.name
        }),
        flags: { "itemID": shownItem.data("itemId") }
      });
    });

    /**
    * General sheet functions
    */

    // Show item description or send to chat
    html.find('.item-description').click(clickEvent => {
      if (event.altKey) {
        const shownItem = $(clickEvent.currentTarget).parents(".item");
        const item = duplicate(this.actor.items.get(shownItem.data("itemId")));
        if (item.data.identified === false) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.WarnSentUnidentifiedToChat"));
        let message = "";
        let brackets = "";
        let description = "<hr style='margin:3px 0;'><img class='description-image-chat' src='" + item.img + "' width='50' height='50'/>" + item.data.description;
        let points = "";
        let notes = "";
        let name = item.name;
        if (item.data.notes != "") notes = ", " + item.data.notes;
        if (item.type == "skill" || item.type == "teen Skill") {
          brackets = " (" + item.data.skillLevel + ")";
        } else if (item.type == "power Shift") {
          brackets = " (" + item.data.powerShiftValue + " " + game.i18n.localize("CYPHERSYSTEM.Shifts") + ")";
        } else if (item.type == "ability" || item.type == "teen Ability") {
          points = (item.data.costPoints == "1") ? " " + game.i18n.localize("CYPHERSYSTEM.Point") : " " + game.i18n.localize("CYPHERSYSTEM.Points");
          if (item.data.costPoints != 0 && item.data.costPoints != 0) brackets = " (" + item.data.costPoints + " " + item.data.costPool + points + ")";
        } else if (item.type == "attack") {
          points = (item.data.damage == 1) ? " " + game.i18n.localize("CYPHERSYSTEM.PointOfDamage") : " " + game.i18n.localize("CYPHERSYSTEM.PointsOfDamage");
          let damage = ", " + item.data.damage + " " + points;
          let attackType = item.data.attackType;
          let range = "";
          if (item.data.range != "") range = ", " + item.data.range;
          brackets = " (" + attackType + damage + range + notes + ")";
        } else if (item.type == "armor" || item.type == "teen Armor") {
          brackets = " (" + item.data.armorType + notes + ")";
        } else if (item.type == "lasting Damage") {
          let permanent = "";
          if (item.data.damageType == "Permanent") permanent = ", " + game.i18n.localize("CYPHERSYSTEM.permanent");
          brackets = " (" + item.data.lastingDamagePool + permanent + ")";
        } else {
          if (item.data.level != "") brackets = " (" + game.i18n.localize("CYPHERSYSTEM.level") + " " + item.data.level + ")";
        }
        message = "<b>" + item.type.capitalize() + ": " + name + "</b>" + brackets + description;
        ChatMessage.create({
          speaker: ChatMessage.getSpeaker(),
          content: message
        });
      }
    });

    // Drag events for macros
    if (this.actor.isOwner) {
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

    /**
    * Health management for NPCs, Companions, and Communities
    */

    // Increase Health
    html.find('.increase-health').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.health.value + amount;
      this.actor.update({ "data.health.value": newValue });
    });

    // Decrease Health
    html.find('.decrease-health').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.data.data.health.value - amount;
      this.actor.update({ "data.health.value": newValue });
    });

    // Reset Health
    html.find('.reset-health').click(clickEvent => {
      this.actor.update({
        "data.health.value": this.actor.data.data.health.max
      })
    });
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
    let sameActor = (data.actorId === actor.data._id) || (actor.isToken && (data.tokenId === actor.token.id));
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
    let itemOwned = false;

    if (!(itemData.type == "artifact" || itemData.type == "cypher" || itemData.type == "oddity")) {
      itemOwned = actor.items.find(i => i.data.name === item.data.name && i.data.type === item.data.type);
    }

    let hasQuantity = false;

    if ("quantity" in item.data.data) hasQuantity = true;

    // Activate settings for items
    if (itemData.type == "artifact") actor.update({ "data.settings.equipment.artifacts": true });
    if (itemData.type == "cypher") actor.update({ "data.settings.equipment.cyphers": true });
    if (itemData.type == "oddity") actor.update({ "data.settings.equipment.oddities": true });
    if (itemData.type == "material") actor.update({ "data.settings.equipment.materials": true });
    if (itemData.type == "ammo") actor.update({ "data.settings.ammo": true });
    if (itemData.type == "power Shift") actor.update({ "data.settings.powerShifts.active": true });
    if (itemData.type == "lasting Damage") actor.update({ "data.settings.lastingDamage.active": true });
    if (itemData.type == "teen lasting Damage") actor.update({ "data.settings.lastingDamage.active": true });

    // Handle cypher & artifact identification
    if (itemData.type == "cypher" || itemData.type == "artifact") {
      let identifiedStatus;
      if (game.settings.get("cyphersystem", "cypherIdentification") == 0) {
        identifiedStatus = (!event.altKey) ? itemData.data.identified : !itemData.data.identified;
      } else if (game.settings.get("cyphersystem", "cypherIdentification") == 1) {
        identifiedStatus = (!event.altKey) ? true : false;
      } else if (game.settings.get("cyphersystem", "cypherIdentification") == 2) {
        identifiedStatus = (!event.altKey) ? false : true;
      }
      itemData.data.identified = identifiedStatus;
    }

    // Define fuctions for archiving and deleting items
    function archiveItem(actorSheet) {
      originItem.update({ "data.archived": true })
      actorSheet._onDropItemCreate(itemData);
    }

    function deleteItem(actorSheet) {
      originItem.delete();
      actorSheet._onDropItemCreate(itemData);
    }

    if (!hasQuantity) {
      const actorSheet = this;
      if (!originActor) this._onDropItemCreate(itemData);
      if (!event.altKey && originActor) {
        let d = new Dialog({
          title: game.i18n.localize("CYPHERSYSTEM.ItemShouldBeArchivedOrDeleted"),
          content: "",
          buttons: {
            move: {
              icon: '<i class="fas fa-archive"></i>',
              label: game.i18n.localize("CYPHERSYSTEM.Archive"),
              callback: (html) => archiveItem(actorSheet)
            },
            moveAll: {
              icon: '<i class="fas fa-trash"></i>',
              label: game.i18n.localize("CYPHERSYSTEM.Delete"),
              callback: (html) => deleteItem(actorSheet)
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
      } else if (event.altKey && originActor) {
        actorSheet._onDropItemCreate(itemData);
      }
    } else if (hasQuantity) {
      if (!event.altKey) {
        let maxQuantity = item.data.data.quantity;
        if (maxQuantity <= 0 && maxQuantity != null) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.CannotMoveNotOwnedItem"));
        let quantity = 1;
        moveDialog(quantity, itemData);

        function moveDialog(quantity, itemData) {
          let d = new Dialog({
            title: game.i18n.format("CYPHERSYSTEM.MoveItem", { name: itemData.name }),
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
          let content = `<div align="center"><label style='display: inline-block; width: 98px; text-align: right'><b>${game.i18n.localize("CYPHERSYSTEM.Quantity")}/${game.i18n.localize("CYPHERSYSTEM.Units")}: </b></label><input name='quantity' id='quantity' style='width: 75px; margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=${quantity} data-dtype='Number'/>` + maxQuantityText + `</div>`;
          return content;
        }

        function buttons() {
          if (maxQuantity != null) {
            return ({
              move: {
                icon: '<i class="fas fa-share-square"></i>',
                label: game.i18n.localize("CYPHERSYSTEM.Move"),
                callback: (html) => moveItems(html.find('#quantity').val(), itemData)
              },
              moveAll: {
                icon: '<i class="fas fa-share-square"></i>',
                label: game.i18n.localize("CYPHERSYSTEM.MoveAll"),
                callback: (html) => moveItems(maxQuantity, itemData)
              },
              cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
                callback: () => { }
              }
            })
          } else {
            return ({
              move: {
                icon: '<i class="fas fa-share-square"></i>',
                label: game.i18n.localize("CYPHERSYSTEM.Move"),
                callback: (html) => moveItems(html.find('#quantity').val(), itemData)
              },
              cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
                callback: () => { }
              }
            })
          }
        }

        function moveItems(quantity, itemData) {
          quantity = parseInt(quantity);
          if (item.data.data.quantity != null && (quantity > item.data.data.quantity || quantity <= 0)) {
            moveDialog(quantity, itemData);
            return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.CanOnlyMoveCertainAmountOfItems", { max: item.data.data.quantity }));
          }
          if (item.data.data.quantity && originActor) {
            let oldQuantity = item.data.data.quantity - parseInt(quantity);
            originItem.update({ "data.quantity": oldQuantity });
          }
          if (!itemOwned) {
            itemData.data.quantity = quantity;
            actor.createEmbeddedDocuments("Item", [itemData]);
          } else {
            let newQuantity = parseInt(itemOwned.data.data.quantity) + parseInt(quantity);
            itemOwned.update({ "data.quantity": newQuantity });
          }
        }
      } else if (event.altKey) {
        if (!itemOwned) {
          if (!item.data.data.quantity) {
            itemData.data.quantity = 0;
          }
          this._onDropItemCreate(itemData);
        } else {
          let newQuantity = itemOwned.data.data.quantity + item.data.data.quantity;
          itemOwned.update({ "data.quantity": newQuantity });
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
    const types = {
      "ability": game.i18n.localize("CYPHERSYSTEM.NewAbility"),
      "ammo": game.i18n.localize("CYPHERSYSTEM.NewAmmo"),
      "armor": game.i18n.localize("CYPHERSYSTEM.NewArmor"),
      "artifact": game.i18n.localize("CYPHERSYSTEM.NewArtifact"),
      "attack": game.i18n.localize("CYPHERSYSTEM.NewAttack"),
      "cypher": game.i18n.localize("CYPHERSYSTEM.NewCypher"),
      "equipment": game.i18n.localize("CYPHERSYSTEM.NewEquipment"),
      "lasting Damage": game.i18n.localize("CYPHERSYSTEM.NewLastingDamage"),
      "material": game.i18n.localize("CYPHERSYSTEM.NewMaterial"),
      "oddity": game.i18n.localize("CYPHERSYSTEM.NewOddity"),
      "power Shift": game.i18n.localize("CYPHERSYSTEM.NewPowerShift"),
      "skill": game.i18n.localize("CYPHERSYSTEM.NewSkill"),
      "teen Ability": game.i18n.localize("CYPHERSYSTEM.NewTeenAbility"),
      "teen Armor": game.i18n.localize("CYPHERSYSTEM.NewTeenArmor"),
      "teen Attack": game.i18n.localize("CYPHERSYSTEM.NewTeenAttack"),
      "teen lasting Damage": game.i18n.localize("CYPHERSYSTEM.NewTeenLastingDamage"),
      "teen Skill": game.i18n.localize("CYPHERSYSTEM.NewTeenSkill"),
      "recursion": game.i18n.localize("CYPHERSYSTEM.NewRecursion"),
      "tag": game.i18n.localize("CYPHERSYSTEM.NewTag"),
      "default": game.i18n.localize("CYPHERSYSTEM.NewDefault")
    };
    const name = (types[type] || types["default"]);

    // Finally, create the item!
    return Item.create({ type: type, data, name: name }, { parent: this.actor });
  }
}
