import { chatCardWelcomeMessage } from "./chat-cards.js";

export function sendWelcomeMessage() {
  ChatMessage.create({
    content: chatCardWelcomeMessage()
  })
}