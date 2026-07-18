/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {ApplicationV2}
*/
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api

export class RollDifficultySheet extends HandlebarsApplicationMixin(ApplicationV2) {
  /** @override */

  static DEFAULT_OPTIONS = {
    classes: ["cyphersystem", "sheet", "gmi-form"],
    position: {
      width: 300,
      top: 71,
      left: 110,
    },
    window: {
      title: "CYPHERSYSTEM.DifficultyControlPanel",
      resizable: false,
    },
    form: {
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: false,
    },
    actions: {
      togglePersistent: this.#togglePersistentRollDifficulty,
      toggleNpc: this.#toggleDifficultyNpcInitiative,
      incDifficulty: this.#increaseRollDifficulty,
      decDifficulty: this.#decreaseRollDifficulty,
      resetDifficulty: this.#resetRollDifficulty,
    }
  }

  static PARTS = {
    form: {
      template: "systems/cyphersystem/templates/forms/roll-difficulty-sheet.html",
    }
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options)
    // Basic data
    context.rollDifficulty = game.settings.get("cyphersystem", "rollDifficulty");
    context.targetNumber = parseInt(context.rollDifficulty) * 3;
    context.persistentRollDifficulty = game.settings.get("cyphersystem", "persistentRollDifficulty");
    context.difficultyNPCInitiative = game.settings.get("cyphersystem", "difficultyNPCInitiative");
    context.isGM = game.user.isGM;

    // Return data
    return context;
  }

  /**
  * Event listeners for roll engine dialog sheets
  */

  static async #togglePersistentRollDifficulty(event, button) {
    const notes = this.element.querySelectorAll("ol#chat-log .note-roll-dialog");
    if (notes.length) notes[notes.length-1].classList.add("hidden");
    await game.settings.set("cyphersystem", "persistentRollDifficulty", !game.settings.get("cyphersystem", "persistentRollDifficulty"));
    game.socket.emit("system.cyphersystem", { operation: "updateRollDifficultyForm" });
    this.render(true);
  }

  static async #toggleDifficultyNpcInitiative(event, button) {
    await game.settings.set("cyphersystem", "difficultyNPCInitiative", !game.settings.get("cyphersystem", "difficultyNPCInitiative"));
    game.socket.emit("system.cyphersystem", { operation: "updateRollDifficultyForm" });
    this.render(true);
  }

  static async #increaseRollDifficulty(event, button) {
    await game.settings.set("cyphersystem", "rollDifficulty", Math.min((game.settings.get("cyphersystem", "rollDifficulty") + 1), 15));
    game.socket.emit("system.cyphersystem", { operation: "updateRollDifficultyForm" });
    this.render(true);
  }

  static async #decreaseRollDifficulty(event, button) {
    await game.settings.set("cyphersystem", "rollDifficulty", Math.max((game.settings.get("cyphersystem", "rollDifficulty") - 1), -1));
    game.socket.emit("system.cyphersystem", { operation: "updateRollDifficultyForm" });
    this.render(true);
  }

  static async #resetRollDifficulty(event, button) {
    await game.settings.set("cyphersystem", "rollDifficulty", -1);
    game.socket.emit("system.cyphersystem", { operation: "updateRollDifficultyForm" });
    this.render(true);
  }
}

// This is used to create a new RollDifficulty form, unless there is already one there
export async function renderRollDifficultyForm() {
  // Create rollDifficultyForm
  let rollDifficultyForm = foundry.applications.instances.values().find((app) => app instanceof RollDifficultySheet) || new RollDifficultySheet();

  // Render sheet
  rollDifficultyForm.render(true);
}

// This is used to check whether a GMI Range for is already there and re-render it when it is
export async function updateRollDifficultyForm() {
  let rollDifficultyForm = foundry.applications.instances.values().find((app) => app instanceof RollDifficultySheet);

  if (rollDifficultyForm) {
    rollDifficultyForm.render(true, { focus: false });
  }
}