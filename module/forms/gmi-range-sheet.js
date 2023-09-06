/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {FormApplication}
*/

export class GMIRangeSheet extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "gmi-form"],
      template: "systems/cyphersystem/templates/forms/gmi-range-sheet.html",
      title: game.i18n.localize("CYPHERSYSTEM.GMIRange"),
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: false,
      width: 300,
      height: "auto",
      top: 235,
      left: 110,
      resizable: false
    });
  }

  getData() {
    // Basic data
    const data = super.getData().object;

    data.globalGMIRange = game.settings.get("cyphersystem", "globalGMIRange");
    data.useGlobalGMIRange = game.settings.get("cyphersystem", "useGlobalGMIRange");
    data.isGM = game.user.isGM;
    data.actors = [];
    for (let actor of game.actors) {
      if (actor.type == "pc" && actor.hasPlayerOwner) {
        data.actors.push(actor);
      }
    }

    // Return data
    return data;
  }

  /**
  * Event listeners for roll engine dialog sheets
  */
  activateListeners(html) {
    super.activateListeners(html);

    let data = this.object;

    html.find('.toggle-global-gmi-range').click(async clickEvent => {
      await game.settings.set("cyphersystem", "useGlobalGMIRange", !game.settings.get("cyphersystem", "useGlobalGMIRange"));
      game.socket.emit("system.cyphersystem", {operation: "renderGMIForm"});
      this.render(true);
    });

    html.find(".increase-gmi-range").click(async clickEvent => {
      let mode = $(clickEvent.currentTarget).parents(".item")?.data("itemId");
      let actors = [];
      if (mode == "global") {
        await game.settings.set("cyphersystem", "globalGMIRange", Math.min((game.settings.get("cyphersystem", "globalGMIRange") + 1), 20));
      } else if (mode == "allActors") {
        actors = data.actors;
        await updateActors();
      } else if (mode) {
        actors.push(game.actors.get($(clickEvent.currentTarget).parents(".item")?.data("itemId")));
        await updateActors();
      }
      async function updateActors() {
        for (let actor of actors) {
          let newValue = Math.min(actor.system.basic.gmiRange + 1, 20);
          await actor.update({"system.basic.gmiRange": newValue});
        }
      }
      game.socket.emit("system.cyphersystem", {operation: "renderGMIForm"});
      this.render(true);
    });

    html.find(".decrease-gmi-range").click(async clickEvent => {
      let mode = $(clickEvent.currentTarget).parents(".item")?.data("itemId");
      let actors = [];
      if (mode == "global") {
        await game.settings.set("cyphersystem", "globalGMIRange", Math.max((game.settings.get("cyphersystem", "globalGMIRange") - 1), 1));
      } else if (mode == "allActors") {
        actors = data.actors;
        await updateActors();
      } else if (mode) {
        actors.push(game.actors.get($(clickEvent.currentTarget).parents(".item")?.data("itemId")));
        await updateActors();
      }
      async function updateActors() {
        for (let actor of actors) {
          let newValue = Math.max(actor.system.basic.gmiRange - 1, 1);
          await actor.update({"system.basic.gmiRange": newValue});
        }
      }
      game.socket.emit("system.cyphersystem", {operation: "renderGMIForm"});
      this.render(true);
    });

    html.find(".reset-gmi-range").click(async clickEvent => {
      let mode = $(clickEvent.currentTarget).parents(".item")?.data("itemId");
      let actors = [];
      if (mode == "global") {
        await game.settings.set("cyphersystem", "globalGMIRange", 1);
      } else if (mode == "allActors") {
        actors = data.actors;
        await updateActors();
      } else if (mode) {
        actors.push(game.actors.get($(clickEvent.currentTarget).parents(".item")?.data("itemId")));
        await updateActors();
      }
      async function updateActors() {
        for (let actor of actors) {
          await actor.update({"system.basic.gmiRange": 1});
        }
      }
      game.socket.emit("system.cyphersystem", {operation: "renderGMIForm"});
      this.render(true);
    });
  }
}

// This is used to create a new GMI form, unless there is already one there
export async function gmiRangeForm() {
  // Create gmiRangeForm
  let gmiRangeForm = Object.values(ui.windows).find((app) => app instanceof GMIRangeSheet) || new GMIRangeSheet();

  // Render sheet
  gmiRangeForm.render(true);
}

// This is used to check whether a GMI Range for is already there and re-render it when it is
export async function renderGMIForm() {
  let gmiRangeForm = Object.values(ui.windows).find((app) => app instanceof GMIRangeSheet);

  if (gmiRangeForm) {
    gmiRangeForm.render(true, {focus: false});
  }
}