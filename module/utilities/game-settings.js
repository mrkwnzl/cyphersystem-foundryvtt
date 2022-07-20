export async function registerGameSettings() {
  game.settings.register("cyphersystem", "effectiveDifficulty", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingRollMacro"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingRollMacroHint"),
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });

  game.settings.register("cyphersystem", "rollButtons", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingRollButtons"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingRollButtonsHint"),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  game.settings.register("cyphersystem", "diceTray", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingDiceTray"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingDiceTrayHint"),
    scope: "world",
    type: Number,
    default: 0,
    choices: {
      0: game.i18n.localize("CYPHERSYSTEM.SettingDiceTrayDisabled"),
      1: game.i18n.localize("CYPHERSYSTEM.SettingDiceTrayShowLeft"),
      2: game.i18n.localize("CYPHERSYSTEM.SettingDiceTrayShowRight")
    },
    config: true
  });

  game.settings.register("cyphersystem", "itemMacrosUseAllInOne", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingMacroAllInOne"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingMacroAllInOneHint"),
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });

  game.settings.register("cyphersystem", "cypherIdentification", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingCypherIdentification"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingCypherIdentificationHint"),
    scope: "world",
    type: Number,
    default: 0,
    choices: {
      0: game.i18n.localize("CYPHERSYSTEM.SettingCypherIdentificationAsItem"),
      1: game.i18n.localize("CYPHERSYSTEM.SettingCypherIdentificationAlways"),
      2: game.i18n.localize("CYPHERSYSTEM.SettingCypherIdentificationNever")
    },
    config: true
  });

  game.settings.register("cyphersystem", "welcomeMessage", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingShowWelcome"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingShowWelcomeHint"),
    scope: "world",
    type: Boolean,
    default: true,
    config: true
  });

  game.settings.register("cyphersystem", "barBrawlDefaults", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingBarBrawlDefaults"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingBarBrawlDefaultsHint"),
    scope: "world",
    type: Boolean,
    default: true,
    config: game.modules.has("barbrawl") ? game.modules.get("barbrawl").active : false
  });

  game.settings.register("cyphersystem", "useSlashForFractions", {
    scope: "world",
    type: Boolean,
    default: true,
    config: false
  });

  game.settings.register("cyphersystem", "alwaysShowDescriptionOnRoll", {
    scope: "world",
    type: Boolean,
    default: false,
    config: false
  });
}