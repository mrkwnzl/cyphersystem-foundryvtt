/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ApplicationV2}
*/

import {CypherActorSheet} from "../actor/actor-sheet.js";
import {CypherItemSheet} from "../item/item-sheet.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class SheetCustomization extends HandlebarsApplicationMixin(ApplicationV2) {
  
  static DEFAULT_OPTIONS = {
    tag: 'form',
    id: "sheet-cusomization-defaults",
    classes: ["cyphersystem", "sheet", "sheet-customization"],
    position: {
      top: 150,
      width: 650,
      height: 170,
    },
    window: {
      title: "CYPHERSYSTEM.SettingSheetCustomizationLabel",
      resizable: false,
    },
    form: {
      handler: this.#onSubmitForm,
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: true,
    }
  }

  static PARTS = {
    form: {
      template: "systems/cyphersystem/templates/forms/sheet-customization.html",
    }
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options)
    // Basic data
    context.backgroundImage = getBackgroundImage();
    context.backgroundImagePath = getBackgroundImagePath();
    context.backgroundImageOverlayOpacity = getBackgroundImageOverlayOpacity();

    context.backgroundIcon = getBackgroundIcon();
    context.backgroundIconPath = getBackgroundIconPath();
    context.backgroundIconOpacity = getBackgroundIconOpacity();

    context.logoImage = getLogoImage();
    context.logoImagePath = getLogoImagePath();
    context.logoImageOpacity = getLogoImageOpacity();

    context.sheetCustomizationChoices = {
      "backgroundImage": {
        "foundry": "CYPHERSYSTEM.BGImageFoundry",
        "cypher-blue": "CYPHERSYSTEM.BGImageCypherBlue",
        "plain metal": "CYPHERSYSTEM.BGImageMetal",
        "paper": "CYPHERSYSTEM.BGImagePaper",
        "plain pride": "CYPHERSYSTEM.BGImagePride",
        "plain blue": "CYPHERSYSTEM.BGImagePlainBlue",
        "plain green": "CYPHERSYSTEM.BGImagePlainGreen",
        "plain grey": "CYPHERSYSTEM.BGImagePlainGrey",
        "plain purple": "CYPHERSYSTEM.BGImagePlainPurple",
        "plain red": "CYPHERSYSTEM.BGImagePlainRed",
        "plain yellow": "CYPHERSYSTEM.BGImagePlainYellow",
        "custom": "CYPHERSYSTEM.BGImageCustom"
      },
      "backgroundIcon": {
        "none": "CYPHERSYSTEM.BGIconNone",
        "bat": "CYPHERSYSTEM.BGIconBat",
        "bat-mask": "CYPHERSYSTEM.BGIconBatMask",
        "battered-axe": "CYPHERSYSTEM.BGIconBatteredAxe",
        "battle-gear": "CYPHERSYSTEM.BGIconBattleGear",
        "bear": "CYPHERSYSTEM.BGIconBear",
        "bow-arrow": "CYPHERSYSTEM.BGIconBowArrow",
        "circuitry": "CYPHERSYSTEM.BGIconCircuitry",
        "csrd-logo": "CYPHERSYSTEM.BGIconCypherLogo",
        "holy-symbol": "CYPHERSYSTEM.BGIconHolySymbol",
        "hood": "CYPHERSYSTEM.BGIconHood",
        "orb-wand": "CYPHERSYSTEM.BGIconOrbWand",
        "wizard-staff": "CYPHERSYSTEM.BGIconWizardStaff",
        "wolf": "CYPHERSYSTEM.BGIconWolf",
        "custom": "CYPHERSYSTEM.BGIconCustom"
      },
      "logoImage": {
        "none": "CYPHERSYSTEM.CSLogoNone",
        "black": "CYPHERSYSTEM.CSLogoBlack",
        "white": "CYPHERSYSTEM.CSLogoWhite",
        "color": "CYPHERSYSTEM.CSLogoColor",
        "custom": "CYPHERSYSTEM.CSLogoCustom"
      }
    };

    // Return data
    return context;
  }

  /**
  * Event listeners for roll engine dialog sheets
  */
  // activateListeners(html) {
  //   super.activateListeners(html);

  //   let data = this.object;
  // }

  static async #onSubmitForm(event, form, formData) {
    const data = formData.object;
    await setBackgroundImage(data.backgroundImage);
    await setBackgroundImagePath(data.backgroundImagePath);
    await setBackgroundImageOverlayOpacity(data.backgroundImageOverlayOpacity);
    await setBackgroundIcon(data.backgroundIcon);
    await setBackgroundIconPath(data.backgroundIconPath);
    await setBackgroundIconOpacity(data.backgroundIconOpacity);
    await setLogoImage(data.logoImage);
    await setLogoImagePath(data.logoImagePath);
    await setLogoImageOpacity(data.logoImageOpacity);
    await rerenderAllActorWindows();
    await this.render(true);
  };
}

async function rerenderAllActorWindows() {
  for (const window of foundry.applications.instances.values()) {
    if (window.rendered && 
      (window instanceof CypherActorSheet || window instanceof CypherItemSheet)) {
      window.render(false);
    }
  }
}

// Get functions
export function getBackgroundImage() {
  return game.settings.get("cyphersystem", "sheetCustomizationBackgroundImage");
}

export function getBackgroundImagePath() {
  return game.settings.get("cyphersystem", "sheetCustomizationBackgroundImagePath");
}

export function getBackgroundImageOverlayOpacity() {
  return game.settings.get("cyphersystem", "sheetCustomizationBackgroundImageOverlayOpacity");
}

export function getBackgroundIcon() {
  return game.settings.get("cyphersystem", "sheetCustomizationBackgroundIcon");
}

export function getBackgroundIconPath() {
  return game.settings.get("cyphersystem", "sheetCustomizationBackgroundIconPath");
}

export function getBackgroundIconOpacity() {
  return game.settings.get("cyphersystem", "sheetCustomizationBackgroundIconOpacity");
}

export function getLogoImage() {
  return game.settings.get("cyphersystem", "sheetCustomizationLogoImage");
}

export function getLogoImagePath() {
  return game.settings.get("cyphersystem", "sheetCustomizationLogoImagePath");
}

export function getLogoImageOpacity() {
  return game.settings.get("cyphersystem", "sheetCustomizationLogoImageOpacity");
}

// Set functions
export function setBackgroundImage(value) {
  return game.settings.set("cyphersystem", "sheetCustomizationBackgroundImage", value);
}

export function setBackgroundImagePath(value) {
  return game.settings.set("cyphersystem", "sheetCustomizationBackgroundImagePath", value);
}

export function setBackgroundImageOverlayOpacity(value) {
  return game.settings.set("cyphersystem", "sheetCustomizationBackgroundImageOverlayOpacity", value);
}

export function setBackgroundIcon(value) {
  return game.settings.set("cyphersystem", "sheetCustomizationBackgroundIcon", value);
}

export function setBackgroundIconPath(value) {
  return game.settings.set("cyphersystem", "sheetCustomizationBackgroundIconPath", value);
}

export function setBackgroundIconOpacity(value) {
  return game.settings.set("cyphersystem", "sheetCustomizationBackgroundIconOpacity", value);
}

export function setLogoImage(value) {
  return game.settings.set("cyphersystem", "sheetCustomizationLogoImage", value);
}

export function setLogoImagePath(value) {
  return game.settings.set("cyphersystem", "sheetCustomizationLogoImagePath", value);
}

export function setLogoImageOpacity(value) {
  return game.settings.set("cyphersystem", "sheetCustomizationLogoImageOpacity", value);
}