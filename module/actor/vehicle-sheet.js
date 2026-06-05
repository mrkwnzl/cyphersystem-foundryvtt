/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
import {CypherActorSheet} from "./actor-sheet.js";

export class CypherActorSheetVehicle extends CypherActorSheet {
  
  static DEFAULT_OPTIONS = {
    classes: ["vehicle"],
  }

  static PARTS = {
    vehicle: { template: "systems/cyphersystem/templates/actor-sheets/vehicle-sheet.html", scrollable: [".scrollable"] }
  }

  static TABS = {
    primary: {
      tabs: [
        { id: 'notes', cssClass: "item", label: "CYPHERSYSTEM.Notes" },
        { id: 'description', cssClass: "item", label: "CYPHERSYSTEM.Description" },
        { id: 'items', cssClass: "item", label: "CYPHERSYSTEM.Storage" }, // not limited
        { id: 'settings', cssClass: "item narrow", icon: "fa-item fa-solid fa-gear" } // not limited
      ],
      initial: 'notes'
    },
    limited: {
      tabs: [
        { id: 'description', cssClass: "item", label: "CYPHERSYSTEM.Description" },
      ],
      initial: 'description'
    },
  }
}
