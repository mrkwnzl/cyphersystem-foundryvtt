/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ApplicationV2}
*/
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class GMIRangeSheet extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    tag: 'form',
    classes: ["cyphersystem", "gmi-form"],
    position: {
      width: 300,
      top: 235,
      left: 110,
    },
    window: {
      title: "CYPHERSYSTEM.GMIRange",
      resizable: false
    },
    form: {
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: false,
    },
    actions: {
      toggleGlobalRange: this.#toggleGlobalGmiRange,
      incRange: this.#increaseGmiRange,
      decRange: this.#decreaseGmiRange,
      resetRange: this.#resetGmiRange,
    }
  }

  static PARTS = {
    form: {
      template: "systems/cyphersystem/templates/forms/gmi-range-sheet.html",
    }
  }

  async _prepareContext(options) {
    // Basic data
    const context = await super._prepareContext(options)

    context.globalGMIRange = game.settings.get("cyphersystem", "globalGMIRange");
    context.useGlobalGMIRange = game.settings.get("cyphersystem", "useGlobalGMIRange");
    context.isGM = game.user.isGM;
    this.actors = context.actors = [];
    for (let actor of game.actors) {
      if (actor.type == "pc" && actor.hasPlayerOwner) {
        context.actors.push(actor);
      }
    }

    // Return data
    return context;
  }

  /**
  * Event listeners for roll engine dialog sheets
  */

  static async #toggleGlobalGmiRange(event, target) {
    await game.settings.set("cyphersystem", "useGlobalGMIRange", !game.settings.get("cyphersystem", "useGlobalGMIRange"));
    game.socket.emit("system.cyphersystem", { operation: "renderGMIForm" });
    this.render(true);
  }

  static async #increaseGmiRange(event, target) {
    let mode = target.closest(".item").dataset.itemId;
    let actors = [];
    if (mode == "global") {
      await game.settings.set("cyphersystem", "globalGMIRange", Math.min((game.settings.get("cyphersystem", "globalGMIRange") + 1), 20));
    } else if (mode == "allActors") {
      actors = this.actors;
      await updateActors();
    } else if (mode) {
      actors.push(game.actors.get(mode));
      await updateActors();
    }
    async function updateActors() {
      for (const actor of actors) {
        let newValue = Math.min(actor.system.basic.gmiRange + 1, 20);
        await actor.update({ "system.basic.gmiRange": newValue });
      }
    }
    game.socket.emit("system.cyphersystem", { operation: "renderGMIForm" });
    this.render(true);
  }

  static async #decreaseGmiRange(event, target) {
    let mode = target.closest(".item").dataset.itemId;
    let actors = [];
    if (mode == "global") {
      await game.settings.set("cyphersystem", "globalGMIRange", Math.max((game.settings.get("cyphersystem", "globalGMIRange") - 1), 1));
    } else if (mode == "allActors") {
      actors = this.actors;
      await updateActors();
    } else if (mode) {
      actors.push(game.actors.get(mode));
      await updateActors();
    }
    async function updateActors() {
      for (let actor of actors) {
        let newValue = Math.max(actor.system.basic.gmiRange - 1, 1);
        await actor.update({ "system.basic.gmiRange": newValue });
      }
    }
    game.socket.emit("system.cyphersystem", { operation: "renderGMIForm" });
    this.render(true);
  }

  static async #resetGmiRange(event, target) {
    let mode = target.closest(".item").dataset.itemId;
    let actors = [];
    if (mode == "global") {
      await game.settings.set("cyphersystem", "globalGMIRange", 1);
    } else if (mode == "allActors") {
      actors = this.actors;
      await updateActors();
    } else if (mode) {
      actors.push(game.actors.get(target.closest(".item").dataset.itemId));
      await updateActors();
    }
    async function updateActors() {
      for (let actor of actors) {
        await actor.update({ "system.basic.gmiRange": 1 });
      }
    }
    game.socket.emit("system.cyphersystem", { operation: "renderGMIForm" });
    this.render(true);
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
    gmiRangeForm.render(true, { focus: false });
  }
}