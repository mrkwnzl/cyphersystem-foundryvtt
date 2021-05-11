/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ActorSheet}
*/
export class CypherActorSheetCommunity extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "actor", "community"],
      template: "systems/cyphersystem/templates/community-sheet.html",
      width: 650,
      height: 630,
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

    // Increase Infrastructure
    html.find('.increase-infrastructure').click(clickEvent => {
      let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
      let newValue = this.actor.data.data.infrastructure.value + amount;
      this.actor.update({"data.infrastructure.value": newValue});
    });

    // Decrease Infrastructure
    html.find('.decrease-infrastructure').click(clickEvent => {
      let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
      let newValue = this.actor.data.data.infrastructure.value - amount;
      this.actor.update({"data.infrastructure.value": newValue});
    });

    // Reset Infrastructure
    html.find('.reset-infrastructure').click(clickEvent => {
      this.actor.update({
        "data.infrastructure.value": this.actor.data.data.infrastructure.max
      }).then(item => {
        this.render();
      });
    });
  }
}
