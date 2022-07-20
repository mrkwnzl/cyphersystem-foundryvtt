/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
import {CypherActorSheet} from "./actor-sheet.js";

export class CypherActorSheetCommunity extends CypherActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "actor", "community"],
      template: "systems/cyphersystem/templates/actor-sheets/community-sheet.html",
      width: 650,
      height: false,
      resizable: false,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body"}],
      scrollY: [".sheet-body", ".tab", ".skills", ".biography", ".combat", ".items", ".abilities", ".settings"]
    });
  }

  /**
  * Additional event listeners for Community sheets
  */
  activateListeners(html) {
    super.activateListeners(html);

    if (!this.options.editable) return;

    // Increase Infrastructure
    html.find('.increase-infrastructure').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.system.infrastructure.value + amount;
      this.actor.update({"system.infrastructure.value": newValue});
    });

    // Decrease Infrastructure
    html.find('.decrease-infrastructure').click(clickEvent => {
      let amount = (event.altKey) ? 10 : 1;
      let newValue = this.actor.system.infrastructure.value - amount;
      this.actor.update({"system.infrastructure.value": newValue});
    });

    // Reset Infrastructure
    html.find('.reset-infrastructure').click(clickEvent => {
      this.actor.update({"system.infrastructure.value": this.actor.system.infrastructure.max})
    });
  }
}
