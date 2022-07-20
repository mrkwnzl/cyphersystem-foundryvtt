import {
  chatCardIntrusionAccepted,
  chatCardIntrusionRefused,
  chatCardRegainPoints
} from "./chat-cards.js";

export async function payPoolPoints(actor, costCalculated, pool, teen) {
  // Determine stats
  let mightValue = (teen) ? actor.system.teen.pools.might.value : actor.system.pools.might.value;
  let mightEdge = (teen) ? actor.system.teen.pools.mightEdge : actor.system.pools.mightEdge;
  let speedValue = (teen) ? actor.system.teen.pools.speed.value : actor.system.pools.speed.value;
  let speedEdge = (teen) ? actor.system.teen.pools.speedEdge : actor.system.pools.speedEdge;
  let intellectValue = (teen) ? actor.system.teen.pools.intellect.value : actor.system.pools.intellect.value;
  let intellectEdge = (teen) ? actor.system.teen.pools.intellectEdge : actor.system.pools.intellectEdge;

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
    (teen) ? actor.update({"system.teen.pools.might.value": mightValue - costCalculated}) : actor.update({"system.pools.might.value": mightValue - costCalculated})
  } else if (pool == "Speed") {
    if (costCalculated > speedValue) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughSpeed"));
      return false;
    }
    (teen) ? actor.update({"system.teen.pools.speed.value": intellectValue - costCalculated}) : actor.update({"system.pools.speed.value": speedValue - costCalculated})
  } else if (pool == "Intellect") {
    if (costCalculated > intellectValue) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughIntellect"));
      return false;
    }
    (teen) ? actor.update({"system.teen.pools.intellect.value": intellectValue - costCalculated}) : actor.update({"system.pools.intellect.value": intellectValue - costCalculated})
  } else if (pool == "XP") {
    if (costCalculated > actor.system.basic.xp) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughXP"));
      return false;
    }
    actor.update({"system.basic.xp": actor.system.basic.xp - costCalculated})
  }

  let payPoolPointsInfo = [true, costCalculated, edge, pool];
  return payPoolPointsInfo;
}

export async function regainPoolPoints(actor, cost, pool, teen) {
  pool = pool.toLowerCase();

  // Determine stats
  let mightValue = (teen) ? actor.system.teen.pools.might.value : actor.system.pools.might.value;
  let speedValue = (teen) ? actor.system.teen.pools.speed.value : actor.system.pools.speed.value;
  let intellectValue = (teen) ? actor.system.teen.pools.intellect.value : actor.system.pools.intellect.value;

  // Return points
  if (pool == "might") {
    (teen) ? actor.update({"system.teen.pools.might.value": mightValue + cost}) : actor.update({"system.pools.might.value": mightValue + cost})
  } else if (pool == "speed") {
    (teen) ? actor.update({"system.teen.pools.speed.value": intellectValue + cost}) : actor.update({"system.pools.speed.value": speedValue + cost})
  } else if (pool == "intellect") {
    (teen) ? actor.update({"system.teen.pools.intellect.value": intellectValue + cost}) : actor.update({"system.pools.intellect.value": intellectValue + cost})
  }

  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({actor: actor}),
    content: chatCardRegainPoints(actor, cost, pool)
  })
}

export function useRecoveries(actor, spell) {
  if (!spell) spell = false;
  let recoveries = actor.system.recoveries;
  let additionalRecoveries = actor.system.settings.additionalRecoveries;
  let recoveryUsed = "";

  if (!recoveries.oneAction) {
    actor.update({"system.recoveries.oneAction": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneActionTwo && additionalRecoveries.numberOneActionRecoveries >= 2) {
    actor.update({"system.recoveries.oneActionTwo": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneActionThree && additionalRecoveries.numberOneActionRecoveries >= 3) {
    actor.update({"system.recoveries.oneActionThree": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneActionFour && additionalRecoveries.numberOneActionRecoveries >= 4) {
    actor.update({"system.recoveries.oneActionFour": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneActionFive && additionalRecoveries.numberOneActionRecoveries >= 5) {
    actor.update({"system.recoveries.oneActionFive": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneActionSix && additionalRecoveries.numberOneActionRecoveries >= 6) {
    actor.update({"system.recoveries.oneActionSix": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneActionSeven && additionalRecoveries.numberOneActionRecoveries >= 7) {
    actor.update({"system.recoveries.oneActionSeven": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.tenMinutes && additionalRecoveries.numberTenMinuteRecoveries >= 1) {
    actor.update({"system.recoveries.tenMinutes": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryTenMinutes");
  } else if (!recoveries.tenMinutesTwo && additionalRecoveries.numberTenMinuteRecoveries >= 2) {
    actor.update({"system.recoveries.tenMinutesTwo": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryTenMinutes");
  } else if (!recoveries.oneHour) {
    actor.update({"system.recoveries.oneHour": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneHour");
  } else if (!recoveries.tenHours && spell == false) {
    actor.update({"system.recoveries.tenHours": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryTenHours");
  } else {
    return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.NoRecoveriesLeft", {name: actor.name}));
  }

  return recoveryUsed;
}

export function isExclusiveTagActive(actor) {
  let countExclusiveTags = 0;
  for (let item of actor.items) {
    if (item.type == "tag" && item.system.exclusive && item.system.active) countExclusiveTags++;
  }
  return (countExclusiveTags > 0) ? true : false;
}

export function deleteChatMessage(data) {
  if (game.user.isGM) game.messages.get(data.messageId).delete();
}

// Function to apply XP when an intrusion is accepted
export function applyXPFromIntrusion(actor, selectedActorId, messageId, modifier) {
  actor.update({"system.basic.xp": actor.system.basic.xp + modifier});

  // Emit a socket event
  game.socket.emit('system.cyphersystem', {operation: 'giveAdditionalXP', selectedActorId: selectedActorId, modifier: modifier});
  game.socket.emit('system.cyphersystem', {operation: 'deleteChatMessage', messageId: messageId});

  let content = (modifier == 1) ? chatCardIntrusionAccepted(actor, selectedActorId) : chatCardIntrusionRefused(actor, selectedActorId);

  ChatMessage.create({
    content: content
  })
}

export function giveAdditionalXP(data) {
  if (game.user.isGM) {
    let selectedActor = game.actors.get(data.selectedActorId);
    selectedActor.update({"system.basic.xp": selectedActor.system.basic.xp + data.modifier});
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