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
      template: "systems/cyphersystem/templates/actor/npc-sheet.html",
      width: 650,
      height: false,
      resizable: false,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body"}],
      scrollY: [".sheet-body", ".tab", ".description", ".settings", ".items"]
    });
  }

  /**
  * Additional data preparations
  */
  getData() {
    const data = super.getData();
    const actorData = data.actor.data;
    data.data.rollButtons = false;

    return data;
  }
}
