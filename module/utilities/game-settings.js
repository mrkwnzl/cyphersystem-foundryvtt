import {SheetCustomization} from "../forms/sheet-customization.js";

export async function registerGameSettings() {
  game.settings.register("cyphersystem", "effectiveDifficulty", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingRollMacro"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingRollMacroHint"),
    scope: "world",
    type: Number,
    default: 0,
    choices: {
      0: game.i18n.localize("CYPHERSYSTEM.SettingRollMacroNever"),
      1: game.i18n.localize("CYPHERSYSTEM.SettingRollMacroAlways"),
      2: game.i18n.localize("CYPHERSYSTEM.SettingRollMacroOnlyWhenNoDifficultyIsSet")
    },
    config: true
  });

  game.settings.register("cyphersystem", "rollButtons", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingRollButtons"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingRollButtonsHint"),
    scope: "world",
    type: Number,
    default: 0,
    choices: {
      0: game.i18n.localize("CYPHERSYSTEM.SettingRollButtonsDisabled"),
      1: game.i18n.localize("CYPHERSYSTEM.SettingRollButtonsEnabled"),
      2: game.i18n.localize("CYPHERSYSTEM.SettingRollButtonsOnlyStats")
    },
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

  game.settings.register("cyphersystem", "showRollDetails", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingShowRollDetails"),
    hint: game.i18n.localize("CYPHERSYSTEM.SettingShowRollDetailsHint"),
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

  game.settings.register("cyphersystem", "systemMigrationVersion", {
    name: "System Migration Version",
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  // Roll Difficulty
  game.settings.register("cyphersystem", "persistentRollDifficulty", {
    scope: "world",
    type: Number,
    default: 0,
    config: false
  });

  game.settings.register("cyphersystem", "rollDifficulty", {
    scope: "world",
    config: false,
    type: Number,
    default: -1
  });

  game.settings.register("cyphersystem", "difficultyNPCInitiative", {
    scope: "world",
    type: Number,
    default: 0,
    config: false
  });

  // GMI Range
  game.settings.register("cyphersystem", "useGlobalGMIRange", {
    scope: "world",
    type: Boolean,
    default: true,
    config: false
  });

  game.settings.register("cyphersystem", "globalGMIRange", {
    scope: "world",
    config: false,
    type: Number,
    default: 1
  });

  // Sheet Customization Settings
  game.settings.registerMenu("cyphersystem", "sheetCustomizationMenu", {
    name: game.i18n.localize("CYPHERSYSTEM.SettingSheetCustomization"),
    label: game.i18n.localize("CYPHERSYSTEM.SettingSheetCustomizationLabel"),
    icon: "fa-solid fa-paintbrush-pencil",
    type: SheetCustomization,
    restricted: false
  });

  game.settings.register("cyphersystem", "sheetCustomizationBackgroundImage", {
    scope: "world",
    config: false,
    type: String,
    default: "foundry"
  });

  game.settings.register("cyphersystem", "sheetCustomizationBackgroundImagePath", {
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  game.settings.register("cyphersystem", "sheetCustomizationBackgroundImageOverlayOpacity", {
    scope: "world",
    config: false,
    type: Number,
    default: 0.75
  });

  game.settings.register("cyphersystem", "sheetCustomizationBackgroundIcon", {
    scope: "world",
    config: false,
    type: String,
    default: "none"
  });

  game.settings.register("cyphersystem", "sheetCustomizationBackgroundIconPath", {
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  game.settings.register("cyphersystem", "sheetCustomizationBackgroundIconOpacity", {
    scope: "world",
    config: false,
    type: Number,
    default: 0.5
  });

  game.settings.register("cyphersystem", "sheetCustomizationLogoImage", {
    scope: "world",
    config: false,
    type: String,
    default: "black"
  });

  game.settings.register("cyphersystem", "sheetCustomizationLogoImagePath", {
    scope: "world",
    config: false,
    type: String,
    default: ""
  });

  game.settings.register("cyphersystem", "sheetCustomizationLogoImageOpacity", {
    scope: "world",
    config: false,
    type: Number,
    default: 1
  });

  game.settings.register("cyphersystem", "sheetEditor", {
    name: game.i18n.localize("CYPHERSYSTEM.SheetEditor"),
    hint: game.i18n.localize("CYPHERSYSTEM.SheetEditorHint"),
    scope: "world",
    type: Number,
    default: 0,
    choices: {
      0: "ProseMirror",
      1: "TinyMCE"
    },
    config: true
  });
}