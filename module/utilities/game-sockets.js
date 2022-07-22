import {deleteChatMessage, giveAdditionalXP} from "./actor-utilities.js";

export function gameSockets() {
  game.socket.on('system.cyphersystem', (data) => {
    if (data.operation === 'deleteChatMessage') deleteChatMessage(data);
    if (data.operation === 'giveAdditionalXP') giveAdditionalXP(data);
  });
}