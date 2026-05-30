/**
* Extend the basic ItemSheet with some very simple modifications
* @extends {ItemSheet}
*/

import { getBackgroundIcon, getBackgroundIconOpacity, getBackgroundIconPath, getBackgroundImage, getBackgroundImageOverlayOpacity, getBackgroundImagePath } from "../forms/sheet-customization.js";
import { byNameAscending } from "../utilities/sorting.js";
import { archiveItems } from "../utilities/tagging-engine/tagging-engine-computation.js";

export class CypherItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheetV2) {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "item", "item-sheet"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }],
      scrollY: [".sheet-body", ".tab"]
    });
  }

  static DEFAULT_OPTIONS = {
    classes: ["cyphersystem", "item-sheet"],
    position: {
      width: 575,
      height: 675,
    },
    window: {
      resizable: true,
    },
    form: {
      submitOnChange: true
    },
    actions: {
      identifyItem: this.#onIdentifyItem,
      toggleCypherType: this.#onToggleCypherType,
      copyAsSkill: this.#onCopyAsSkill,
      copyAsAttack: this.#onCopyAsAttack,
      copyAsEquipment: this.#onCopyAsEquipment,
      copyAsArmor: this.#onCopyAsArmor,
      addTag: this.#onAddTag,
    }
  }

  static PARTS = {
    ability: { template: "systems/cyphersystem/templates/item-sheets/ability-sheet.html", scrollable: [".scrollable"] },
    ammo: { template: "systems/cyphersystem/templates/item-sheets/ammo-sheet.html", scrollable: [".scrollable"] },
    armor: { template: "systems/cyphersystem/templates/item-sheets/armor-sheet.html", scrollable: [".scrollable"] },
    artifact: { template: "systems/cyphersystem/templates/item-sheets/artifact-sheet.html", scrollable: [".scrollable"] },
    attack: { template: "systems/cyphersystem/templates/item-sheets/attack-sheet.html", scrollable: [".scrollable"] },
    cypher: { template: "systems/cyphersystem/templates/item-sheets/cypher-sheet.html", scrollable: [".scrollable"] },
    equipment: { template: "systems/cyphersystem/templates/item-sheets/equipment-sheet.html", scrollable: [".scrollable"] },
    "lasting-damage": { template: "systems/cyphersystem/templates/item-sheets/lasting-damage-sheet.html", scrollable: [".scrollable"] },
    material: { template: "systems/cyphersystem/templates/item-sheets/material-sheet.html", scrollable: [".scrollable"] },
    oddity: { template: "systems/cyphersystem/templates/item-sheets/oddity-sheet.html", scrollable: [".scrollable"] },
    "power-shift": { template: "systems/cyphersystem/templates/item-sheets/power-shift-sheet.html", scrollable: [".scrollable"] },
    recursion: { template: "systems/cyphersystem/templates/item-sheets/recursion-sheet.html", scrollable: [".scrollable"] },
    skill: { template: "systems/cyphersystem/templates/item-sheets/skill-sheet.html", scrollable: [".scrollable"] },
    tag: { template: "systems/cyphersystem/templates/item-sheets/tag-sheet.html", scrollable: [".scrollable"] },
  }

  static TABS = {
    primary: {
      tabs: [
        { id: 'description', cssClass: "item", label: "CYPHERSYSTEM.Description" },
        { id: 'tags', cssClass: "item narrow", tooltip: "CYPHERSYSTEM.Tags", icon: "fa-item fa-solid fa-hashtag" },
        { id: 'settings', cssClass: "item narrow", icon: "fa-item fa-solid fa-gear" } // not limited
      ],
      initial: "description",
    },
    notags: {
      tabs: [
        { id: 'description', cssClass: "item", label: "CYPHERSYSTEM.Description" },
        { id: 'settings', cssClass: "item narrow", icon: "fa-item fa-solid fa-gear" } // not limited
      ],
      initial: "description",
    },
    nosettings: {
      tabs: [
        { id: 'description', cssClass: "item", label: "CYPHERSYSTEM.Description" },
        { id: 'tags', cssClass: "item narrow", tooltip: "CYPHERSYSTEM.Tags", icon: "fa-item fa-solid fa-hashtag" },
      ],
      initial: "description",
    },
  }

  _configureRenderOptions(options) {
    super._configureRenderOptions(options);
    options.parts = [this.document.type];
  }

  /* -------------------------------------------- */

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.item = this.document;
    context.actor = this.document.parent ?? null;

    switch (this.document.type) {
      case "lasting-damage":
      case "power-shift":
        context.tabs = this._prepareTabs("nosettings");
        break;
      case "recursion":
      case "tag":
        context.tabs = this._prepareTabs("notags");
        break;
      default:
        context.tabs = this._prepareTabs("primary");
        break;
    }
    if (context.tabs.tags) {
      if (context.actor?.system.settings.general.gameMode === "Strange") {
        context.tabs.tags.tooltip = "CYPHERSYSTEM.Recursions";
        context.tabs.tags.icon = "fa-item fa-solid fa-at";
      } else if (!context.actor?.system.settings.general.tags.active || this.item.system?.settings?.general?.unmaskedForm === "Teen")
        delete context.tabs.tags;
    }


    // Fallback for empty input fields
    if (this.isEditable) {
      if (["skill", "ability", "attack"].includes(this.item.type)) {
        if (!this.item.system.basic?.cost) {
          this.item.update({ "system.basic.cost": 0 });
        }
        if (!this.item.system.basic?.damage) {
          this.item.update({ "system.basic.damage": 0 });
        }
        if (!this.item.system.basic?.steps) {
          this.item.update({ "system.basic.steps": 0 });
        }
        if (!this.item.system.settings?.rollButton?.additionalCost) {
          this.item.update({ "system.settings.rollButton.additionalCost": 0 });
        }
        if (!this.item.system.settings?.rollButton?.bonus) {
          this.item.update({ "system.settings.rollButton.bonus": 0 });
        }
        if (!this.item.system.settings?.rollButton?.additionalSteps) {
          this.item.update({ "system.settings.rollButton.additionalSteps": 0 });
        }
        if (!this.item.system.settings?.rollButton?.damage) {
          this.item.update({ "system.settings.rollButton.damage": 0 });
        }
        if (!this.item.system.settings?.rollButton?.damagePerLOE) {
          this.item.update({ "system.settings.rollButton.damagePerLOE": 0 });
        }
      }
    }

    // Sheet settings
    context.sheetSettings = {};
    context.sheetSettings.isGM = game.user.isGM;
    context.sheetSettings.isObserver = !this.isEditable;
    context.sheetSettings.rollButtons = game.settings.get("cyphersystem", "rollButtons");
    context.sheetSettings.useAllInOne = game.settings.get("cyphersystem", "itemMacrosUseAllInOne");
    context.sheetSettings.spells = game.i18n.localize("CYPHERSYSTEM.Spells");
    context.sheetSettings.identified = this.item.system.basic?.identified;
    context.sheetSettings.editor = (game.settings.get("cyphersystem", "sheetEditor") == 1) ? "tinymce" : "prosemirror";
    context.sheetSettings.isMaskForm = (this.item.system?.settings?.general?.unmaskedForm == "Teen") ? false : true;

    // Enriched HTML
    context.enrichedHTML = {};
    context.enrichedHTML.description = await TextEditor.enrichHTML(this.item.system.description, { async: true, secrets: this.item.isOwner, relativeTo: this.item });


    // Determine cypher type
    context.cypherType = {};
    if (this.item.type == "cypher") {
      let color = "rgb(0, 0, 0)";
      let title = "";

      if (this.item.system.basic.type[1] == 1) {
        color = "color: rgb(146, 16, 18)";
      } else if (this.item.system.basic.type[0] == 1) {
        color = "color: rgb(214, 118, 40)";
      } else if (this.item.system.basic.type[0] == 2) {
        color = "color: rgb(44, 63, 101)";
      }

      if (this.item.system.basic.type[0] == 0 && this.item.system.basic.type[1] == 0) {
        title = game.i18n.localize("CYPHERSYSTEM.NoTypeCypher");
      } else if (this.item.system.basic.type[0] == 1 && this.item.system.basic.type[1] == 0) {
        title = game.i18n.localize("CYPHERSYSTEM.SubtleCypher");
      } else if (this.item.system.basic.type[0] == 2 && this.item.system.basic.type[1] == 0) {
        title = game.i18n.localize("CYPHERSYSTEM.ManifestCypher");
      } else if (this.item.system.basic.type[0] == 0 && this.item.system.basic.type[1] == 1) {
        title = game.i18n.localize("CYPHERSYSTEM.NoTypeFantasticCypher");
      } else if (this.item.system.basic.type[0] == 1 && this.item.system.basic.type[1] == 1) {
        title = game.i18n.localize("CYPHERSYSTEM.SubtleFantasticCypher");
      } else if (this.item.system.basic.type[0] == 2 && this.item.system.basic.type[1] == 1) {
        title = game.i18n.localize("CYPHERSYSTEM.ManifestFantasticCypher");
      }

      if (this.item.system.basic.type[0] == 0) {
        // No type
        context.cypherType[this.item.id] = `<i class="fa-item fa-regular fa-circle cypher-type" style="${color}" title="${title}"></i>`;
      } else if (this.item.system.basic.type[0] == 1) {
        // Subtle cypher
        context.cypherType[this.item.id] = `<i class="fa-item fa-solid fa-circle-half-stroke" style="${color}" title="${title}"></i>`;
      } else if (this.item.system.basic.type[0] == 2) {
        // Manifest cypher
        context.cypherType[this.item.id] = `<i class="fa-item fa-solid fa-circle" style="${color}" title="${title}"></i>`;
      }
    }

    // Tag & recursion lists
    context.itemLists = {};
    if (context.actor) {
      const tags = [];
      const tagsTwo = [];
      const tagsThree = [];
      const tagsFour = [];
      const recursions = [];
      const tagsOnItem = this.item.flags.cyphersystem?.tags || [];
      const recursionsOnItem = this.item.flags.cyphersystem?.recursions || [];

      for (let item of context.actor.items) {
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

      context.itemLists.recursions = recursions;
      context.itemLists.recursionsOnItem = recursionsOnItem;
      context.itemLists.tags = tags;
      context.itemLists.tagsTwo = tagsTwo;
      context.itemLists.tagsThree = tagsThree;
      context.itemLists.tagsFour = tagsFour;
      context.itemLists.tagsOnItem = tagsOnItem;

      // Check for tags category 2
      if (tagsTwo.length > 0) {
        context.sheetSettings.showTagsTwo = true;
      } else {
        context.sheetSettings.showTagsTwo = false;
      }

      // Check for tags category 3
      if (tagsThree.length > 0) {
        context.sheetSettings.showTagsThree = true;
      } else {
        context.sheetSettings.showTagsThree = false;
      }

      // Check for tags category 4
      if (tagsFour.length > 0) {
        context.sheetSettings.showTagsFour = true;
      } else {
        context.sheetSettings.showTagsFour = false;
      }
    }

    // Sheet customizations
    // -- Get root css variables
    let root = document.querySelector(':root');

    // -- Sheet settings
    context.sheetSettings.backgroundImageBaseSetting = "background-image";

    context.sheetSettings.backgroundImage = getBackgroundImage();
    if (context.sheetSettings.backgroundImage == "custom") {
      context.sheetSettings.backgroundImagePath = "/" + getBackgroundImagePath();
      context.sheetSettings.backgroundOverlayOpacity = getBackgroundImageOverlayOpacity();
    }
    context.sheetSettings.backgroundIcon = getBackgroundIcon();
    context.sheetSettings.backgroundIconPath = "/" + getBackgroundIconPath();
    context.sheetSettings.backgroundIconOpacity = getBackgroundIconOpacity();

    if (context.sheetSettings.backgroundIcon == "custom") {
      if (!context.sheetSettings.backgroundIconPath) {
        context.sheetSettings.backgroundIconPath = "/systems/cyphersystem/icons/background/icon-transparent.webp";
      }
    } else {
      context.sheetSettings.backgroundIconPath = "/systems/cyphersystem/icons/background/icon-" + getBackgroundIcon() + ".svg";
    }

    // Select choices
    context.poolChoices = {
      "basic": {
        "Might": "CYPHERSYSTEM.Might",
        "Speed": "CYPHERSYSTEM.Speed",
        "Intellect": "CYPHERSYSTEM.Intellect"
      },
      "withAnyPool": {
        "Might": "CYPHERSYSTEM.Might",
        "Speed": "CYPHERSYSTEM.Speed",
        "Intellect": "CYPHERSYSTEM.Intellect",
        "Pool": "CYPHERSYSTEM.AnyPool"
      },
      "withXP": {
        "Might": "CYPHERSYSTEM.Might",
        "Speed": "CYPHERSYSTEM.Speed",
        "Intellect": "CYPHERSYSTEM.Intellect",
        "XP": "CYPHERSYSTEM.XP"
      },
      "withAnyPoolAndXP": {
        "Might": "CYPHERSYSTEM.Might",
        "Speed": "CYPHERSYSTEM.Speed",
        "Intellect": "CYPHERSYSTEM.Intellect",
        "Pool": "CYPHERSYSTEM.AnyPool",
        "XP": "CYPHERSYSTEM.XP"
      }
    };

    context.armorTypeChoices = {
      "light armor": "CYPHERSYSTEM.LightArmor",
      "medium armor": "CYPHERSYSTEM.MediumArmor",
      "heavy armor": "CYPHERSYSTEM.HeavyArmor",
      "artifact": "CYPHERSYSTEM.Artifact",
      "special ability": "CYPHERSYSTEM.SpecialAbility",
      "n/a": "CYPHERSYSTEM.n/a"
    };

    context.skillRatingChoices = {
      "Specialized": "CYPHERSYSTEM.Specialized",
      "Trained": "CYPHERSYSTEM.Trained",
      "Practiced": "CYPHERSYSTEM.Practiced",
      "Inability": "CYPHERSYSTEM.Inability"
    };

    context.attackTypeChoices = {
      "light weapon": "CYPHERSYSTEM.LightWeapon",
      "medium weapon": "CYPHERSYSTEM.MediumWeapon",
      "heavy weapon": "CYPHERSYSTEM.HeavyWeapon",
      "artifact": "CYPHERSYSTEM.Artifact",
      "special ability": "CYPHERSYSTEM.SpecialAbility",
      "n/a": "CYPHERSYSTEM.n/a"
    };

    context.stepModifierChoices = {
      "eased": "CYPHERSYSTEM.easedBy",
      "hindered": "CYPHERSYSTEM.hinderedBy"
    };

    context.lastingDamageTypeChoices = {
      "Lasting": "CYPHERSYSTEM.lastingDamage",
      "Permanent": "CYPHERSYSTEM.permanent"
    };

    context.spellTierChoices = {
      "low": "CYPHERSYSTEM.LowTier",
      "mid": "CYPHERSYSTEM.MidTier",
      "high": "CYPHERSYSTEM.HighTier"
    };

    context.unmaskedFormChoices = {
      "Mask": "CYPHERSYSTEM.Mask",
      "Teen": "CYPHERSYSTEM.Teen"
    };

    context.numberAssetChoices = {
      "0": 0,
      "1": 1,
      "2": 2
    };

    context.effortLevelChoices = {
      "0": game.i18n.localize("CYPHERSYSTEM.None"),
      "1": "1 " + game.i18n.localize("CYPHERSYSTEM.level"),
      "2": "2 " + game.i18n.localize("CYPHERSYSTEM.levels"),
      "3": "3 " + game.i18n.localize("CYPHERSYSTEM.levels"),
      "4": "4 " + game.i18n.localize("CYPHERSYSTEM.levels"),
      "5": "5 " + game.i18n.localize("CYPHERSYSTEM.levels"),
      "6": "6 " + game.i18n.localize("CYPHERSYSTEM.levels")
    };

    context.priceCategoryChoices = {
      "none": game.i18n.localize("CYPHERSYSTEM.None"),
      "inexpensive": game.i18n.localize("CYPHERSYSTEM.PriceInexpensive"),
      "moderate": game.i18n.localize("CYPHERSYSTEM.PriceModerate"),
      "expensive": game.i18n.localize("CYPHERSYSTEM.PriceExpensive"),
      "very expensive": game.i18n.localize("CYPHERSYSTEM.PriceVeryExpensive"),
      "exorbitant": game.i18n.localize("CYPHERSYSTEM.PriceExorbitant")
    };

    if (context.actor?.type == "pc") {
      // Select options for ability categories
      let labelAbilityCategory1 = context.actor?.system.settings.abilities.labelCategory1 || game.i18n.localize("CYPHERSYSTEM.Abilities");
      let labelAbilityCategory2 = context.actor?.system.settings.abilities.labelCategory2 || "";
      let labelAbilityCategory3 = context.actor?.system.settings.abilities.labelCategory3 || "";
      let labelAbilityCategory4 = context.actor?.system.settings.abilities.labelCategory4 || "";
      let labelSpells = context.actor?.system.settings.abilities.labelSpells || game.i18n.localize("CYPHERSYSTEM.Spells");

      context.abilityCategoryChoices = { "Ability": labelAbilityCategory1 };
      if (labelAbilityCategory2) context.abilityCategoryChoices["AbilityTwo"] = labelAbilityCategory2;
      if (labelAbilityCategory3) context.abilityCategoryChoices["AbilityThree"] = labelAbilityCategory3;
      if (labelAbilityCategory4) context.abilityCategoryChoices["AbilityFour"] = labelAbilityCategory4;
      context.abilityCategoryChoices["Spell"] = labelSpells;

      // Select options for skill categories
      let labelSkillCategory1 = context.actor?.system.settings.skills.labelCategory1 || game.i18n.localize("CYPHERSYSTEM.Skills");
      let labelSkillCategory2 = context.actor?.system.settings.skills.labelCategory2 || "";
      let labelSkillCategory3 = context.actor?.system.settings.skills.labelCategory3 || "";
      let labelSkillCategory4 = context.actor?.system.settings.skills.labelCategory4 || "";

      context.skillCategoryChoices = { "Skill": labelSkillCategory1 };
      if (labelSkillCategory2) context.skillCategoryChoices["SkillTwo"] = labelSkillCategory2;
      if (labelSkillCategory3) context.skillCategoryChoices["SkillThree"] = labelSkillCategory3;
      if (labelSkillCategory4) context.skillCategoryChoices["SkillFour"] = labelSkillCategory4;

      // Select options for equipment categories
      let labelEquipmentCategory1 = context.actor?.system.settings.equipment.labelCategory1 || game.i18n.localize("CYPHERSYSTEM.Equipment");
      let labelEquipmentCategory2 = context.actor?.system.settings.equipment.labelCategory2 || "";
      let labelEquipmentCategory3 = context.actor?.system.settings.equipment.labelCategory3 || "";
      let labelEquipmentCategory4 = context.actor?.system.settings.equipment.labelCategory4 || "";

      context.equipmentCategoryChoices = { "Equipment": labelEquipmentCategory1 };
      if (labelEquipmentCategory2) context.equipmentCategoryChoices["EquipmentTwo"] = labelEquipmentCategory2;
      if (labelEquipmentCategory3) context.equipmentCategoryChoices["EquipmentThree"] = labelEquipmentCategory3;
      if (labelEquipmentCategory4) context.equipmentCategoryChoices["EquipmentFour"] = labelEquipmentCategory4;

      // Select options for tag categories
      let labelTagsCategory1 = context.actor?.system.settings.general.tags.labelCategory1 || game.i18n.localize("CYPHERSYSTEM.Tags");
      let labelTagsCategory2 = context.actor?.system.settings.general.tags.labelCategory2 || "";
      let labelTagsCategory3 = context.actor?.system.settings.general.tags.labelCategory3 || "";
      let labelTagsCategory4 = context.actor?.system.settings.general.tags.labelCategory4 || "";

      context.tagsCategoryChoices = { "Tag": labelTagsCategory1 };
      if (labelTagsCategory2) context.tagsCategoryChoices["TagTwo"] = labelTagsCategory2;
      if (labelTagsCategory3) context.tagsCategoryChoices["TagThree"] = labelTagsCategory3;
      if (labelTagsCategory4) context.tagsCategoryChoices["TagFour"] = labelTagsCategory4;
    }

    return context;
  }

  static async #onIdentifyItem(event, target) {
    if (!this.isEditable) return;
    this.item.update({ "system.basic.identified": !this.item.system.basic.identified });
  }

  // Toggle cypher type
  static async #onToggleCypherType(event, target) {
    if (!this.isEditable) return;
    // Get state
    let typeArray = this.item.system.basic.type;
    let type = typeArray[0];
    let fantastic = typeArray[1];

    // New state
    if (game.keyboard.isModifierActive("Alt")) {
      fantastic = !fantastic;
    } else {
      type = (type === 2) ? 0 : type + 1;
    }

    // Update
    this.item.update({ "system.basic.type": [type, fantastic] });
  }

  static async #onCopyAsSkill(event, button) {
    if (!this.isEditable) return;
    const item = this.item;
    const actor = this.item.actor;
    if (!actor) return;
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

    await foundry.documents.Item.implementation.createDocuments([itemData], {parent: actor});

    return ui.notifications.info(game.i18n.format("CYPHERSYSTEM.ItemCreatedAsSkill", { item: item.name }));
  }

  static async #onCopyAsAttack(event, target) {
    if (!this.isEditable) return;
    const item = this.item;
    const actor = item.actor;
    if (!actor) return;
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

    await foundry.documents.Item.implementation.createDocuments([itemData], {parent: actor});

    return ui.notifications.info(game.i18n.format("CYPHERSYSTEM.ItemCreatedAsAttack", { item: item.name }));
  }

  static async #onCopyAsEquipment(event, target) {
    if (!this.isEditable) return;
    const item = this.item;
    const actor = this.item.actor;
    if (!actor) return;
    if (!["attack", "armor"].includes(item.type)) return;

    let itemData = {
      name: item.name,
      type: "equipment",
      "system.description": item.system.description
    };

    await foundry.documents.Item.implementation.createDocuments([itemData], {parent: actor});

    return ui.notifications.info(game.i18n.format("CYPHERSYSTEM.ItemCreatedAsEquipment", { item: item.name }));
  }

  static async #onCopyAsArmor(event, target) {
    if (!this.isEditable) return;
    const item = this.item;
    const actor = this.item.actor;
    if (!actor) return;
    if (!["ability"].includes(item.type)) return;

    let itemData = {
      name: item.name,
      type: "armor",
      "system.description": item.system.description,
      "system.basic.type": "special ability"
    };

    await foundry.documents.Item.implementation.createDocuments([itemData], {parent: actor});

    return ui.notifications.info(game.i18n.format("CYPHERSYSTEM.ItemCreatedAsArmor", { item: item.name }));
  }

  static async #onAddTag(event, target) {
    if (!this.isEditable) return;
    const item = this.item;
    const tag = this.item.actor.items.get(target.dataset.itemId);

    if (tag.type === "tag") {
      const array = (Array.isArray(item.flags.cyphersystem?.tags)) ? item.flags.cyphersystem?.tags : [];
      await addOrRemoveFromArray(array);
      const tagFound = await archiveItem(array);
      await item.update({
        "flags.cyphersystem.tags": array,
        "system.archived": !tagFound
      });
    } else if (tag.type === "recursion") {
      const array = (Array.isArray(item.flags.cyphersystem?.recursions)) ? item.flags.cyphersystem?.recursions : [];
      await addOrRemoveFromArray(array);
      const tagFound = await archiveItem(array);
      await item.update({
        "flags.cyphersystem.recursions": array,
        "system.archived": !tagFound
      });
    }
    this.render(true);

    async function addOrRemoveFromArray(array) {
      if (array.includes(tag._id)) {
        const index = array.indexOf(tag._id);
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
      const tagFound = activeTags.some(id => array.includes(id));

      // Return whether a tag has been found
      return tagFound;
    }
  }
}
