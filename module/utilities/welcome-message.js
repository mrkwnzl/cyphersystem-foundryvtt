import {chatCardWelcomeMessage} from "./chat-cards.js";

export function sendWelcomeMessage() {
  if (game.user.isGM && game.settings.get("cyphersystem", "welcomeMessage")) {
    ChatMessage.create({
      content: chatCardWelcomeMessage()
    });
    game.settings.set("cyphersystem", "welcomeMessage", false);
  }
}