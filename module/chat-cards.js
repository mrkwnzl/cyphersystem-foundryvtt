export function chatCardMarkItemIdentified(actor, item) {
  let content = game.i18n.format("CYPHERSYSTEM.PCAskingForIdentification", {actor: actor.name}) + `<div style='text-align: right; margin-top: 6px;'><a class='confirm' data-item='${item._id}' data-actor='${actor.id}'><i class="fas fa-check"></i> ${game.i18n.localize("CYPHERSYSTEM.Confirm")}</a></div>`;

  return content
}

export function chatCardProposeIntrusion(selectOptions) {
  let content = `<div align="center"><label style='display: inline-block; text-align: right'><b>${game.i18n.localize("CYPHERSYSTEM.ProposeIntrusionTo")}: </b></label>
  <select name='selectPC' id='selectPC' style='width: auto; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>`+ selectOptions +`</select></div>`;

  return content
}

export function chatCardAskForIntrusion(actor, actorId) {
  let content = game.i18n.format("CYPHERSYSTEM.ProposingIntrusion", {actor: actor.data.name}) + `<div style='text-align: right; margin-top: 6px;'><a class='accept-intrusion' data-actor='${actorId}'><i class="fas fa-check"></i> ${game.i18n.localize("CYPHERSYSTEM.Accept")}</a> | <a class='refuse-intrusion' data-actor='${actorId}'><i class="fas fa-times"></i> ${game.i18n.localize("CYPHERSYSTEM.Refuse")}</a></div>`;

  return content
}

export function chatCardIntrusionAccepted(actor, selectedActorId) {
  let selectedActor = game.actors.get(selectedActorId);
  let content = game.i18n.format("CYPHERSYSTEM.IntrusionAccepted", {actor: actor.data.name, selectedActor: selectedActor.data.name});

  return content
}

export function chatCardIntrusionRefused(actor, selectedActorId) {
  let content = game.i18n.format("CYPHERSYSTEM.IntrusionRefused", {actor: actor.data.name});

  return content
}

export function chatCardWelcomeMessage() {
  let content = "<p style='margin:5px 0 0 0; text-align:center'><b>" + game.i18n.localize("CYPHERSYSTEM.WelcomeMessage") + "</b></p><p style='margin:5px 0 0 0; text-align:center'><a href='https://github.com/mrkwnzl/cyphersystem-foundryvtt/wiki/Getting-Started'>" + game.i18n.localize("CYPHERSYSTEM.GettingStarted") + "</a> | <a href='https://github.com/mrkwnzl/cyphersystem-foundryvtt/wiki'>" + game.i18n.localize("CYPHERSYSTEM.UserManual") + "</a> | <a href='https://github.com/mrkwnzl/cyphersystem-foundryvtt/blob/main/CHANGELOG.md'>Changelog</a></p><p style='margin:5px 0 0 0; text-align:center'><a href='https://discord.gg/C5zGgtyhwa'>" + game.i18n.localize("CYPHERSYSTEM.JoinDiscord") + "</a></p>";

  return content
}
