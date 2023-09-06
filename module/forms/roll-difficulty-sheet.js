/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {FormApplication}
*/

export class RollDifficultySheet extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "gmi-form"],
      template: "systems/cyphersystem/templates/forms/roll-difficulty-sheet.html",
      title: game.i18n.localize("CYPHERSYSTEM.DifficultyControlPanel"),
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: false,
      width: 300,
      height: "auto",
      top: 71,
      left: 110,
      resizable: false
    });
  }

  getData() {
    // Basic data
    const data = super.getData().object;

    data.rollDifficulty = game.settings.get("cyphersystem", "rollDifficulty");
    data.targetNumber = parseInt(data.rollDifficulty) * 3;
    data.persistentRollDifficulty = game.settings.get("cyphersystem", "persistentRollDifficulty");
    data.difficultyNPCInitiative = game.settings.get("cyphersystem", "difficultyNPCInitiative");
    data.isGM = game.user.isGM;

    // Return data
    return data;
  }

  /**
  * Event listeners for roll engine dialog sheets
  */
  activateListeners(html) {
    super.activateListeners(html);

    let data = this.object;

    html.find('.toggle-persistent-roll-difficulty').click(async clickEvent => {
      let lastChatMessage = game.messages.contents[game.messages.contents.length - 1];
      html.find("ol#chat-log .note-roll-dialog").last().addClass("hidden");
      await game.settings.set("cyphersystem", "persistentRollDifficulty", !game.settings.get("cyphersystem", "persistentRollDifficulty"));
      game.socket.emit("system.cyphersystem", {operation: "updateRollDifficultyForm"});
      this.render(true);
    });

    html.find('.toggle-difficulty-npc-initiative').click(async clickEvent => {
      await game.settings.set("cyphersystem", "difficultyNPCInitiative", !game.settings.get("cyphersystem", "difficultyNPCInitiative"));
      game.socket.emit("system.cyphersystem", {operation: "updateRollDifficultyForm"});
      this.render(true);
    });

    html.find(".increase-roll-difficulty").click(async clickEvent => {
      await game.settings.set("cyphersystem", "rollDifficulty", Math.min((game.settings.get("cyphersystem", "rollDifficulty") + 1), 15));
      game.socket.emit("system.cyphersystem", {operation: "updateRollDifficultyForm"});
      this.render(true);
    });

    html.find(".decrease-roll-difficulty").click(async clickEvent => {
      await game.settings.set("cyphersystem", "rollDifficulty", Math.max((game.settings.get("cyphersystem", "rollDifficulty") - 1), -1));
      game.socket.emit("system.cyphersystem", {operation: "updateRollDifficultyForm"});
      this.render(true);
    });

    html.find(".reset-roll-difficulty").click(async clickEvent => {
      await game.settings.set("cyphersystem", "rollDifficulty", -1);
      game.socket.emit("system.cyphersystem", {operation: "updateRollDifficultyForm"});
      this.render(true);
    });
  }
}

// This is used to create a new RollDifficulty form, unless there is already one there
export async function renderRollDifficultyForm() {
  // Create rollDifficultyForm
  let rollDifficultyForm = Object.values(ui.windows).find((app) => app instanceof RollDifficultySheet) || new RollDifficultySheet();

  // Render sheet
  rollDifficultyForm.render(true);
}

// This is used to check whether a GMI Range for is already there and re-render it when it is
export async function updateRollDifficultyForm() {
  let rollDifficultyForm = Object.values(ui.windows).find((app) => app instanceof RollDifficultySheet);

  if (rollDifficultyForm) {
    rollDifficultyForm.render(true, {focus: false});
  }
}