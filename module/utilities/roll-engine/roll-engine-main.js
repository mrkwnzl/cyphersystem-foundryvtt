import {rollEngineComputation} from "./roll-engine-computation.js";
import {rollEngineForm} from "./roll-engine-form.js";

export async function rollEngineMain(data) {
  data = Object.assign({
    actorUuid: undefined,
    itemID: "",
    teen: undefined,
    skipDialog: !game.settings.get("cyphersystem", "itemMacrosUseAllInOne"),
    skipRoll: false,
    initiativeRoll: false,
    reroll: false,
    gmiRange: undefined,
    title: "",
    baseDifficulty: "none",
    pool: "Pool",
    skillLevel: 0,
    assets: 0,
    effortToEase: 0,
    effortOtherUses: 0,
    damage: 0,
    effortDamage: 0,
    damagePerLOE: 0,
    difficultyModifier: 0,
    easedOrHindered: "eased",
    bonus: 0,
    poolPointCost: 0
  }, data);

  if (!data.actorUuid) data.actorUuid = game.user.character.uuid;

  let actor = (data.actorUuid.includes("Token")) ? fromUuidSync(data.actorUuid).actor : fromUuidSync(data.actorUuid);

  // Check for PC actor
  if (!actor || actor.type != "pc") return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.MacroOnlyAppliesToPC"));

  // Check whether pool == XP
  if (data.pool == "XP" && !data.skipDialog) return ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.CantUseAIOMacroWithAbilitiesUsingXP"));

  // Set default for difficulty
  let lastChatMessage = game.messages.contents[game.messages.contents.length - 1];
  data.baseDifficulty = (lastChatMessage?.flags?.difficulty) ? lastChatMessage.flags.difficulty : "none";

  // Set defaults for functions
  if (data.teen === undefined) {
    data.teen = (actor.system.basic.unmaskedForm == "Teen") ? true : false;
  }
  data.skipDialog = (game.keyboard.isModifierActive('Alt')) ? !data.skipDialog : data.skipDialog;
  data.skipDialog = (actor.getFlag("cyphersystem", "multiRoll.active")) ? false : data.skipDialog;

  data.initiativeRoll = (actor.items.get(data.itemID)) ? actor.items.get(data.itemID).system.settings.general.initiative : false;

  // Set GMI Range
  if (data.gmiRange === undefined) {
    if (game.settings.get("cyphersystem", "useGlobalGMIRange")) {
      data.gmiRange = game.settings.get("cyphersystem", "globalGMIRange");
    } else if (!game.settings.get("cyphersystem", "useGlobalGMIRange")) {
      data.gmiRange = actor.system.basic.gmiRange;
    }
  }

  // Set default basic modifiers
  if (data.skillLevel == "Specialized") data.skillLevel = 2;
  if (data.skillLevel == "Trained") data.skillLevel = 1;
  if (data.skillLevel == "Practiced") data.skillLevel = 0;
  if (data.skillLevel == "Inability") data.skillLevel = -1;

  // Go to the next step after checking whether dialog should be skipped
  if (!data.skipDialog) {
    rollEngineForm(data);
  } else if (data.skipDialog) {
    rollEngineComputation(data);
  }
}