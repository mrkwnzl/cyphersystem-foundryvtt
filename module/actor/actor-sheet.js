/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/

import {
  chatCardMarkItemIdentified
} from "../utilities/chat-cards.js";
import {
  itemRollMacro
} from "../macros/macros.js";
import {
  byNameAscending,
  bySkillRating,
  byArchiveStatus,
  byIdentifiedStatus,
  byItemLevel,
  byFavoriteStatus,
  byCypherType,
  byPriceCategory
} from "../utilities/sorting.js";
import { useRecoveries } from "../utilities/actor-utilities.js";
import { taggingEngineMain } from "../utilities/tagging-engine/tagging-engine-main.js";
import {
  getBackgroundIcon,
  getBackgroundIconOpacity,
  getBackgroundIconPath,
  getBackgroundImage,
  getBackgroundImageOverlayOpacity,
  getBackgroundImagePath,
  getLogoImage,
  getLogoImageOpacity,
  getLogoImagePath
} from "../forms/sheet-customization.js";
import {
  changeTagStats,
  removeTagFromItem
} from "../utilities/tagging-engine/tagging-engine-computation.js";

export class CypherActorSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheetV2) {

  static DEFAULT_OPTIONS = {
    classes: ["cyphersystem", "actor"],
    position: {
      width: 650,
      height: 700,
    },
    window: {
      resizable: true,
    },
    form: {
      submitOnChange: true
    },
    actions: {
      clickItemDescription: this.#onClickItemDescription,
      itemCreate: this.#onItemCreate,
      itemEdit: this.#onItemEdit,
      identifyItem: this.#onItemIdentify,
      itemDelete: this.#onItemDelete,
      toggleTag: this.#onToggleTag,
      toggleCypherType: this.#onToggleCypherType,
      rollForLevel: this.#onRollForLevel,
      itemRoll: this.#onItemRoll,
      itemRollPay: this.#onItemRollPay,
      castSpell: this.#onCastSpell,
      incField: this.#onIncField,
      decField: this.#onDecField,
      resetField: this.#onResetField,
      toggleField: this.#onToggleField,
    }
  }

  /** @override */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.tabs = this._prepareTabs((this.actor.permission === CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED) ? "limited" : "primary");

    context.actor = context.document;
    context.items = Array.from(context.document.items);

    // Item Data
    context.itemLists = {};

    // Sheet settings
    context.sheetSettings = {};
    context.sheetSettings.isGM = game.user.isGM;
    context.sheetSettings.isLimited = (this.actor.permission === CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED);
    context.sheetSettings.isObserver = (this.actor.permission === CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER || this.actor.compendium?.locked) ? true : false;
    context.sheetSettings.useAllInOne = game.settings.get("cyphersystem", "itemMacrosUseAllInOne");
    context.sheetSettings.slashForFractions = game.settings.get("cyphersystem", "useSlashForFractions") ? "/" : "|";
    context.sheetSettings.editor = (game.settings.get("cyphersystem", "sheetEditor") == 1) ? "tinymce" : "prosemirror";
    context.sheetSettings.showOnHover = (game.settings.get("cyphersystem", "showButtonsOnHover")) ? "show-on-hover" : "";

    // Enriched HTML
    context.enrichedHTML = {};

    // --Notes and description
    context.enrichedHTML.notes = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.notes, { secrets: this.actor.isOwner, relativeTo: this.actor });
    context.enrichedHTML.gmNotes = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.gmNotes, { secrets: this.actor.isOwner, relativeTo: this.actor });
    context.enrichedHTML.description = await foundry.applications.ux.TextEditor.implementation.enrichHTML(this.actor.system.description, { secrets: this.actor.isOwner, relativeTo: this.actor });

    context.enrichedHTML.itemDescription = {};
    context.enrichedHTML.itemLevel = {};
    context.enrichedHTML.itemDepletion = {};
    context.cypherType = {};

    for (let item of this.actor.items) {
      context.enrichedHTML.itemDescription[item.id] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.description, { secrets: this.actor.isOwner, relativeTo: item });
      context.enrichedHTML.itemLevel[item.id] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.basic?.level, { relativeTo: item });
      context.enrichedHTML.itemDepletion[item.id] = await foundry.applications.ux.TextEditor.implementation.enrichHTML(item.system.basic?.depletion, { relativeTo: item });

      // Determine cypher type
      if (item.type == "cypher") {
        let color = "rgb(0, 0, 0)";
        let title = "";

        if (item.system.basic.type[1] == 1) {
          color = "color: rgb(146, 16, 18)";
        } else if (item.system.basic.type[0] == 1) {
          color = "color: rgb(214, 118, 40)";
        } else if (item.system.basic.type[0] == 2) {
          color = "color: rgb(44, 63, 101)";
        }

        if (item.system.basic.type[0] == 0 && item.system.basic.type[1] == 0) {
          title = game.i18n.localize("CYPHERSYSTEM.NoTypeCypher");
        } else if (item.system.basic.type[0] == 1 && item.system.basic.type[1] == 0) {
          title = game.i18n.localize("CYPHERSYSTEM.SubtleCypher");
        } else if (item.system.basic.type[0] == 2 && item.system.basic.type[1] == 0) {
          title = game.i18n.localize("CYPHERSYSTEM.ManifestCypher");
        } else if (item.system.basic.type[0] == 0 && item.system.basic.type[1] == 1) {
          title = game.i18n.localize("CYPHERSYSTEM.NoTypeFantasticCypher");
        } else if (item.system.basic.type[0] == 1 && item.system.basic.type[1] == 1) {
          title = game.i18n.localize("CYPHERSYSTEM.SubtleFantasticCypher");
        } else if (item.system.basic.type[0] == 2 && item.system.basic.type[1] == 1) {
          title = game.i18n.localize("CYPHERSYSTEM.ManifestFantasticCypher");
        }

        if (item.system.basic.type[0] == 0) {
          // No type
          context.cypherType[item.id] = `<i class="fa-item cypher no-type fa-regular fa-circle" style="${color}" title="${title}"></i>`;
        } else if (item.system.basic.type[0] == 1) {
          // Subtle cypher
          context.cypherType[item.id] = `<i class="fa-item cypher subtle fa-solid fa-circle-half-stroke" style="${color}" title="${title}"></i>`;
        } else if (item.system.basic.type[0] == 2) {
          // Manifest cypher
          context.cypherType[item.id] = `<i class="fa-item cypher manifest fa-solid fa-circle" style="${color}" title="${title}"></i>`;
        }
      }
    }

    // Prepare items and return
    this.cyphersystem(context);

    // Select options
    context.materialsDisplayModeChoices = {
      "price": game.i18n.localize("CYPHERSYSTEM.Price"),
      "level": game.i18n.localize("CYPHERSYSTEM.Level")
    };

    context.showPriceChoices = {
      "none": game.i18n.localize("CYPHERSYSTEM.None"),
      "category": game.i18n.localize("CYPHERSYSTEM.pricecategory"),
      "priceTag": game.i18n.localize("CYPHERSYSTEM.pricetag"),
      "both": game.i18n.localize("CYPHERSYSTEM.PriceBoth")
    };

    return context;
  }

  /**
  * Organize and classify Items for Character sheets.
  *
  * @param {Object} actorData The actor to prepare.
  *
  * @return {undefined}
  */
  cyphersystem(context) {
    const actorData = this.actor;
    const itemLists = context.itemLists;

    // Initialize containers
    const equipment = [];
    const equipmentTwo = [];
    const equipmentThree = [];
    const equipmentFour = [];
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
    const tags = [];
    const tagsTwo = [];
    const tagsThree = [];
    const tagsFour = [];

    // Iterate through items, allocating to containers
    for (let item of context.items) {
      // let item = item.system;
      item.img = item.img || DEFAULT_TOKEN;

      // Check for hidden item
      let hidden = false;
      if (actorData.system.settings.general.hideArchive && item.system.archived) hidden = true;

      // Check for roll button on level
      if (item.type == "cypher" || item.type == "artifact") {
        if (Roll.validate(item.system.basic.level.toString()) && item.system.basic.level && isNaN(item.system.basic.level)) {
          item.system.rollForLevel = true;
        } else {
          item.system.rollForLevel = false;
        }
      }

      // Append to containers
      if (item.type === "equipment" && !hidden && (item.system.settings.general.sorting == "Equipment" || this.actor.type != "pc")) {
        equipment.push(item);
      }
      else if (item.type === "equipment" && !hidden && item.system.settings.general.sorting == "EquipmentTwo") {
        equipmentTwo.push(item);
      }
      else if (item.type === "equipment" && !hidden && item.system.settings.general.sorting == "EquipmentThree") {
        equipmentThree.push(item);
      }
      else if (item.type === "equipment" && !hidden && item.system.settings.general.sorting == "EquipmentFour") {
        equipmentFour.push(item);
      }
      else if (item.type === "ammo" && !hidden) {
        ammo.push(item);
      }
      else if (item.type === "ability" && item.system.settings.general.unmaskedForm == "Mask" && !hidden && (item.system.settings.general.sorting == "Ability" || this.actor.type != "pc")) {
        abilities.push(item);
      }
      else if (item.type === "ability" && item.system.settings.general.unmaskedForm == "Mask" && !hidden && item.system.settings.general.sorting == "Spell") {
        spells.push(item);
      }
      else if (item.type === "ability" && item.system.settings.general.unmaskedForm == "Mask" && !hidden && item.system.settings.general.sorting == "AbilityTwo") {
        abilitiesTwo.push(item);
      }
      else if (item.type === "ability" && item.system.settings.general.unmaskedForm == "Mask" && !hidden && item.system.settings.general.sorting == "AbilityThree") {
        abilitiesThree.push(item);
      }
      else if (item.type === "ability" && item.system.settings.general.unmaskedForm == "Mask" && !hidden && item.system.settings.general.sorting == "AbilityFour") {
        abilitiesFour.push(item);
      }
      else if (item.type === "skill" && item.system.settings.general.unmaskedForm == "Mask" && !hidden && (item.system.settings.general.sorting == "Skill" || this.actor.type != "pc")) {
        skills.push(item);
      }
      else if (item.type === "skill" && item.system.settings.general.unmaskedForm == "Mask" && !hidden && item.system.settings.general.sorting == "SkillTwo") {
        skillsTwo.push(item);
      }
      else if (item.type === "skill" && item.system.settings.general.unmaskedForm == "Mask" && !hidden && item.system.settings.general.sorting == "SkillThree") {
        skillsThree.push(item);
      }
      else if (item.type === "skill" && item.system.settings.general.unmaskedForm == "Mask" && !hidden && item.system.settings.general.sorting == "SkillFour") {
        skillsFour.push(item);
      }
      else if (item.type === "attack" && item.system.settings.general.unmaskedForm == "Mask" && !hidden) {
        attacks.push(item);
      }
      else if (item.type === "armor" && item.system.settings.general.unmaskedForm == "Mask" && !hidden) {
        armor.push(item);
      }
      else if (item.type === "lasting-damage" && item.system.settings.general.unmaskedForm == "Mask" && !hidden) {
        lastingDamage.push(item);
      }
      else if (item.type === "power-shift" && !hidden) {
        powerShifts.push(item);
      }
      else if (item.type === "cypher" && !hidden) {
        cyphers.push(item);
      }
      else if (item.type === "artifact" && !hidden) {
        artifacts.push(item);
      }
      else if (item.type === "oddity" && !hidden) {
        oddities.push(item);
      }
      else if (item.type === "skill" && item.system.settings.general.unmaskedForm == "Teen" && !hidden) {
        teenSkills.push(item);
      }
      else if (item.type === "ability" && item.system.settings.general.unmaskedForm == "Teen" && !hidden) {
        teenAbilities.push(item);
      }
      else if (item.type === "attack" && item.system.settings.general.unmaskedForm == "Teen" && !hidden) {
        teenAttacks.push(item);
      }
      else if (item.type === "armor" && item.system.settings.general.unmaskedForm == "Teen" && !hidden) {
        teenArmor.push(item);
      }
      else if (item.type === "lasting-damage" && item.system.settings.general.unmaskedForm == "Teen" && !hidden) {
        teenLastingDamage.push(item);
      }
      else if (item.type === "material" && !hidden) {
        materials.push(item);
      }
      else if (item.type === "recursion" && !hidden) {
        recursions.push(item);
      }
      else if (item.type === "tag" && !hidden && item.system.settings.general.sorting == "Tag") {
        tags.push(item);
      }
      else if (item.type === "tag" && !hidden && item.system.settings.general.sorting == "TagTwo") {
        tagsTwo.push(item);
      }
      else if (item.type === "tag" && !hidden && item.system.settings.general.sorting == "TagThree") {
        tagsThree.push(item);
      }
      else if (item.type === "tag" && !hidden && item.system.settings.general.sorting == "TagFour") {
        tagsFour.push(item);
      }
    }

    // Sort by name
    equipment.sort(byNameAscending);
    equipmentTwo.sort(byNameAscending);
    equipmentThree.sort(byNameAscending);
    equipmentFour.sort(byNameAscending);
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
    tagsTwo.sort(byNameAscending);
    tagsThree.sort(byNameAscending);
    tagsFour.sort(byNameAscending);

    // Sort by skill rating
    if (this.actor.type == "pc" || this.actor.type == "companion") {
      if (actorData.system.settings.skills.sortByRating) {
        skills.sort(bySkillRating);
        skillsTwo.sort(bySkillRating);
        skillsThree.sort(bySkillRating);
        skillsFour.sort(bySkillRating);
        teenSkills.sort(bySkillRating);
      }
    }

    // Sort by material level
    if (this.actor.type == "pc") {
      if (actorData.system.settings.equipment.materials.sortByLevel && actorData.system.settings.equipment.materials.displayMode == "level") {
        materials.sort(byItemLevel);
      }
    }

    // Sort by material price
    if (this.actor.type == "pc") {
      if (actorData.system.settings.equipment.materials.sortByLevel && actorData.system.settings.equipment.materials.displayMode == "price") {
        materials.sort(byPriceCategory);
      }
    }

    // Sort by type
    if (this.actor.type == "pc") {
      if (actorData.system.settings.equipment.cyphers.sortByType) {
        cyphers.sort(byCypherType);
      }
    }

    // Sort by identified status
    cyphers.sort(byIdentifiedStatus);
    artifacts.sort(byIdentifiedStatus);

    // Sort by favorite status
    equipment.sort(byFavoriteStatus);
    equipmentTwo.sort(byFavoriteStatus);
    equipmentThree.sort(byFavoriteStatus);
    equipmentFour.sort(byFavoriteStatus);
    abilities.sort(byFavoriteStatus);
    abilitiesTwo.sort(byFavoriteStatus);
    abilitiesThree.sort(byFavoriteStatus);
    abilitiesFour.sort(byFavoriteStatus);
    spells.sort(byFavoriteStatus);
    skills.sort(byFavoriteStatus);
    skillsTwo.sort(byFavoriteStatus);
    skillsThree.sort(byFavoriteStatus);
    skillsFour.sort(byFavoriteStatus);
    attacks.sort(byFavoriteStatus);
    armor.sort(byFavoriteStatus);
    lastingDamage.sort(byFavoriteStatus);
    powerShifts.sort(byFavoriteStatus);
    cyphers.sort(byFavoriteStatus);
    artifacts.sort(byFavoriteStatus);
    oddities.sort(byFavoriteStatus);
    teenSkills.sort(byFavoriteStatus);
    teenAbilities.sort(byFavoriteStatus);
    teenAttacks.sort(byFavoriteStatus);
    teenArmor.sort(byFavoriteStatus);
    teenLastingDamage.sort(byFavoriteStatus);
    materials.sort(byFavoriteStatus);
    ammo.sort(byFavoriteStatus);
    recursions.sort(byFavoriteStatus);
    tags.sort(byFavoriteStatus);
    tagsTwo.sort(byFavoriteStatus);
    tagsThree.sort(byFavoriteStatus);
    tagsFour.sort(byFavoriteStatus);

    // Sort by archive status
    equipment.sort(byArchiveStatus);
    equipmentTwo.sort(byArchiveStatus);
    equipmentThree.sort(byArchiveStatus);
    equipmentFour.sort(byArchiveStatus);
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
    tagsTwo.sort(byArchiveStatus);
    tagsThree.sort(byArchiveStatus);
    tagsFour.sort(byArchiveStatus);

    // Show item categories on PCs
    if (this.actor.type == "pc") {
      // Check for equipment category 2
      if (equipmentTwo.length > 0 || (this.actor.system.settings.equipment.labelCategory2 && !this.actor.system.settings.general.hideEmptyCategories)) {
        context.sheetSettings.showEquipmentTwo = true;
      } else {
        context.sheetSettings.showEquipmentTwo = false;
      }

      // Check for equipment category 3
      if (equipmentThree.length > 0 || (this.actor.system.settings.equipment.labelCategory3 && !this.actor.system.settings.general.hideEmptyCategories)) {
        context.sheetSettings.showEquipmentThree = true;
      } else {
        context.sheetSettings.showEquipmentThree = false;
      }

      // Check for equipment category 4
      if (equipmentFour.length > 0 || (this.actor.system.settings.equipment.labelCategory4 && !this.actor.system.settings.general.hideEmptyCategories)) {
        context.sheetSettings.showEquipmentFour = true;
      } else {
        context.sheetSettings.showEquipmentFour = false;
      }

      // Check for spells
      if (spells.length > 0 || (this.actor.system.settings.abilities.labelSpells && !this.actor.system.settings.general.hideEmptyCategories)) {
        context.sheetSettings.showSpells = true;
      } else {
        context.sheetSettings.showSpells = false;
      }

      // Check for ability category 2
      if (abilitiesTwo.length > 0 || (this.actor.system.settings.abilities.labelCategory2 && !this.actor.system.settings.general.hideEmptyCategories)) {
        context.sheetSettings.showAbilitiesTwo = true;
      } else {
        context.sheetSettings.showAbilitiesTwo = false;
      }

      // Check for ability category 3
      if (abilitiesThree.length > 0 || (this.actor.system.settings.abilities.labelCategory3 && !this.actor.system.settings.general.hideEmptyCategories)) {
        context.sheetSettings.showAbilitiesThree = true;
      } else {
        context.sheetSettings.showAbilitiesThree = false;
      }

      // Check for ability category 4
      if (abilitiesFour.length > 0 || (this.actor.system.settings.abilities.labelCategory4 && !this.actor.system.settings.general.hideEmptyCategories)) {
        context.sheetSettings.showAbilitiesFour = true;
      } else {
        context.sheetSettings.showAbilitiesFour = false;
      }

      // Check for skill category 2
      if (skillsTwo.length > 0 || (this.actor.system.settings.skills.labelCategory2 && !this.actor.system.settings.general.hideEmptyCategories)) {
        context.sheetSettings.showSkillsTwo = true;
      } else {
        context.sheetSettings.showSkillsTwo = false;
      }

      // Check for skill category 3
      if (skillsThree.length > 0 || (this.actor.system.settings.skills.labelCategory3 && !this.actor.system.settings.general.hideEmptyCategories)) {
        context.sheetSettings.showSkillsThree = true;
      } else {
        context.sheetSettings.showSkillsThree = false;
      }

      // Check for skill category 4
      if (skillsFour.length > 0 || (this.actor.system.settings.skills.labelCategory4 && !this.actor.system.settings.general.hideEmptyCategories)) {
        context.sheetSettings.showSkillsFour = true;
      } else {
        context.sheetSettings.showSkillsFour = false;
      }

      // Check for tags category 2
      if (tagsTwo.length > 0 || (this.actor.system.settings.general.tags?.labelCategory2 && !this.actor.system.settings.general.hideEmptyCategories)) {
        context.sheetSettings.showTagsTwo = true;
      } else {
        context.sheetSettings.showTagsTwo = false;
      }

      // Check for tags category 3
      if (tagsThree.length > 0 || (this.actor.system.settings.general.tags?.labelCategory3 && !this.actor.system.settings.general.hideEmptyCategories)) {
        context.sheetSettings.showTagsThree = true;
      } else {
        context.sheetSettings.showTagsThree = false;
      }

      // Check for tags category 4
      if (tagsFour.length > 0 || (this.actor.system.settings.general.tags?.labelCategory4 && !this.actor.system.settings.general.hideEmptyCategories)) {
        context.sheetSettings.showTagsFour = true;
      } else {
        context.sheetSettings.showTagsFour = false;
      }
    }

    // Assign and return
    itemLists.equipment = equipment;
    itemLists.equipmentTwo = equipmentTwo;
    itemLists.equipmentThree = equipmentThree;
    itemLists.equipmentFour = equipmentFour;
    itemLists.abilities = abilities;
    itemLists.abilitiesTwo = abilitiesTwo;
    itemLists.abilitiesThree = abilitiesThree;
    itemLists.abilitiesFour = abilitiesFour;
    itemLists.spells = spells;
    itemLists.skills = skills;
    itemLists.skillsTwo = skillsTwo;
    itemLists.skillsThree = skillsThree;
    itemLists.skillsFour = skillsFour;
    itemLists.attacks = attacks;
    itemLists.armor = armor;
    itemLists.lastingDamage = lastingDamage;
    itemLists.powerShifts = powerShifts;
    itemLists.cyphers = cyphers;
    itemLists.artifacts = artifacts;
    itemLists.oddities = oddities;
    itemLists.teenSkills = teenSkills;
    itemLists.teenAbilities = teenAbilities;
    itemLists.teenAttacks = teenAttacks;
    itemLists.teenArmor = teenArmor;
    itemLists.teenLastingDamage = teenLastingDamage;
    itemLists.materials = materials;
    itemLists.ammo = ammo;
    itemLists.recursions = recursions;
    itemLists.tags = tags;
    itemLists.tagsTwo = tagsTwo;
    itemLists.tagsThree = tagsThree;
    itemLists.tagsFour = tagsFour;

    // Sheet customizations
    // Get root css variables
    let root = document.querySelector(':root');

    let teenCustomSheetDesign = (this.actor.type == "pc") ? actorData.system.teen.settings.general.customSheetDesign : false;
    let customSheetDesign = (this.actor.type == "pc") ? actorData.system.settings.general.customSheetDesign : false;

    if (game.modules.get("cyphersheets")?.active) {
      context.sheetSettings.backgroundImage = "foundry";
      context.sheetSettings.backgroundIcon = "none";
      context.sheetSettings.cyphersheetsModuleActive = true;
      context.sheetSettings.backgroundImageBaseSetting = "";
    } else {
      customBackgroundData();
    }

    function customBackgroundData() {
      // Sheet settings
      context.sheetSettings.cyphersheetsModuleActive = false;
      context.sheetSettings.backgroundImageBaseSetting = "background-image";

      // Create image & icon
      if (actorData.system.basic.unmaskedForm == "Teen" && teenCustomSheetDesign) {
        context.sheetSettings.backgroundImage = actorData.system.teen.settings.general.background.image;
        context.sheetSettings.backgroundIcon = actorData.system.teen.settings.general.background.icon;
        if (actorData.system.teen.settings.general.background.image == "custom") {
          context.sheetSettings.backgroundImagePath = "/" + actorData.system.teen.settings.general.background.imagePath;
          context.sheetSettings.backgroundOverlayOpacity = actorData.system.teen.settings.general.background.overlayOpacity;
        }
        if (actorData.system.teen.settings.general.background.icon == "custom") {
          context.sheetSettings.backgroundIconPath = (actorData.system.teen.settings.general.background.iconPath) ? actorData.system.teen.settings.general.background.iconPath : "/systems/cyphersystem/icons/background/icon-transparent.webp";
          context.sheetSettings.backgroundIconOpacity = actorData.system.teen.settings.general.background.iconOpacity;
        } else {
          context.sheetSettings.backgroundIconPath = "/systems/cyphersystem/icons/background/icon-" + actorData.system.teen.settings.general.background.icon + ".svg";
        }
      } else if (customSheetDesign) {
        context.sheetSettings.backgroundImage = actorData.system.settings.general.background.image;
        context.sheetSettings.backgroundIcon = actorData.system.settings.general.background.icon;
        if (actorData.system.settings.general.background.image == "custom") {
          context.sheetSettings.backgroundImagePath = "/" + actorData.system.settings.general.background.imagePath;
          context.sheetSettings.backgroundOverlayOpacity = actorData.system.settings.general.background.overlayOpacity;
        }
        if (actorData.system.settings.general.background.icon == "custom") {
          context.sheetSettings.backgroundIconPath = (actorData.system.settings.general.background.iconPath) ? actorData.system.settings.general.background.iconPath : "/systems/cyphersystem/icons/background/icon-transparent.webp";
          context.sheetSettings.backgroundIconOpacity = actorData.system.settings.general.background.iconOpacity;
        } else {
          context.sheetSettings.backgroundIconPath = "/systems/cyphersystem/icons/background/icon-" + actorData.system.settings.general.background.icon + ".svg";
        }
      } else {
        context.sheetSettings.backgroundImage = getBackgroundImage();
        context.sheetSettings.backgroundIcon = getBackgroundIcon();
        context.sheetSettings.backgroundIconPath = getBackgroundIconPath();
        if (context.sheetSettings.backgroundImage == "custom") {
          context.sheetSettings.backgroundImagePath = "/" + getBackgroundImagePath();
          context.sheetSettings.backgroundOverlayOpacity = getBackgroundImageOverlayOpacity();
        }
        if (context.sheetSettings.backgroundIcon == "custom") {
          if (!context.sheetSettings.backgroundIconPath) {
            context.sheetSettings.backgroundIconPath = "/systems/cyphersystem/icons/background/icon-transparent.webp";
          }
          context.sheetSettings.backgroundIconOpacity = getBackgroundIconOpacity();
        } else {
          context.sheetSettings.backgroundIconPath = "/systems/cyphersystem/icons/background/icon-" + context.sheetSettings.backgroundIcon + ".svg";
        }
      }
    }

    // Create logo
    if (actorData.system.basic.unmaskedForm == "Teen" && teenCustomSheetDesign) {
      context.sheetSettings.logoImage = actorData.system.teen.settings.general.logo.image;
      if (actorData.system.teen.settings.general.logo.image == "custom") {
        if (!actorData.system.teen.settings.general.logo.imagePath) {
          context.sheetSettings.logoPath = "/systems/cyphersystem/icons/background/icon-transparent.webp";
        } else {
          context.sheetSettings.logoPath = actorData.system.teen.settings.general.logo.imagePath;
        }
        context.sheetSettings.logoImageOpacity = actorData.system.teen.settings.general.logo.imageOpacity;
      } else {
        context.sheetSettings.logoPath = "systems/cyphersystem/icons/background/compatible-cypher-system-" + actorData.system.teen.settings.general.logo.image + ".webp";
      }
    } else if (customSheetDesign) {
      context.sheetSettings.logoImage = actorData.system.settings.general.logo.image;
      if (actorData.system.settings.general.logo.image == "custom") {
        if (!actorData.system.settings.general.logo.imagePath) {
          context.sheetSettings.logoPath = "/systems/cyphersystem/icons/background/icon-transparent.webp";
        } else {
          context.sheetSettings.logoPath = actorData.system.settings.general.logo.imagePath;
        }
        context.sheetSettings.logoImageOpacity = actorData.system.settings.general.logo.imageOpacity;
      } else {
        context.sheetSettings.logoPath = "systems/cyphersystem/icons/background/compatible-cypher-system-" + actorData.system.settings.general.logo.image + ".webp";
      }
    } else {
      context.sheetSettings.logoImage = getLogoImage();
      context.sheetSettings.logoPath = getLogoImagePath();
      context.sheetSettings.logoImageOpacity = getLogoImageOpacity();
      if (context.sheetSettings.logoImage == "custom") {
        if (!context.sheetSettings.logoPath) {
          context.sheetSettings.logoPath = "/systems/cyphersystem/icons/background/icon-transparent.webp";
        }
      } else {
        context.sheetSettings.logoPath = "systems/cyphersystem/icons/background/compatible-cypher-system-" + context.sheetSettings.logoImage + ".webp";
      }
    }
  }

  /**
  * Event Listeners
  */

  /** @override */
  static async #onClickItemDescription(event, target) {
    const itemID = target.closest('.item').dataset.itemId;
    if (game.keyboard.isModifierActive("Alt"))
      return this.#sendItemToChat(itemID);
    else
      return this.#expandItem(itemID);
  }

  async #expandItem(itemID) {
    if (game.user.expanded == undefined) {
      game.user.expanded = {};
    }

    if (game.user.expanded[itemID] == undefined || game.user.expanded[itemID] == false) {
      game.user.expanded[itemID] = true;
    } else {
      game.user.expanded[itemID] = false;
    }
    return this.render(false);
  }

  // Send item description to chat
  async #sendItemToChat(itemId) {
    const item = this.actor.items.get(itemId);

    if (item.system.basic.identified === false) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.WarnSentUnidentifiedToChat"));
    let message = "";
    let brackets = "";
    let description = `<hr style="margin:3px 0;"><img class="description-image-chat" src="${item.img}" width="50" height="50"/>` + item.system.description;
    let points = "";
    let notes = "";
    let name = item.name;
    if (item.system.basic.notes != "") notes = ", " + item.system.basic.notes;
    if (item.type == "skill") {
      brackets = " (" + item.system.basic.rating + ")";
    } else if (item.type == "power-shift") {
      brackets = " (" + item.system.basic.shifts + " " + game.i18n.localize("CYPHERSYSTEM.Shifts") + ")";
    } else if (item.type == "ability") {
      points = (item.system.basic.cost == "1") ? " " + game.i18n.localize("CYPHERSYSTEM.point") : " " + game.i18n.localize("CYPHERSYSTEM.points");
      if (item.system.basic.cost != 0 && item.system.basic.cost != 0) brackets = " (" + item.system.basic.cost + " " + item.system.basic.pool + points + ")";
    } else if (item.type == "attack") {
      points = (item.system.basic.damage == 1) ? " " + game.i18n.localize("CYPHERSYSTEM.PointOfDamage") : " " + game.i18n.localize("CYPHERSYSTEM.PointsOfDamage");
      let damage = ", " + item.system.basic.damage + " " + points;
      let attackType = item.system.basic.type;
      let range = "";
      if (item.system.basic.range != "") range = ", " + item.system.basic.range;
      brackets = " (" + attackType + damage + range + notes + ")";
    } else if (item.type == "armor") {
      brackets = " (" + item.system.basic.type + notes + ")";
    } else if (item.type == "lasting-damage") {
      let permanent = "";
      if (item.system.basic.type == "Permanent") permanent = ", " + game.i18n.localize("CYPHERSYSTEM.permanent");
      brackets = " (" + item.system.basic.pool + permanent + ")";
    } else {
      if (item.system.basic.level) brackets = " (" + game.i18n.localize("CYPHERSYSTEM.level") + " " + item.system.basic.level + ")";
    }
    message = "<b>" + item.type.capitalize() + ": " + name + "</b>" + brackets + description;
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker(),
      content: message
    });
  }

  /**
  * Inventory management
  */

  // Add Inventory Item
  static async #onItemCreate(event, target) {
    const itemData = await this._onItemCreate(event, target);
    this.actor.items.get(itemData.id).sheet.render(true);
  }

  // Edit Inventory Item
  static async #onItemEdit(event, target) {
    this.actor.items.get(target.closest('.item').dataset.itemId).sheet.render(true);
  }

  // Mark Item Identified
  static async #onItemIdentify(event, target) {
    const item = this.actor.items.get(target.closest('.item').dataset.itemId);

    if (game.user.isGM) {
      item.update({ "system.basic.identified": true });
    } else {
      ChatMessage.create({
        content: chatCardMarkItemIdentified(this.actor, item),
        whisper: ChatMessage.getWhisperRecipients("GM"),
        blind: true
      });
    }
  }

  // Delete Inventory Item
  static async #onItemDelete(event, target) {
    const item = this.actor.items.get(target.closest('.item').dataset.itemId);
    if (game.keyboard.isModifierActive("Alt")) {
      if (["tag", "recursion"].includes(item.type)) {
        if (item.system.active) {
          await changeTagStats(this.actor, {
            mightModifier: item.system.settings.statModifiers.might.value,
            mightEdgeModifier: item.system.settings.statModifiers.might.edge,
            speedModifier: item.system.settings.statModifiers.speed.value,
            speedEdgeModifier: item.system.settings.statModifiers.speed.edge,
            intellectModifier: item.system.settings.statModifiers.intellect.value,
            intellectEdgeModifier: item.system.settings.statModifiers.intellect.edge,
            itemActive: item.system.active
          });
        }
        await removeTagFromItem(this.actor, item._id);
      }
      await item.delete();
    } else {
      let archived = (item.system.archived) ? false : true;
      await item.update({ "system.archived": archived });
    }
  }

  // (Un)Archive tag
  static async #onToggleTag(event, target) {
    const item = this.actor.items.get(target.closest('.item').dataset.itemId);
    await taggingEngineMain(this.actor, {
      item: item,
      macroUuid: item.system.settings.macroUuid,
      statChanges: {
        mightModifier: item.system.settings.statModifiers.might.value,
        mightEdgeModifier: item.system.settings.statModifiers.might.edge,
        speedModifier: item.system.settings.statModifiers.speed.value,
        speedEdgeModifier: item.system.settings.statModifiers.speed.edge,
        intellectModifier: item.system.settings.statModifiers.intellect.value,
        intellectEdgeModifier: item.system.settings.statModifiers.intellect.edge,
        itemActive: item.system.active
      }
    });
  }

  // Toggle cypher type
  static async #onToggleCypherType(event, target) {
    const item = this.actor.items.get(target.closest('.item').dataset.itemId);

    // Get state
    let typeArray = item.system.basic.type;
    let type = typeArray[0];
    let fantastic = typeArray[1];

    // New state
    if (game.keyboard.isModifierActive("Alt")) {
      fantastic = (fantastic === 1) ? 0 : 1;
    } else {
      type = (type === 2) ? 0 : type + 1;
    }

    // Update
    typeArray[0] = type;
    typeArray[1] = fantastic;
    item.update({ "system.basic.type": typeArray });
  }

  // Roll for level
  static async #onRollForLevel(event, target) {
    const item = this.actor.items.get(target.closest('.item').dataset.itemId);
    let roll = await new Roll(item.system.basic.level).evaluate();
    roll.toMessage({
      speaker: ChatMessage.getSpeaker(),
      flavor: game.i18n.format("CYPHERSYSTEM.RollForLevel", { item: item.name })
    });
    item.update({ "system.basic.level": roll.total });
  }

  /**
  * Roll buttons
  */

  // Item roll buttons
  static async #onItemRoll(event, target) {
    const item = this.actor.items.get(target.closest('.item').dataset.itemId);
    const macroUuid = item.system.settings.rollButton.macroUuid;

    itemRollMacro(this.actor, item.id, "", "", "", "", "", "", "", "", "", "", "", "", false, "", macroUuid, "");
  }

  // Item pay pool points buttons
  static async #onItemRollPay(event, target) {
    const item = this.actor.items.get(target.closest('.item').dataset.itemId);
    const macroUuid = item.system.settings.rollButton.macroUuid;

    itemRollMacro(this.actor, item.id, "", "", "", "", "", "", "", "", "", "", "", "", true, "", macroUuid, "");
  }

  // Item cast spell button
  static async #onCastSpell(event, target) {
    const item = this.actor.items.get(target.closest('.item').dataset.itemId);

    let recoveryUsed = useRecoveries(this.actor, true);
    if (!recoveryUsed) return;

    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      content: game.i18n.format("CYPHERSYSTEM.CastingASpell", {
        name: this.actor.name,
        recoveryUsed: recoveryUsed,
        spellName: item.name
      }),
      flags: { "itemID": item.id }
    });
  }

  /**
  * General sheet functions
  */

  // Toggle item visibility
  _onRender22(context, options) {
    const html = this.element;

    const itemFavorite = html.querySelector('.item-favorite.alt');
    const itemArchived = html.querySelector('.fa-item.archived');
    const itemUnarchived = html.querySelector('.fa-item.unarchived');
    const itemCypherNoType = html.querySelector('.fa-item.cypher.no-type');
    const itemCyherSubtle = html.querySelector('.fa-item.cypher.subtle');
    const itemCypherManifest = html.querySelector('.fa-item.cypher.manifest');
    const itemInitiative = html.querySelector('.fa-item.initiative');
    const itemPayPoolPoints = html.querySelector('.fa-item.pay-pool-points');
    const statRoll = html.querySelector('.fa-item.stat-roll');
    const itemAIOInitiative = html.querySelector('.fa-item.aio-initiative');
    const itemAIOStatRoll = html.querySelector('.fa-item.aio-stat-roll');
    const itemAIOPayPoolPoints = html.querySelector('.fa-item.aio-pay-pool-points');
    const recoveryRoll = html.querySelector('.fa-recovery');
    const quantity = html.querySelector('.fa-item.quantity');

    if (game.keyboard.isModifierActive("Alt")) {
      // Copy from keydown function to keep icons after clicking

      // Favorite star
      itemFavorite.css('visibility', 'visible');

      // Archive icons
      itemArchived.removeClass('fa-arrow-rotate-left').addClass('fa-trash-xmark');
      itemUnarchived.removeClass('fa-archive').addClass('fa-trash-xmark');

      // Cypher icons
      itemCypherNoType.removeClass('fa-regular fa-circle').addClass('fa-solid fa-fire-flame-curved');
      itemCyherSubtle.removeClass('fa-circle-half-stroke').addClass('fa-fire-flame-curved');
      itemCypherManifest.removeClass('fa-circle').addClass('fa-fire-flame-curved');

      // Roll buttons
      itemInitiative.removeClass('fa-sword').addClass('fa-ballot');
      itemPayPoolPoints.removeClass('fa-coins').addClass('fa-ballot');
      statRoll.removeClass('fa-dice-d20').addClass('fa-ballot');
      itemAIOInitiative.removeClass('fa-ballot').addClass('fa-swords');
      itemAIOStatRoll.removeClass('fa-ballot').addClass('fa-dice-d20');
      itemAIOPayPoolPoints.removeClass('fa-ballot').addClass('fa-coins');

      // Recovery roll icon
      recoveryRoll.removeClass('fa-solid').addClass('fa-regular');

      // Quantity
      quantity.removeClass('fa-regular').addClass('fa-solid');
    }

    $(document).keydown(function (event) {
      if (event.altKey) {
        // Favorite star
        itemFavorite.css('visibility', 'visible');

        // Archive icons
        itemArchived.removeClass('fa-arrow-rotate-left').addClass('fa-trash-xmark');
        itemUnarchived.removeClass('fa-archive').addClass('fa-trash-xmark');

        // Cypher icons
        itemCypherNoType.removeClass('fa-regular fa-circle').addClass('fa-solid fa-fire-flame-curved');
        itemCyherSubtle.removeClass('fa-circle-half-stroke').addClass('fa-fire-flame-curved');
        itemCypherManifest.removeClass('fa-circle').addClass('fa-fire-flame-curved');

        // Roll buttons
        itemInitiative.removeClass('fa-sword').addClass('fa-ballot');
        itemPayPoolPoints.removeClass('fa-coins').addClass('fa-ballot');
        statRoll.removeClass('fa-dice-d20').addClass('fa-ballot');
        itemAIOInitiative.removeClass('fa-ballot').addClass('fa-swords');
        itemAIOStatRoll.removeClass('fa-ballot').addClass('fa-dice-d20');
        itemAIOPayPoolPoints.removeClass('fa-ballot').addClass('fa-coins');

        // Recovery roll icon
        recoveryRoll.removeClass('fa-solid').addClass('fa-regular');

        // Quantity
        quantity.removeClass('fa-regular').addClass('fa-solid');
      }
    });

    $(document).keyup(function (event) {
      if (!event.altKey) {
        // Favorite star
        itemFavorite.css('visibility', 'hidden');
        // itemFavorite.attr('display', 'none');

        // Archive icons
        itemArchived.removeClass('fa-trash-xmark').addClass('fa-arrow-rotate-left');
        itemUnarchived.removeClass('fa-trash-xmark').addClass('fa-archive');

        // Cypher icons
        itemCypherNoType.removeClass('fa-solid fa-fire-flame-curved').addClass('fa-regular fa-circle');
        itemCyherSubtle.removeClass('fa-fire-flame-curved').addClass('fa-circle-half-stroke');
        itemCypherManifest.removeClass('fa-fire-flame-curved').addClass('fa-circle');

        // Roll buttons
        itemInitiative.removeClass('fa-ballot').addClass('fa-swords');
        itemPayPoolPoints.removeClass('fa-ballot').addClass('fa-coins');
        statRoll.removeClass('fa-ballot').addClass('fa-dice-d20');
        itemAIOInitiative.removeClass('fa-swords').addClass('fa-ballot');
        itemAIOStatRoll.removeClass('fa-dice-d20').addClass('fa-ballot');
        itemAIOPayPoolPoints.removeClass('fa-coins').addClass('fa-ballot');

        // Recovery roll icon
        recoveryRoll.removeClass('fa-regular').addClass('fa-solid');

        // Quantity
        quantity.removeClass('fa-solid').addClass('fa-regular');
      }
    });
  };

  static TODO() {

    // Drag events for macros
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      // Find all items on the character sheet.
      html.querySelector("li.item").each((i, li) => {
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
  * Health management for NPCs, Companions, and Communities
  */

  // Increase field (data-field = full field path)
  static async #onIncField(event, target) {
    if (!this.isEditable) return;
    const field = target.dataset.field;
    const item = this.actor.items.get(target.closest('.item')?.dataset.itemId);
    const document = item ?? this.actor;
    let amount = (game.keyboard.isModifierActive("Alt")) ? 10 : 1;
    let newValue = foundry.utils.getProperty(document, field) + amount;
    return document.update({ [field]: newValue });
  };

  // Decrease Field (data-field = full field path)
  static async #onDecField(event, target) {
    if (!this.isEditable) return;
    const field = target.dataset.field;
    const item = this.actor.items.get(target.closest('.item')?.dataset.itemId);
    const document = item ?? this.actor;
    let amount = (game.keyboard.isModifierActive("Alt")) ? 10 : 1;
    let newValue = foundry.utils.getProperty(document, field) - amount;
    return document.update({ [field]: newValue });
  }

  // Reset Field (data-field = base field name, not including .value or .max)
  static async #onResetField(event, target) {
    if (!this.isEditable) return;
    const field = target.dataset.field;
    const item = this.actor.items.get(target.closest('.item')?.dataset.itemId);
    const document = item ?? this.actor;
    return document.update({ [`${field}.value`]: foundry.utils.getProperty(document, field).max });
  }

  static async #onToggleField(event, target) {
    if (!this.isEditable) return;
    const field = target.dataset.field;
    const item = this.actor.items.get(target.closest('.item')?.dataset.itemId);
    const document = item ?? this.actor;
    document.update({ [`${field}`]: !foundry.utils.getProperty(document, field) });
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
    // Define item type categories
    const typesCharacterProperties = ["ability", "lasting-damage", "power-shift", "skill", "recursion", "tag"];
    const typesUniqueItems = ["armor", "artifact", "attack", "cypher", "oddity"];
    const typesQuantityItems = ["ammo", "equipment", "material"];

    // Define items & actors
    const originItem = await Item.fromDropData(data);
    let originItemData = foundry.utils.deepClone(originItem.toObject());
    const originActor = originItem.actor;
    const targetActor = this.actor;
    let targetItem = null;

    // Sort item into category
    if (["skill", "ability", "equipment", "tag"].includes(originItemData.type)) {
      originItemData.system.settings.general.sorting = await sortItemsIntoCategories(event, originItemData);
    }

    // Check for duplicate character properties
    for (let item of targetActor.items) {
      if (originItem.type == item.type && originItem.name == item.name) {
        targetItem = item;
      }
    }

    // Define actor IDs
    const originActorID = (originActor) ? originActor.id : "";
    const targetActorID = (targetActor) ? targetActor.id : "";

    // Sort already existing items
    if (originActorID == targetActorID) {
      targetActor.updateEmbeddedDocuments("Item", [originItemData]);
    };

    // Return statements
    if (!targetActor.isOwner) return;
    if (originActorID == targetActorID) return;

    // Handle character properties
    if (typesCharacterProperties.includes(originItem.type)) {
      // Only PCs and Companions can carry character properties
      if (!["pc", "companion"].includes(targetActor.type)) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.CharacterPropertiesCanOnlySharedAcrossPCs"));

      // Companions can only carry skills and abilities, and not ones for teens
      if (["companion"].includes(targetActor.type) && (!["skill", "ability"].includes(originItem.type) || originItem.system.settings.general.unmaskedForm == "Teen")) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.ItemTypeCannotBeMovedToCompanion"));

      // Tags and recursions are inactive when copied from another source
      if (["recursion", "tag"].includes(originItem.type)) {
        originItemData.system.active = false;
      }

      // Create Item
      targetActor.createEmbeddedDocuments("Item", [originItemData]);

      // Enable the appropriate list
      enableItemLists();
    }

    // Handle unique items
    if (typesUniqueItems.includes(originItem.type)) {
      if (originActor) {
        let d = new Dialog({
          title: game.i18n.localize("CYPHERSYSTEM.ItemShouldBeArchivedOrDeleted"),
          content: "",
          buttons: {
            move: {
              icon: "<i class='fa-item fas fa-archive'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.Archive"),
              callback: (html) => archiveItem()
            },
            moveAll: {
              icon: "<i class='fa-item fas fa-trash-xmark'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.Delete"),
              callback: (html) => deleteItem()
            },
            cancel: {
              icon: "<i class='fa-item fas fa-times'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
              callback: () => { }
            }
          },
          default: "move",
          close: () => { }
        });
        d.render(true, { width: "auto" });
      } else {
        // Handle cypher & artifact identification from world items
        if (["cypher", "artifact"].includes(originItem.type)) {
          let identifiedStatus;
          if (game.settings.get("cyphersystem", "cypherIdentification") == 0) {
            identifiedStatus = originItemData.system.basic.identified;
          } else if (game.settings.get("cyphersystem", "cypherIdentification") == 1) {
            identifiedStatus = true;
          } else if (game.settings.get("cyphersystem", "cypherIdentification") == 2) {
            identifiedStatus = false;
          }
          originItemData.system.basic.identified = identifiedStatus;
        }

        // Create item
        targetActor.createEmbeddedDocuments("Item", [originItemData]);
        enableItemLists();
      }
    }

    // Handle items with quantity
    if (typesQuantityItems.includes(originItem.type)) {
      let maxQuantity = originItem.system.basic.quantity;
      if (maxQuantity <= 0 && maxQuantity != null) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.CannotMoveNotOwnedItem"));
      moveDialog();

      function moveDialog() {
        let d = new Dialog({
          title: game.i18n.format("CYPHERSYSTEM.MoveItem", { name: originItem.name }),
          content: createContent(),
          buttons: createButtons(),
          default: "move",
          close: () => { }
        });
        d.render(true, { width: "auto" });
      }

      function createContent() {
        let maxQuantityText = "";
        if (maxQuantity != null) maxQuantityText = `&nbsp;&nbsp;${game.i18n.localize("CYPHERSYSTEM.Of")} ${maxQuantity}`;
        let content = `<div align="center"><label style="display: inline-block; width: 98px; text-align: right"><b>${game.i18n.localize("CYPHERSYSTEM.Quantity")}/${game.i18n.localize("CYPHERSYSTEM.Units")}: </b></label><input name="quantity" id="quantity" style="width: 75px; margin-left: 5px; margin-bottom: 5px;text-align: center" type="number" value="1" />` + maxQuantityText + `</div>`;
        return content;
      }

      function createButtons() {
        if (maxQuantity == null) {
          return {
            move: {
              icon: "<i class='fa-item fas fa-share-square'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.Move"),
              callback: (html) => moveItems(html.querySelector("#quantity").val(), originItem)
            },
            cancel: {
              icon: "<i class='fa-item fas fa-times'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
              callback: () => { }
            }
          };
        } else {
          return {
            move: {
              icon: "<i class='fa-item fas fa-share-square'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.Move"),
              callback: (html) => moveItems(html.querySelector("#quantity").val(), originItem)
            },
            moveAll: {
              icon: "<i class='fa-item fas fa-share-square'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.MoveAll"),
              callback: (html) => moveItems(maxQuantity, originItem)
            },
            cancel: {
              icon: "<i class='fa-item fas fa-times'></i>",
              label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
              callback: () => { }
            }
          };
        }
      }

      function moveItems(quantity) {
        quantity = parseInt(quantity);
        if (quantity == null) { quantity = 0; };
        if (originActor && (quantity > originItem.system.basic.quantity || quantity <= 0)) {
          moveDialog(quantity);
          return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.CanOnlyMoveCertainAmountOfItems", { max: originItem.system.basic.quantity }));
        }
        if (originActor) {
          let oldQuantity = parseInt(originItem.system.basic.quantity) - quantity;
          originItem.update({ "system.basic.quantity": oldQuantity });
          enableItemLists();
        }
        if (!targetItem) {
          originItemData.system.basic.quantity = quantity;
          targetActor.createEmbeddedDocuments("Item", [originItemData]);
          enableItemLists();
        } else {
          let newQuantity = parseInt(targetItem.system.basic.quantity) + quantity;
          targetItem.update({ "system.basic.quantity": newQuantity });
          enableItemLists();
        }
      }
    }

    async function enableItemLists() {
      if (originItem.type == "artifact") {
        targetActor.update({ "system.settings.equipment.artifacts.active": true });
      }
      else if (originItem.type == "cypher") {
        targetActor.update({ "system.settings.equipment.cyphers.active": true });
      }
      else if (originItem.type == "oddity") {
        targetActor.update({ "system.settings.equipment.oddities.active": true });
      }
      else if (originItem.type == "material") {
        targetActor.update({ "system.settings.equipment.materials.active": true });
      }
      else if (originItem.type == "ammo" && targetActor.type == "pc") {
        targetActor.update({ "system.settings.combat.ammo.active": true });
      }
      else if (originItem.type == "ammo" && targetActor.type != "pc") {
        targetActor.update({ "system.settings.equipment.ammo.active": true });
      }
      else if (originItem.type == "power-shift" && targetActor.type == "pc") {
        targetActor.update({ "system.settings.skills.powerShifts.active": true });
      }
      else if (originItem.type == "lasting-damage" && targetActor.type == "pc") {
        targetActor.update({ "system.settings.combat.lastingDamage.active": true });
      }
      else if (originItem.type == "attack" && targetActor.type != "pc") {
        targetActor.update({ "system.settings.equipment.attacks.active": true });
      }
      else if (originItem.type == "armor" && targetActor.type != "pc") {
        targetActor.update({ "system.settings.equipment.armor.active": true });
      }
      else if (originItem.type == "tag" && targetActor.type == "pc") {
        targetActor.update({ "system.settings.general.tags.active": true });
      }
    }

    async function archiveItem() {
      originItem.update({ "system.archived": true });
      targetActor.createEmbeddedDocuments("Item", [originItemData]);
      enableItemLists();
    }

    function deleteItem() {
      originItem.delete();
      targetActor.createEmbeddedDocuments("Item", [originItemData]);
      enableItemLists();
    }

    async function sortItemsIntoCategories(event, item) {
      let skillArray = ["Skill", "SkillTwo", "SkillThree", "SkillFour"];
      let abilityArray = ["Ability", "AbilityTwo", "AbilityThree", "AbilityFour", "Spell"];
      let equipmentArray = ["Equipment", "EquipmentTwo", "EquipmentThree", "EquipmentFour"];
      let tagArray = ["Tag", "TagTwo", "TagThree", "TagFour"];
      let viableIDs = [];

      if (item.type == "skill") {
        viableIDs = skillArray;
      } else if (item.type == "ability") {
        viableIDs = abilityArray;
      } else if (item.type == "equipment") {
        viableIDs = equipmentArray;
      } else if (item.type == "tag") {
        viableIDs = tagArray;
      }

      let target = event.target;
      let targetID = "";

      while (target.parentElement) {
        target = target.parentElement;
        if (viableIDs.includes(target.id)) {
          targetID = target.id;
          break;
        }
      }

      if (targetID) {
        return targetID;
      } else {
        return item.system.settings.general.sorting;
      }
    }
  }

  /**
  * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
  * @param {Event} event   The originating click event
  * @private
  */
  _onItemCreate(event, target) {
    event.preventDefault();
    const header = target;

    // Get the type of item to create.
    const type = header.dataset.type;

    // Grab any data associated with this control.
    const data = foundry.utils.duplicate(header.dataset);

    // Initialize a default name.
    const types = {
      "ability": game.i18n.localize("CYPHERSYSTEM.NewAbility"),
      "ammo": game.i18n.localize("CYPHERSYSTEM.NewAmmo"),
      "armor": game.i18n.localize("CYPHERSYSTEM.NewArmor"),
      "artifact": game.i18n.localize("CYPHERSYSTEM.NewArtifact"),
      "attack": game.i18n.localize("CYPHERSYSTEM.NewAttack"),
      "cypher": game.i18n.localize("CYPHERSYSTEM.NewCypher"),
      "equipment": game.i18n.localize("CYPHERSYSTEM.NewEquipment"),
      "lasting-damage": game.i18n.localize("CYPHERSYSTEM.NewLastingDamage"),
      "material": game.i18n.localize("CYPHERSYSTEM.NewMaterial"),
      "oddity": game.i18n.localize("CYPHERSYSTEM.NewOddity"),
      "power-shift": game.i18n.localize("CYPHERSYSTEM.NewPowerShift"),
      "skill": game.i18n.localize("CYPHERSYSTEM.NewSkill"),
      "recursion": game.i18n.localize("CYPHERSYSTEM.NewRecursion"),
      "tag": game.i18n.localize("CYPHERSYSTEM.NewTag"),
      "default": game.i18n.localize("CYPHERSYSTEM.NewDefault")
    };
    const name = (types[type] || types["default"]);

    // Finally, create the item!
    return Item.create({ type: type, data, name: name }, { parent: this.actor });
  }
}
