/**
* Extend the basic ItemSheet with some very simple modifications
* @extends {ItemSheet}
*/

import {getBackgroundIcon, getBackgroundIconOpacity, getBackgroundIconPath, getBackgroundImage, getBackgroundImageOverlayOpacity, getBackgroundImagePath} from "../forms/sheet-customization.js";
import {byNameAscending} from "../utilities/sorting.js";
import {archiveItems} from "../utilities/tagging-engine/tagging-engine-computation.js";

export class CypherItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "item", "item-sheet"],
      width: 575,
      height: 675,
      resizable: true,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      scrollY: [".sheet-body", ".tab"]
    });
  }

  /** @override */
  get template() {
    const path = "systems/cyphersystem/templates/item-sheets";
    const itemType = this.item.type;
    return `${path}/${itemType}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = await super.getData();

    // Fallback for empty input fields
    if (data.isEditable) {
      if (["skill", "ability", "attack"].includes(this.item.type)) {
        if (!this.item.system.basic?.cost) {
          this.item.update({"system.basic.cost": 0});
        }
        if (!this.item.system.basic?.damage) {
          this.item.update({"system.basic.damage": 0});
        }
        if (!this.item.system.basic?.steps) {
          this.item.update({"system.basic.steps": 0});
        }
        if (!this.item.system.settings?.rollButton?.additionalCost) {
          this.item.update({"system.settings.rollButton.additionalCost": 0});
        }
        if (!this.item.system.settings?.rollButton?.bonus) {
          this.item.update({"system.settings.rollButton.bonus": 0});
        }
        if (!this.item.system.settings?.rollButton?.additionalSteps) {
          this.item.update({"system.settings.rollButton.additionalSteps": 0});
        }
        if (!this.item.system.settings?.rollButton?.damage) {
          this.item.update({"system.settings.rollButton.damage": 0});
        }
        if (!this.item.system.settings?.rollButton?.damagePerLOE) {
          this.item.update({"system.settings.rollButton.damagePerLOE": 0});
        }
      }
    }

    // Sheet settings
    data.sheetSettings = {};
    data.sheetSettings.isGM = game.user.isGM;
    data.sheetSettings.isObserver = !this.options.editable;
    data.sheetSettings.rollButtons = game.settings.get("cyphersystem", "rollButtons");
    data.sheetSettings.useAllInOne = game.settings.get("cyphersystem", "itemMacrosUseAllInOne");
    data.sheetSettings.spells = game.i18n.localize("CYPHERSYSTEM.Spells");
    data.sheetSettings.identified = this.item.system.basic?.identified;
    data.sheetSettings.editor = (game.settings.get("cyphersystem", "sheetEditor") == 1) ? "tinymce" : "prosemirror";
    data.sheetSettings.isMaskForm = (this.item.system?.settings?.general?.unmaskedForm == "Teen") ? false : true;

    // Enriched HTML
    data.enrichedHTML = {};
    data.enrichedHTML.description = await TextEditor.enrichHTML(this.item.system.description, {async: true, secrets: this.item.isOwner, relativeTo: this.item});

    data.actor = data.item.parent ? data.item.parent : "";

    // Tag & recursion lists
    data.itemLists = {};
    if (data.actor) {
      const tags = [];
      const tagsTwo = [];
      const tagsThree = [];
      const tagsFour = [];
      const recursions = [];
      const tagsOnItem = this.item.flags.cyphersystem?.tags || [];
      const recursionsOnItem = this.item.flags.cyphersystem?.recursions || [];

      for (let item of data.actor.items) {
        if (item.type === "tag" && item.system.settings.general.sorting == "Tag") {
          tags.push(item);
        }
        else if (item.type === "tag" && item.system.settings.general.sorting == "TagTwo") {
          tagsTwo.push(item);
        }
        else if (item.type === "tag" && item.system.settings.general.sorting == "TagThree") {
          tagsThree.push(item);
        }
        else if (item.type === "tag" && item.system.settings.general.sorting == "TagFour") {
          tagsFour.push(item);
        }
        else if (item.type === "recursion") {
          recursions.push(item);
        }
      }

      recursions.sort(byNameAscending);
      tags.sort(byNameAscending);
      tagsTwo.sort(byNameAscending);
      tagsThree.sort(byNameAscending);
      tagsFour.sort(byNameAscending);

      data.itemLists.recursions = recursions;
      data.itemLists.recursionsOnItem = recursionsOnItem;
      data.itemLists.tags = tags;
      data.itemLists.tagsTwo = tagsTwo;
      data.itemLists.tagsThree = tagsThree;
      data.itemLists.tagsFour = tagsFour;
      data.itemLists.tagsOnItem = tagsOnItem;

      // Check for tags category 2
      if (tagsTwo.length > 0) {
        data.sheetSettings.showTagsTwo = true;
      } else {
        data.sheetSettings.showTagsTwo = false;
      }

      // Check for tags category 3
      if (tagsThree.length > 0) {
        data.sheetSettings.showTagsThree = true;
      } else {
        data.sheetSettings.showTagsThree = false;
      }

      // Check for tags category 4
      if (tagsFour.length > 0) {
        data.sheetSettings.showTagsFour = true;
      } else {
        data.sheetSettings.showTagsFour = false;
      }
    }

    // Sheet customizations
    // -- Get root css variables
    let root = document.querySelector(':root');

    // -- Sheet settings
    data.sheetSettings.backgroundImageBaseSetting = "background-image";

    data.sheetSettings.backgroundImage = getBackgroundImage();
    if (data.sheetSettings.backgroundImage == "custom") {
      data.sheetSettings.backgroundImagePath = "/" + getBackgroundImagePath();
      data.sheetSettings.backgroundOverlayOpacity = getBackgroundImageOverlayOpacity();
    }
    data.sheetSettings.backgroundIcon = getBackgroundIcon();
    data.sheetSettings.backgroundIconPath = "/" + getBackgroundIconPath();
    data.sheetSettings.backgroundIconOpacity = getBackgroundIconOpacity();

    if (data.sheetSettings.backgroundIcon == "custom") {
      if (!data.sheetSettings.backgroundIconPath) {
        data.sheetSettings.backgroundIconPath = "/systems/cyphersystem/icons/background/icon-transparent.webp";
      }
    } else {
      data.sheetSettings.backgroundIconPath = "/systems/cyphersystem/icons/background/icon-" + getBackgroundIcon() + ".svg";
    }

    return data;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // html.find("input[name='system.basic.cost']").change(changeEvent => {
    //   if ($(changeEvent.currentTarget.value) == "") {
    //     $(changeEvent.currentTarget.value) = 0;
    //   }
    // });

    html.find('.identify-item').click(clickEvent => {
      if (this.item.system.basic.identified) {
        this.item.update({"system.basic.identified": false});
      } else {
        this.item.update({"system.basic.identified": true});
      }
    });

    html.find('.copy-as-skill').click(async clickEvent => {
      let actor = this.item.actor;
      if (!actor) return;
      let item = this.item;
      if (!["ability"].includes(item.type)) return;

      let itemData = {
        name: item.name,
        type: "skill",
        "system.settings.rollButton": item.system.settings.rollButton,
        "system.description": item.system.description,
        "system.basic.rating": item.system.settings.rollButton.skill,
        "system.settings.rollButton.pool": item.system.basic.pool,
        "system.settings.rollButton.additionalCost": item.system.basic.cost
      };

      await actor.createEmbeddedDocuments("Item", [itemData]);

      return ui.notifications.info(game.i18n.format("CYPHERSYSTEM.ItemCreatedAsSkill", {item: item.name}));
    });

    html.find('.copy-as-attack').click(async clickEvent => {
      let actor = this.item.actor;
      if (!actor) return;
      let item = this.item;
      if (!["ability"].includes(item.type)) return;

      let itemData = {
        name: item.name,
        type: "attack",
        "system.settings.rollButton": item.system.settings.rollButton,
        "system.description": item.system.description,
        "system.basic.type": "special ability",
        "system.basic.damage": item.system.settings.rollButton.damage,
        "system.basic.modifier": item.system.settings.rollButton.stepModifier,
        "system.basic.steps": item.system.settings.rollButton.additionalSteps,
        "system.basic.skillRating": item.system.settings.rollButton.skill,
        "system.settings.rollButton.pool": item.system.basic.pool,
        "system.settings.rollButton.additionalCost": item.system.basic.cost
      };

      await actor.createEmbeddedDocuments("Item", [itemData]);

      return ui.notifications.info(game.i18n.format("CYPHERSYSTEM.ItemCreatedAsAttack", {item: item.name}));
    });

    html.find('.copy-as-equipment').click(async clickEvent => {
      let actor = this.item.actor;
      if (!actor) return;
      let item = this.item;
      if (!["attack", "armor"].includes(item.type)) return;

      let itemData = {
        name: item.name,
        type: "equipment",
        "system.description": item.system.description
      };

      await actor.createEmbeddedDocuments("Item", [itemData]);

      return ui.notifications.info(game.i18n.format("CYPHERSYSTEM.ItemCreatedAsEquipment", {item: item.name}));
    });

    html.find('.copy-as-armor').click(async clickEvent => {
      let actor = this.item.actor;
      if (!actor) return;
      let item = this.item;
      if (!["ability"].includes(item.type)) return;

      let itemData = {
        name: item.name,
        type: "armor",
        "system.description": item.system.description,
        "system.basic.type": "special ability"
      };

      await actor.createEmbeddedDocuments("Item", [itemData]);

      return ui.notifications.info(game.i18n.format("CYPHERSYSTEM.ItemCreatedAsArmor", {item: item.name}));
    });

    html.find('.tag-items').click(async clickEvent => {
      let item = this.item;
      let tag = this.item.actor.items.get($(clickEvent.currentTarget).data("item-id"));

      if (tag.type == "tag") {
        let array = (Array.isArray(item.flags.cyphersystem?.tags)) ? item.flags.cyphersystem?.tags : [];
        await addOrRemoveFromArray(array);
        var tagFound = await archiveItem(array);
        await item.update({
          "flags.cyphersystem.tags": array,
          "system.archived": !tagFound
        });
      } else if (tag.type == "recursion") {
        let array = (Array.isArray(item.flags.cyphersystem?.recursions)) ? item.flags.cyphersystem?.recursions : [];
        await addOrRemoveFromArray(array);
        var tagFound = await archiveItem(array);
        await item.update({
          "flags.cyphersystem.recursions": array,
          "system.archived": !tagFound
        });
      }
      this.render(true);

      async function addOrRemoveFromArray(array) {
        if (array.includes(tag._id)) {
          let index = array.indexOf(tag._id);
          array.splice(index, 1);
        } else {
          array.push(tag._id);
        }
      }

      async function archiveItem(array) {
        // Do nothing if it’s the last tag
        if (array.length == 0) return !item.system.archived;

        // If it should always be unarchived
        // if (array.length == 0) return true;

        // Collect all active tags of the actor
        let activeTags = [];
        for (let tag of item.actor.items) {
          if (["tag", "recursion"].includes(tag.type) && tag.system.active) {
            activeTags.push(tag._id);
          }
        }

        // Check if any of the enabled tags on the item is an active tag on the actor
        var tagFound = activeTags.some(id => array.includes(id));

        // Return whether a tag has been found
        return tagFound;
      }
    });
  }

  /**
  * Support for TinyMCE dynamic size
  */

  async activateEditor(name, options = {}, initialContent = "") {
    options.fitToSize = true;
    const editor = await super.activateEditor(name, options, initialContent);
    this.form.querySelector('[role="application"]')?.style.removeProperty("height");
    return editor;
  }
}
