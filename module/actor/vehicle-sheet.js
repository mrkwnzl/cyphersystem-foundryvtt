/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
export class CypherActorSheetVehicle extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "actor", "vehicle"],
      template: "systems/cyphersystem/templates/vehicle-sheet.html",
      width: 650,
      height: 630,
      resizable: false,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body"}],
      scrollY: [".sheet-body", ".tab", ".description", ".items", ".settings"]
    });
  }
}
