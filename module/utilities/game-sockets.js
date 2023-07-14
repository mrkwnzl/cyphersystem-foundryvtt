import {renderGMIForm} from "../forms/gmi-range-sheet.js";
import {updateRollDifficultyForm} from "../forms/roll-difficulty-sheet.js";
import {deleteChatMessage, giveAdditionalXP} from "./actor-utilities.js";

export function gameSockets() {
  game.socket.on("system.cyphersystem", (data) => {
    if (data.operation === "deleteChatMessage") deleteChatMessage(data);
    if (data.operation === "giveAdditionalXP") giveAdditionalXP(data);
    if (data.operation === "renderGMIForm") renderGMIForm();
    if (data.operation === "updateRollDifficultyForm") updateRollDifficultyForm();
  });
}