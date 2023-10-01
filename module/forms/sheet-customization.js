/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {FormApplication}
*/

import {CypherActorSheet} from "../actor/actor-sheet.js";
import {CypherItemSheet} from "../item/item-sheet.js";

export class SheetCustomization extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "sheet-customization"],
      template: "systems/cyphersystem/templates/forms/sheet-customization.html",
      title: game.i18n.localize("CYPHERSYSTEM.SettingSheetCustomizationLabel"),
      id: "sheet-cusomization-defaults",
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: true,
      width: 650,
      height: "auto",
      top: 150,
      resizable: false
    });
  }

  getData() {
    // Basic data
    const data = super.getData().object;

    data.backgroundImage = getBackgroundImage();
    data.backgroundImagePath = getBackgroundImagePath();
    data.backgroundImageOverlayOpacity = getBackgroundImageOverlayOpacity();

    data.backgroundIcon = getBackgroundIcon();
    data.backgroundIconPath = getBackgroundIconPath();
    data.backgroundIconOpacity = getBackgroundIconOpacity();

    data.logoImage = getLogoImage();
    data.logoImagePath = getLogoImagePath();
    data.logoImageOpacity = getLogoImageOpacity();

    // Return data
    return data;
  }

  /**
  * Event listeners for roll engine dialog sheets
  */
  // activateListeners(html) {
  //   super.activateListeners(html);

  //   let data = this.object;
  // }

  async _updateObject(event, data) {
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
  for (let window of Object.values(ui.windows)) {
    if (window instanceof CypherActorSheet || window instanceof CypherItemSheet || window instanceof FormApplication) {
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