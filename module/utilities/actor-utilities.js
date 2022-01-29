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