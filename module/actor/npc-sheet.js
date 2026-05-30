/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
import {CypherActorSheet} from "./actor-sheet.js";

export class CypherActorSheetNPC extends CypherActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body"}],
      scrollY: [".sheet-body", ".tab", ".description", ".settings", ".items", ".editor-content"]
    });
  }

  static DEFAULT_OPTIONS = {
    classes: ["npc"],
  }

  static PARTS = {
    npc: { template: "systems/cyphersystem/templates/actor-sheets/npc-sheet.html", scrollable: [".scrollable"] }
  }

  static TABS = {
    primary: {
      tabs: [
        { id: 'notes', cssClass: "item", label: "CYPHERSYSTEM.Notes" },
        { id: 'description', cssClass: "item", label: "CYPHERSYSTEM.Description" },
        { id: 'items', cssClass: "item", label: "CYPHERSYSTEM.Inventory" }, // not limited
        { id: 'settings', cssClass: "item narrow", icon: "fa-item fa-solid fa-gear" } // not limited
      ],
      initial: 'notes'
    },
    limited: {
      tabs: [
        { id: 'description', cssClass: "item", label: "CYPHERSYSTEM.Description" },
      ],
      initial: 'description'
    }
  }


  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.sheetSettings.rollButtons = false;
    return context;
  }
}
