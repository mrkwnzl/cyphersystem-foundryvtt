import {renderGMIForm} from "../forms/gmi-range-sheet.js";
import {updateRollDifficultyForm} from "../forms/roll-difficulty-sheet.js";
import {executeMacroAsGM} from "../macros/macros-scripting.js";
import {deleteChatMessage, giveAdditionalXP} from "./actor-utilities.js";
import {resetDifficulty} from "./roll-engine/roll-engine-main.js";
import {notifyAboutGMI} from "../macros/macros.js";

export function gameSockets() {
  game.socket.on("system.cyphersystem", (data) => {
    if (data.operation === "deleteChatMessage") deleteChatMessage(data);
    if (data.operation === "giveAdditionalXP") giveAdditionalXP(data);
    if (data.operation === "renderGMIForm") renderGMIForm();
    if (data.operation === "notifyAboutGMI") notifyAboutGMI(data.actorId, data.notification);
    if (data.operation === "updateRollDifficultyForm") updateRollDifficultyForm();
    if (data.operation === "resetDifficulty") resetDifficulty();
    if (data.operation === "executeMacroAsGM") executeMacroAsGM(data.macroUuid, data.rollData);
  });
}
