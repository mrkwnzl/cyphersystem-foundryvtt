import {
  chatCardIntrusionAccepted,
  chatCardIntrusionRefused,
  chatCardRegainPoints
} from "./chat-cards.js";

export async function payPoolPoints(actor, costCalculated, pool, teen, edge) {
  // Determine stats
  let mightValue = (teen) ? actor.system.teen.pools.might.value : actor.system.pools.might.value;
  let speedValue = (teen) ? actor.system.teen.pools.speed.value : actor.system.pools.speed.value;
  let intellectValue = (teen) ? actor.system.teen.pools.intellect.value : actor.system.pools.intellect.value;

  // Determine edge
  if (!edge) {
    let mightEdge = (teen) ? actor.system.teen.pools.might.edge : actor.system.pools.might.edge;
    let speedEdge = (teen) ? actor.system.teen.pools.speed.edge : actor.system.pools.speed.edge;
    let intellectEdge = (teen) ? actor.system.teen.pools.intellect.edge : actor.system.pools.intellect.edge;
    let relevantEdge = {
      "Might": mightEdge,
      "Speed": speedEdge,
      "Intellect": intellectEdge
    };
    edge = (relevantEdge[pool] || 0);
  }

  // Check for weakness
  edge = (edge < 0 && (costCalculated == 0 || costCalculated == "")) ? 0 : edge;

  // Determine costCalculated
  costCalculated = costCalculated - edge;
  if (costCalculated < 0) costCalculated = 0;

  // Check if enough points are avalable and update actor
  if (pool == "Might") {
    if (costCalculated > mightValue) {
      ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.NotEnoughMight"));
      return false;
    }
    (teen) ? actor.update({"system.teen.pools.might.value": mightValue - costCalculated}) : actor.update({"system.pools.might.value": mightValue - costCalculated});
  } else if (pool == "Speed") {
    if (costCalculated > speedValue) {
      ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.NotEnoughSpeed"));
      return false;
    }
    (teen) ? actor.update({"system.teen.pools.speed.value": intellectValue - costCalculated}) : actor.update({"system.pools.speed.value": speedValue - costCalculated});
  } else if (pool == "Intellect") {
    if (costCalculated > intellectValue) {
      ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.NotEnoughIntellect"));
      return false;
    }
    (teen) ? actor.update({"system.teen.pools.intellect.value": intellectValue - costCalculated}) : actor.update({"system.pools.intellect.value": intellectValue - costCalculated});
  } else if (pool == "XP") {
    if (costCalculated > actor.system.basic.xp) {
      ui.notifications.info(game.i18n.localize("CYPHERSYSTEM.NotEnoughXP"));
      return false;
    }
    actor.update({"system.basic.xp": actor.system.basic.xp - costCalculated});
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
    (teen) ? actor.update({"system.teen.pools.might.value": mightValue + cost}) : actor.update({"system.pools.might.value": mightValue + cost});
  } else if (pool == "speed") {
    (teen) ? actor.update({"system.teen.pools.speed.value": intellectValue + cost}) : actor.update({"system.pools.speed.value": speedValue + cost});
  } else if (pool == "intellect") {
    (teen) ? actor.update({"system.teen.pools.intellect.value": intellectValue + cost}) : actor.update({"system.pools.intellect.value": intellectValue + cost});
  }

  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({actor: actor}),
    content: chatCardRegainPoints(actor, cost, pool, teen)
  });
}

export function useRecoveries(actor, spell) {
  if (!spell) spell = false;
  let recoveries = actor.system.combat.recoveries;
  let additionalRecoveries = actor.system.settings.combat;
  let recoveryUsed = "";

  if (!recoveries.oneAction && additionalRecoveries.numberOneActionRecoveries >= 1) {
    actor.update({"system.combat.recoveries.oneAction": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneAction2 && additionalRecoveries.numberOneActionRecoveries >= 2) {
    actor.update({"system.combat.recoveries.oneAction2": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneAction3 && additionalRecoveries.numberOneActionRecoveries >= 3) {
    actor.update({"system.combat.recoveries.oneAction3": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneAction4 && additionalRecoveries.numberOneActionRecoveries >= 4) {
    actor.update({"system.combat.recoveries.oneAction4": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneAction5 && additionalRecoveries.numberOneActionRecoveries >= 5) {
    actor.update({"system.combat.recoveries.oneAction5": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneAction6 && additionalRecoveries.numberOneActionRecoveries >= 6) {
    actor.update({"system.combat.recoveries.oneAction6": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.oneAction7 && additionalRecoveries.numberOneActionRecoveries >= 7) {
    actor.update({"system.combat.recoveries.oneAction7": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneAction");
  } else if (!recoveries.tenMinutes && additionalRecoveries.numberTenMinuteRecoveries >= 1) {
    actor.update({"system.combat.recoveries.tenMinutes": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryTenMinutes");
  } else if (!recoveries.tenMinutes2 && additionalRecoveries.numberTenMinuteRecoveries >= 2) {
    actor.update({"system.combat.recoveries.tenMinutes2": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryTenMinutes");
  } else if (!recoveries.oneHour) {
    actor.update({"system.combat.recoveries.oneHour": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryOneHour");
  } else if (!recoveries.tenHours && !spell) {
    actor.update({"system.combat.recoveries.tenHours": true});
    recoveryUsed = game.i18n.localize("CYPHERSYSTEM.RecoveryTenHours");
  } else {
    ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.NoRecoveriesLeft", {name: actor.name}));
    return;
  }
  return recoveryUsed;
}

export function isExclusiveTagActive(actor) {
  let exclusiveTagName = "";
  for (let item of actor.items) {
    if (item.type == "tag" && item.system.exclusive && item.system.active) exclusiveTagName = item.name;
    if (exclusiveTagName) break;
  }
  return exclusiveTagName;;
}

export function deleteChatMessage(data) {
  if (game.user.isGM) game.messages.get(data.messageId).delete();
}

// Function to apply XP when an intrusion is accepted
export function applyXPFromIntrusion(actor, selectedActorId, messageId, modifier) {
  actor.update({"system.basic.xp": actor.system.basic.xp + modifier});

  // Emit a socket event
  if (selectedActorId) {
    if (!game.user.isGM) {
      game.socket.emit('system.cyphersystem', {operation: 'giveAdditionalXP', selectedActorId: selectedActorId, modifier: modifier});
      game.socket.emit('system.cyphersystem', {operation: 'deleteChatMessage', messageId: messageId});
    } else {
      giveAdditionalXP({selectedActorId: selectedActorId, modifier: modifier});
      deleteChatMessage({messageId: messageId});
    }
  } else if (!selectedActorId) {
    if (!game.user.isGM) {
      game.socket.emit('system.cyphersystem', {operation: 'deleteChatMessage', messageId: messageId});
    } else {
      deleteChatMessage({messageId: messageId});
    }
  }

  let content = (modifier == 1) ? chatCardIntrusionAccepted(actor, selectedActorId) : chatCardIntrusionRefused(actor, selectedActorId);

  ChatMessage.create({
    content: content
  });
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