/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
import { CypherActorSheet } from "./actor-sheet.js";

export class CypherActorSheetCompanion extends CypherActorSheet {

  static DEFAULT_OPTIONS = {
    classes: ["companion"],
  }

  static PARTS = {
    companion: { template: "systems/cyphersystem/templates/actor-sheets/companion-sheet.html", scrollable: [".scrollable"] }
  }

  static TABS = {
    primary: {
      tabs: [
        { id: 'skills', cssClass: "item", label: "CYPHERSYSTEM.SkillsAndAbilities" }, // not limited
        { id: 'items', cssClass: "item", label: "CYPHERSYSTEM.Inventory" }, // not limited
        { id: 'notes', cssClass: "item", label: "CYPHERSYSTEM.Notes" },
        { id: 'description', cssClass: "item", label: "CYPHERSYSTEM.Description" },
        { id: 'settings', cssClass: "item narrow", icon: "fa-item fa-solid fa-gear" } // not limited
      ],
      initial: 'skills'
    },
    limited: {
      tabs: [
        { id: 'description', cssClass: "item", label: "CYPHERSYSTEM.Description" },
      ],
      initial: 'description'
    },
  }
}
