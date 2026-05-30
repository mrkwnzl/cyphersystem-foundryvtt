/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
import { CypherActorSheet } from "./actor-sheet.js";

export class CypherActorSheetMarker extends CypherActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body" }],
      scrollY: [".sheet-body", ".tab", ".skills", ".description", ".items", ".settings", ".editor-content"]
    });
  }

  static DEFAULT_OPTIONS = {
    classes: ["token"],
  }

  static PARTS = {
    marker: { template: "systems/cyphersystem/templates/actor-sheets/marker-sheet.html", scrollable: [".scrollable"] },
  }

  static TABS = {
    primary: {
      tabs: [
        { id: 'notes', cssClass: "item", label: "CYPHERSYSTEM.Notes" }, // not limited
        { id: 'description', cssClass: "item", label: "CYPHERSYSTEM.Description" },
        { id: 'items', cssClass: "item", label: "CYPHERSYSTEM.Storage" }, // not limited
        { id: 'settings', cssClass: "item narrow", icon: "fa-item fa-solid fa-gear" } // not limited
      ],
      initial: 'notes'
      //scrollY: [".sheet-body", ".tab", ".skills", ".description", ".combat", ".items", ".abilities", ".settings", ".editor-content"]
    },
    limited: {
      tabs: [
        { id: 'description', cssClass: "item", label: "CYPHERSYSTEM.Description" },
      ],
      initial: 'description'
      //scrollY: [".sheet-body", ".tab", ".skills", ".description", ".combat", ".items", ".abilities", ".settings", ".editor-content"]
    }
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    if (context.actor.system.settings.general.hideNotes) delete context.tabs.notes;
    if (context.actor.system.settings.general.hideDescription) delete context.tabs.description;
    if (context.actor.system.settings.general.hideEquipment) delete context.tabs.equipment;
    return context;
  }
}
