/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
import {CypherActorSheet} from "./actor-sheet.js";

export class CypherActorSheetToken extends CypherActorSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "actor", "token"],
      template: "systems/cyphersystem/templates/token-sheet.html",
      width: 650,
      height: 630,
      resizable: false,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body"}],
      scrollY: [".sheet-body", ".tab", ".skills", ".description", ".items", ".settings"]
    });
  }

  /**
  * Additional event listeners for Token sheets
  */
  activateListeners(html) {
    super.activateListeners(html);

    // Increase Quantity
    html.find('.increase-quantity').click(clickEvent => {
      let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
      let newValue = this.actor.data.data.quantity.value + amount;
      this.actor.update({"data.quantity.value": newValue});
    });

    // Decrease Quantity
    html.find('.decrease-quantity').click(clickEvent => {
      let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
      let newValue = this.actor.data.data.quantity.value - amount;
      this.actor.update({"data.quantity.value": newValue});
    });

    // Reset Quantity
    html.find('.reset-quantity').click(clickEvent => {
      this.actor.update({
        "data.quantity.value": this.actor.data.data.quantity.max
      }).then(item => {
        this.render();
      });
    });
  }
}
