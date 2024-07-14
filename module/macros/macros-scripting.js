export function useAmmo(ammoUuid, quantity, rollData) {
  if (rollData.reroll) return;

  // Get actor
  let actor = fromUuidSync(rollData.actorUuid);

  // Get macro
  let macro = fromUuidSync(rollData.macroUuid);

  // Get ammo
  let ammo = fromUuidSync(ammoUuid);
  if (ammo.type != "ammo") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.NotAmmo"));

  // Calculate new quantity
  let ammoQuantity = ammo.system.basic.quantity - quantity;

  // Update ammo
  if ((ammoQuantity) >= 0) {
    ammo.update({"system.basic.quantity": ammoQuantity});
  }

  // Notify about low ammo
  if (ammoQuantity < quantity) {
    ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NoAmmo"));
  }

  // Send chat message
  let info = `<div class="roll-result-box">` + game.i18n.format("CYPHERSYSTEM.AmmoLeft", {name: ammo.name, quantity: ammoQuantity}) + `</div>`;
  ChatMessage.create({
    content: "<div class='roll-flavor'><div class='roll-result-box'><b>" + macro.name + "</b></div><hr class='roll-result-hr'>" + info + "</div>",
    speaker: ChatMessage.getSpeaker({actor: actor})
  });

}

export async function payCostWithAdditionalPool(cost, useEdge, rollData) {
  // Check for right pool
  if (rollData.pool != "Pool") return;

  // Get actor
  let actor = await fromUuid(rollData.actorUuid);

  // Get macro
  let macro = await fromUuid(rollData.macroUuid);

  // Get fourth pool
  if (!actor.system.settings.general.additionalPool.active) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.FourthPoolNotActive"));
  if (!actor.system.settings.general.additionalPool.hasEdge) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.FourthPoolNoEdge"));
  let fourthPool = actor.system.pools.additional;
  let fourthPoolLabel = actor.system.settings.general.additionalPool.label || "Luck";

  // Calculate cost
  let edge = (useEdge) ? fourthPool.edge : 0;
  let baseCost = (cost === false) ? rollData.poolPointCost : cost;
  let totalCost = Math.max(0, baseCost - edge);
  let newValue = fourthPool.value - totalCost;

  // Subtract from actor
  if (newValue < 0) return ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.NotEnoughPoint", {pool: fourthPoolLabel}));
  await actor.update({"system.pools.additional.value": newValue});

  // Send chat message
  let costTotalInfoString = (totalCost == 1) ?
    game.i18n.format("CYPHERSYSTEM.CostTotalFourthPoolPoint", {totalCost: totalCost, label: fourthPoolLabel}) :
    game.i18n.format("CYPHERSYSTEM.CostTotalFourthPoolPoints", {totalCost: totalCost, label: fourthPoolLabel});

  let baseCostInfoString = (cost == 1) ?
    game.i18n.format("CYPHERSYSTEM.FourthPoolBaseCostPoint", {baseCost: baseCost}) :
    game.i18n.format("CYPHERSYSTEM.FourthPoolBaseCostPoints", {baseCost: baseCost});

  let edgeString = (useEdge) ?
    "<br>" + game.i18n.localize("CYPHERSYSTEM.Edge") + ": " + fourthPool.edge :
    "";

  let costDetailsInfo = `<div class="roll-result-cost-details" style="display: none">` + baseCostInfoString + edgeString + `</div>`;

  let info = `<div class="roll-result-box"><b><a class="roll-result-cost">` + costTotalInfoString + `</a></b>` + costDetailsInfo + `</div>`;

  ChatMessage.create({
    content: "<div class='roll-flavor'><div class='roll-result-box'><b>" + macro.name + "</b></div><hr class='roll-result-hr'>" + info + "</div>",
    speaker: ChatMessage.getSpeaker({actor: actor})
  });
}

export async function executeSeriesOfMacros(macroUuids, rollData) {
  for (let macroUuid of macroUuids) {
    let macro = await fromUuid(macroUuid);
    if (!macro) return;
    await macro.execute({"rollData": rollData});
  }
}

export async function payXP(quantity, rollData) {
  // Get actor
  let actor = await fromUuid(rollData.actorUuid);

  // Get macro
  let macro = fromUuidSync(rollData.macroUuid);

  // Notify about low XP
  if (actor.system.basic.xp < quantity) {
    return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.NotEnoughXP"));
  }

  // Calculate new quantity
  let xp = actor.system.basic.xp - quantity;

  // Update actor
  await actor.update({"system.basic.xp": xp});

  // Send chat message
  let info = `<div class="roll-result-box">` + game.i18n.format("CYPHERSYSTEM.XPLeft", {quantity: xp}) + `</div>`;
  ChatMessage.create({
    content: "<div class='roll-flavor'><div class='roll-result-box'><b>" + macro.name + "</b></div><hr class='roll-result-hr'>" + info + "</div>",
    speaker: ChatMessage.getSpeaker({actor: actor})
  });
}

export async function changePortraitAndToken(imagePath, data) {
  // Get actor
  let actor = await fromUuid(data.actorUuid);

  // Update actor
  await actor.update({
    "img": imagePath,
    "prototypeToken.texture.src": imagePath
  });
}

export async function executeMacroAsGM(macroUuid, rollData) {
  if (game.user.isGM) {
    // Get macro
    let macro = await fromUuid(macroUuid);

    // Execute macro
    await macro.execute({"rollData": rollData});
  }
}