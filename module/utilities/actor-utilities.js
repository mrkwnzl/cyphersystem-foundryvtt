import {
  chatCardIntrusionAccepted,
  chatCardIntrusionRefused
} from "./chat-cards.js";

export async function payPoolPoints(actor, costCalculated, pool, teen) {
  // Determine stats
  let mightValue = (teen) ? actor.data.data.teen.pools.might.value : actor.data.data.pools.might.value;
  let mightEdge = (teen) ? actor.data.data.teen.pools.mightEdge : actor.data.data.pools.mightEdge;
  let speedValue = (teen) ? actor.data.data.teen.pools.speed.value : actor.data.data.pools.speed.value;
  let speedEdge = (teen) ? actor.data.data.teen.pools.speedEdge : actor.data.data.pools.speedEdge;
  let intellectValue = (teen) ? actor.data.data.teen.pools.intellect.value : actor.data.data.pools.intellect.value;
  let intellectEdge = (teen) ? actor.data.data.teen.pools.intellectEdge : actor.data.data.pools.intellectEdge;

  // Determine edge
  let relevantEdge = {
    "Might": mightEdge,
    "Speed": speedEdge,
    "Intellect": intellectEdge
  };
  let edge = (relevantEdge[pool] || 0);

  // Check for weakness
  edge = (edge < 0 && (costCalculated == 0 || costCalculated == "")) ? 0 : edge;

  // Determine costCalculated
  costCalculated = costCalculated - edge;
  if (costCalculated < 0) costCalculated = 0;

  // Check if enough points are avalable and update actor
  if (pool == "Might") {
    if (costCalculated > mightValue) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughMight"));
      return false;
    }
    (teen) ? actor.update({ "data.teen.pools.might.value": mightValue - costCalculated }) : actor.update({ "data.pools.might.value": mightValue - costCalculated })
  } else if (pool == "Speed") {
    if (costCalculated > speedValue) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughSpeed"));
      return false;
    }
    (teen) ? actor.update({ "data.teen.pools.speed.value": intellectValue - costCalculated }) : actor.update({ "data.pools.speed.value": speedValue - costCalculated })
  } else if (pool == "Intellect") {
    if (costCalculated > intellectValue) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughIntellect"));
      return false;
    }
    (teen) ? actor.update({ "data.teen.pools.intellect.value": intellectValue - costCalculated }) : actor.update({ "data.pools.intellect.value": intellectValue - costCalculated })
  } else if (pool == "XP") {
    if (costCalculated > actor.data.data.basic.xp) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughXP"));
      return false;
    }
    actor.update({ "data.basic.xp": actor.data.data.basic.xp - costCalculated })
  }

  let payPoolPointsInfo = [true, costCalculated, edge, pool];
  return payPoolPointsInfo;
}

export async function regainPoolPoints(actor, cost, pool, teen) {
  pool = pool.toLowerCase();

  // Determine stats
  let mightValue = (teen) ? actor.data.data.teen.pools.might.value : actor.data.data.pools.might.value;
  let speedValue = (teen) ? actor.data.data.teen.pools.speed.value : actor.data.data.pools.speed.value;
  let intellectValue = (teen) ? actor.data.data.teen.pools.intellect.value : actor.data.data.pools.intellect.value;

  // Return points
  if (pool == "might") {
    (teen) ? actor.update({ "data.teen.pools.might.value": mightValue + cost }) : actor.update({ "data.pools.might.value": mightValue + cost })
  } else if (pool == "speed") {
    (teen) ? actor.update({ "data.teen.pools.speed.value": intellectValue + cost }) : actor.update({ "data.pools.speed.value": speedValue + cost })
  } else if (pool == "intellect") {
    (teen) ? actor.update({ "data.teen.pools.intellect.value": intellectValue + cost }) : actor.update({ "data.pools.intellect.value": intellectValue + cost })
  }

  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: chatCardRegainPoints(actor, cost, pool)
  })
}

export function useRecoveries(actor, spell) {
  if (!spell) spell = false;
  let recoveries = actor.data.data.recoveries;
  let additionalRecoveries = actor.data.data.settings.additionalRecoveries;
  let recoveryUsed = "";

  if (!recoveries.oneAction) {
    actor.update({ "data.recoveries.oneAction": true });
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneActionTwo && additionalRecoveries.numberOneActionRecoveries >= 2) {
    actor.update({ "data.recoveries.oneActionTwo": true });
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneActionThree && additionalRecoveries.numberOneActionRecoveries >= 3) {
    actor.update({ "data.recoveries.oneActionThree": true });
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneActionFour && additionalRecoveries.numberOneActionRecoveries >= 4) {
    actor.update({ "data.recoveries.oneActionFour": true });
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneActionFive && additionalRecoveries.numberOneActionRecoveries >= 5) {
    actor.update({ "data.recoveries.oneActionFive": true });
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneActionSix && additionalRecoveries.numberOneActionRecoveries >= 6) {
    actor.update({ "data.recoveries.oneActionSix": true });
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneActionSeven && additionalRecoveries.numberOneActionRecoveries >= 7) {
    actor.update({ "data.recoveries.oneActionSeven": true });
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.tenMinutes && additionalRecoveries.numberTenMinuteRecoveries >= 1) {
    actor.update({ "data.recoveries.tenMinutes": true });
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryTenMinutes");
  } else if (!recoveries.tenMinutesTwo && additionalRecoveries.numberTenMinuteRecoveries >= 2) {
    actor.update({ "data.recoveries.tenMinutesTwo": true });
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryTenMinutes");
  } else if (!recoveries.oneHour) {
    actor.update({ "data.recoveries.oneHour": true });
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneHour");
  } else if (!recoveries.tenHours && spell == false) {
    actor.update({ "data.recoveries.tenHours": true });
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryTenHours");
  } else {
    return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.NoRecoveriesLeft", { name: actor.name }));
  }

  return recoveryUsed;
}

export function isExclusiveTagActive(actor) {
  let countExclusiveTags = 0;
  for (let item of actor.items) {
    if (item.type == "tag" && item.data.data.exclusive && item.data.data.active) countExclusiveTags++;
  }
  return (countExclusiveTags > 0) ? true : false;
}

export function deleteChatMessage(data) {
  if (game.user.isGM) game.messages.get(data.messageId).delete();
}

// Function to apply XP when an intrusion is accepted
export function applyXPFromIntrusion(actor, selectedActorId, messageId, modifier) {
  actor.update({ "data.basic.xp": actor.data.data.basic.xp + modifier });

  // Emit a socket event
  game.socket.emit('system.cyphersystem', { operation: 'giveAdditionalXP', selectedActorId: selectedActorId, modifier: modifier });
  game.socket.emit('system.cyphersystem', { operation: 'deleteChatMessage', messageId: messageId });

  let content = (modifier == 1) ? chatCardIntrusionAccepted(actor, selectedActorId) : chatCardIntrusionRefused(actor, selectedActorId);

  ChatMessage.create({
    content: content
  })
}

export function giveAdditionalXP(data) {
  if (game.user.isGM) {
    let selectedActor = game.actors.get(data.selectedActorId);
    selectedActor.update({ "data.basic.xp": selectedActor.data.data.basic.xp + data.modifier });
  }
}

export async function addCharacterToCombatTracker(actor) {
  for (let token of canvas.tokens.objects.children) {
    if (token.actor.id == actor.id && !token.inCombat) {
      await token.toggleCombat();
    }
  }
}

export async function setInitiativeForCharacter(actor, initiative) {
  for (let combatant of game.combat.combatants) {
    if (combatant.actor.id == actor.id) {
      await game.combat.setInitiative(combatant.id, initiative);
    }
  }
}