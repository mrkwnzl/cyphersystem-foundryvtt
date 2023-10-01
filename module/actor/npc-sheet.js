/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
import {CypherActorSheet} from "./actor-sheet.js";

export class CypherActorSheetNPC extends CypherActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "actor", "npc"],
      template: "systems/cyphersystem/templates/actor-sheets/npc-sheet.html",
      width: 650,
      height: 700,
      resizable: true,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body"}],
      scrollY: [".sheet-body", ".tab", ".description", ".settings", ".items", ".editor-content"]
    });
  }

  /**
  * Additional data preparations
  */
  async getData() {
    const data = await super.getData();

    // Sheet settings
    data.sheetSettings.rollButtons = false;

    return data;
  }
}
