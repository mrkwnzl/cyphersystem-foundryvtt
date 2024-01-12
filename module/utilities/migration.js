export async function dataMigration() {
  // Check for newer version
  if (!isNewerVersion(game.system.version, game.settings.get("cyphersystem", "systemMigrationVersion"))) return;

  // Warn about migration
  ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.MigrationInProgress", {version: game.system.version}));

  // Migrate actors & embedded items in the world
  for (let actor of game.actors) {
    console.log(`Migrating Actor document ${actor.name}`);
    await migrationRoutineActor(actor);
  }

  // Migrate items in world
  for (let item of game.items) {
    console.log(`Migrating Item document ${item.name}`);
    await migrationRoutineItem(item);
  }

  // Migrate actors, embedded items, and items in compendia
  for (let pack of game.packs) {
    if (pack.metadata.type == "Actor" && pack.metadata.packageType == "world") {
      let lockedStatus = pack.locked;
      await pack.configure({locked: false});
      for (let index of pack.index) {
        let actor = await pack.getDocument(index._id);
        console.log(`Migrating Actor document ${actor.name}`);
        await migrationRoutineActor(actor);
      }
      await pack.configure({locked: lockedStatus});
    }
    if (pack.metadata.type == "Item" && pack.metadata.packageType == "world") {
      let lockedStatus = pack.locked;
      await pack.configure({locked: false});
      for (let index of pack.index) {
        let item = await pack.getDocument(index._id);
        console.log(`Migrating Item document ${item.name}`);
        await migrationRoutineItem(item);
      }
      await pack.configure({locked: lockedStatus});
    }
  }

  // Migrate tokens on scenes
  for (let scene of game.scenes) {
    for (let token of scene.tokens) {
      if (!token.actorLink && token.actor) {
        console.log(`Migrating Token document ${token.name}`);
        await migrationRoutineActor(token.actor);
      }
    }
  }

  // Migrate settings
  await migrationRoutineSettings();

  // Set last migrated version
  await game.settings.set("cyphersystem", "systemMigrationVersion", game.system.version);

  // Notify about finished migration
  await ui.notifications.info(game.i18n.format("CYPHERSYSTEM.MigrationDone", {version: game.system.version}), {permanent: true, console: true});
}

export async function dataMigrationPacks(packageName) {
  if (!game.modules.get(packageName)?.active) return ui.notifications.error("Package " + packageName + " not found in active modules!");

  // Warn about migration
  ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.MigrationInProgress", {version: game.system.version}));

  // Make all types valid again
  game.documentTypes.Item = ["ability", "ammo", "armor", "artifact", "attack", "cypher", "equipment", "lasting-damage", "material", "oddity", "power-shift", "recursion", "skill", "tag", "lasting Damage", "power Shift", "teen Ability", "teen Armor", "teen Attack", "teen lasting Damage", "teen Skill"];

  game.documentTypes.Actor = ["pc", "npc", "companion", "community", "vehicle", "marker", "PC", "NPC", "Companion", "Community", "Vehicle", "Token"];

  for (let pack of game.packs) {
    if (pack.metadata.type == "Actor" && pack.metadata.packageName == packageName) {
      let lockedStatus = pack.locked;
      await pack.configure({locked: false});
      for (let index of pack.index) {
        let actor = await pack.getDocument(index._id);
        console.log(`Migrating Actor document ${actor.name}`);
        await migrationRoutineActor(actor);
      }
      await pack.configure({locked: lockedStatus});
    }
    if (pack.metadata.type == "Item" && pack.metadata.packageName == packageName) {
      let lockedStatus = pack.locked;
      await pack.configure({locked: false});
      for (let index of pack.index) {
        let item = await pack.getDocument(index._id);
        console.log(`Migrating Item document ${item.name}`);
        await migrationRoutineItem(item);
      }
      await pack.configure({locked: lockedStatus});
    }
  }

  // Remove invalid types again
  game.documentTypes.Item = ["ability", "ammo", "armor", "artifact", "attack", "cypher", "equipment", "lasting-damage", "material", "oddity", "power-shift", "recursion", "skill", "tag"];

  game.documentTypes.Actor = ["pc", "npc", "companion", "community", "vehicle", "marker"];

  // Notify about finished migration
  await ui.notifications.info(game.i18n.format("CYPHERSYSTEM.MigrationDone", {version: game.system.version}), {permanent: true, console: true});
}

async function migrationRoutineActor(actor) {
  try {
    for (let item of actor.items) {
      const updateDataItem = await migrationItemV1ToV2(item);
      if (!foundry.utils.isEmpty(updateDataItem)) {
        await item.update(updateDataItem, {enforceTypes: false});
      }
      const updateDataItemV2 = await migrationItemV2ToV3(item);
      if (!foundry.utils.isEmpty(updateDataItemV2)) {
        await item.update(updateDataItemV2, {enforceTypes: false});
      }
    }
    const updateDataActor = await migrationActorV1ToV2(actor);
    if (!foundry.utils.isEmpty(updateDataActor)) {
      await actor.update(updateDataActor, {enforceTypes: false});
    }
    const updateDataActorV2 = await migrationActorV2ToV3(actor);
    if (!foundry.utils.isEmpty(updateDataActorV2)) {
      await actor.update(updateDataActorV2, {enforceTypes: false});
    }
    const updateDataActorV3 = await migrationActorV3ToV4(actor);
    if (!foundry.utils.isEmpty(updateDataActorV3)) {
      await actor.update(updateDataActorV3, {enforceTypes: false});
    }
  } catch (error) {
    error.message = `Failed Cypher system migration for Actor ${actor.name}: ${error.message}`;
    console.error(error);
  }
}

async function migrationRoutineItem(item) {
  try {
    const updateDataItem = await migrationItemV1ToV2(item);
    if (!foundry.utils.isEmpty(updateDataItem)) {
      await item.update(updateDataItem, {enforceTypes: false});
    }
    const updateDataItemV2 = await migrationItemV2ToV3(item);
    if (!foundry.utils.isEmpty(updateDataItemV2)) {
      await item.update(updateDataItemV2, {enforceTypes: false});
    }
  } catch (error) {
    error.message = `Failed Cypher system migration for Actor ${item.name}: ${error.message}`;
    console.error(error);
  }
}

async function migrationRoutineSettings() {
  if (game.settings.get("cyphersystem", "effectiveDifficulty") === true) {
    game.settings.set("cyphersystem", "effectiveDifficulty", 1);
  }
  if (game.settings.get("cyphersystem", "rollButtons") === false) {
    game.settings.set("cyphersystem", "rollButtons", 0);
  }
}

async function migrationActorV1ToV2(actor) {
  await migrationActorTypes();

  // Create updateData object
  let updateData = foundry.utils.deepClone(actor.toObject());

  // Migration for v2 data paths
  if (actor.system.version == 1 || actor.system.version == null) {
    if (actor.type == "pc") {
      await migrateBasicAdvancements();
      await migratePoolsEdge();
      await migrateCombatRecoveries();
      await migrateCombatDamageTrack();
      await migrateCombatArmor();
      await migrateAbilitiesPreparedSpells();
      await migrateEquipmentCypherLimit();
      await migrateNotesAndDescription();
      await migrateSettingsGeneral();
      await migrateSettingsHideArchive();
      await migrateSettingsRemoveInitiative();
      await migrateSettingsSkillsAndPowerShifts();
      await migrateSettingsCombat();
      await migrateSettingsAbilities();
      await migrateSettingsCurrency();
      await migrateSettingsEquipment();
      await deleteUnnecessaryData();
    }

    if (actor.type == "npc") {
      await migrateBasicLevelAndRank();
      await migratePoolsHealth();
      await migrateCombatDamageAndArmor();
      await migrateBiographyAndDescription();
      await migrateSettingsHideArchive();
      await migrateSettingsInitiative();
      await migrateSettingsEquipment();
      await migrateSettingsEquipmentAttacksArmorAmmo();
      await deleteUnnecessaryData();
    }

    if (actor.type == "companion") {
      await migrateBasicCompanion();
      await migrateBasicLevelAndRank();
      await migratePoolsHealth();
      await migrateCombatDamageAndArmor();
      await migrateBiographyAndDescription();
      await migrateSettingsHideArchive();
      await migrateSettingsInitiative();
      await migrateSettingsEquipment();
      await migrateSettingsEquipmentAttacksArmorAmmo();
      await deleteUnnecessaryData();
    }

    if (actor.type == "community") {
      await migrateBasicLevelAndRank();
      await migratePoolsHealth();
      await migratePoolsInfrastructure();
      await migrateCombatDamageAndArmor();
      await migrateBiographyAndDescription();
      await migrateSettingsHideArchive();
      await migrateSettingsInitiative();
      await migrateSettingsEquipment();
      await migrateSettingsEquipmentAttacksArmorAmmo();
      await deleteUnnecessaryData();
    }

    if (actor.type == "vehicle") {
      await migrateBasicLevelAndRank();
      await migrateBasicVehicle();
      await migrateBasicCrewAndWeaponSystems();
      await migrateBiographyAndDescription();
      await migrateSettingsHideArchive();
      await migrateSettingsEquipment();
      await migrateSettingsEquipmentAttacksArmorAmmo();
      await deleteUnnecessaryData();
    }

    if (actor.type == "marker") {
      await migrateBasicLevelAndRank();
      await migratePoolsQuantity();
      await migrateBiographyAndDescription();
      await migrateSettingsHideArchive();
      await migrateSettingsEquipment();
      await migrateSettingsEquipmentAttacksArmorAmmo();
      await migrateSettingsMarker();
      await deleteUnnecessaryData();
    }

    // Update to version 2
    updateData.system.version = 2;
    return updateData;
  }

  async function migrationActorTypes() {
    if (actor.type == "Token") {
      await actor.update({"type": "marker"});
    } else {
      await actor.update({"type": actor.type.toLowerCase()});
    }
  }

  async function migrateBasicLevelAndRank() {
    if (actor.system.level != null) {
      updateData.system.basic.level = actor.system.level;
      delete updateData.system["level"];
      // await actor.update({"system.-=level": null});
    }
    if (actor.system.rank != null) {
      updateData.system.basic.rank = actor.system.rank;
      delete updateData.system["rank"];
      // await actor.update({"system.-=rank": null});
    }
  }

  async function migrateBasicAdvancements() {
    if (actor.system.advancement.advStats != null) {
      updateData.system.basic.advancement.stats = actor.system.advancement.advStats;
      updateData.system.basic.advancement.effort = actor.system.advancement.advEffort;
      updateData.system.basic.advancement.edge = actor.system.advancement.advEdge;
      updateData.system.basic.advancement.skill = actor.system.advancement.advSkill;
      updateData.system.basic.advancement.other = actor.system.advancement.advOther;
      delete updateData.system["advancement"];
    }
  }

  async function migrateBasicCompanion() {
    if (actor.system.disposition != null) {
      updateData.system.basic.disposition = actor.system.disposition;
      delete updateData.system["disposition"];
    }
    if (actor.system.category != null) {
      updateData.system.basic.category = actor.system.category;
      delete updateData.system["category"];
    }
    if (actor.system.ownedBy != null) {
      updateData.system.basic.ownedBy = actor.system.ownedBy;
      delete updateData.system["ownedBy"];
    }
  }

  async function migrateBasicVehicle() {
    if (actor.system.crew != null) {
      updateData.system.basic.crew = actor.system.crew;
      delete updateData.system["crew"];
    }
    if (actor.system.weaponSystems != null) {
      updateData.system.basic.weaponSystems = actor.system.weaponSystems;
      delete updateData.system["weaponSystems"];
    }
  }

  async function migratePoolsEdge() {
    if (actor.system.pools.mightEdge != null) {
      updateData.system.pools.might.edge = actor.system.pools.mightEdge;
      delete updateData.system.pools["mightEdge"];
    }
    if (actor.system.pools.speedEdge != null) {
      updateData.system.pools.speed.edge = actor.system.pools.speedEdge;
      delete updateData.system.pools["speedEdge"];
    }
    if (actor.system.pools.intellectEdge != null) {
      updateData.system.pools.intellect.edge = actor.system.pools.intellectEdge;
      delete updateData.system.pools["intellectEdge"];
    }
    if (actor.system.teen.pools.mightEdge != null) {
      updateData.system.teen.pools.might.edge = actor.system.teen.pools.mightEdge;
      delete updateData.system.teen.pools["mightEdge"];
    }
    if (actor.system.teen.pools.speedEdge != null) {
      updateData.system.teen.pools.speed.edge = actor.system.teen.pools.speedEdge;
      delete updateData.system.teen.pools["speedEdge"];
    }
    if (actor.system.teen.pools.intellectEdge != null) {
      updateData.system.teen.pools.intellect.edge = actor.system.teen.pools.intellectEdge;
      delete updateData.system.teen.pools["intellectEdge"];
    }
  }

  async function migratePoolsHealth() {
    if (actor.system.health != null) {
      updateData.system.pools.health = actor.system.health;
      delete updateData.system["health"];
    }
  }

  async function migratePoolsInfrastructure() {
    if (actor.system.infrastructure != null) {
      updateData.system.pools.infrastructure = actor.system.infrastructure;
      delete updateData.system["infrastructure"];
    }
  }

  async function migratePoolsQuantity() {
    if (actor.system.quantity != null) {
      updateData.system.pools.quantity = actor.system.quantity;
      delete updateData.system["quantity"];
    }
  }

  async function migrateBasicCrewAndWeaponSystems() {
    if (actor.system.crew != null) {
      updateData.system.basic.crew = actor.system.crew;
      delete updateData.system["crew"];
    }

    if (actor.system.weaponSystems != null) {
      updateData.system.basic.weaponSystems = actor.system.weaponSystems;
      delete updateData.system["weaponSystems"];
    }
  }

  async function migrateCombatRecoveries() {
    if (actor.system.recoveries != null) {
      updateData.system.combat.recoveries.roll = actor.system.recoveries.recoveryRoll;
      updateData.system.combat.recoveries.oneAction = actor.system.recoveries.oneAction;
      updateData.system.combat.recoveries.oneAction2 = actor.system.recoveries.oneActionTwo;
      updateData.system.combat.recoveries.oneAction3 = actor.system.recoveries.oneActionThree;
      updateData.system.combat.recoveries.oneAction4 = actor.system.recoveries.oneActionFour;
      updateData.system.combat.recoveries.oneAction5 = actor.system.recoveries.oneActionFive;
      updateData.system.combat.recoveries.oneAction6 = actor.system.recoveries.oneActionSix;
      updateData.system.combat.recoveries.oneAction7 = actor.system.recoveries.oneActionSeven;
      updateData.system.combat.recoveries.tenMinutes = actor.system.recoveries.tenMinutes;
      updateData.system.combat.recoveries.tenMinutes2 = actor.system.recoveries.tenMinutesTwo;
      updateData.system.combat.recoveries.oneHour = actor.system.recoveries.oneHour;
      updateData.system.combat.recoveries.tenHours = actor.system.recoveries.tenHours;
      delete updateData.system["recoveries"];
    }
  }

  async function migrateCombatDamageTrack() {
    if (actor.system.damage != null) {
      updateData.system.combat.damageTrack.state = actor.system.damage.damageTrack;
      updateData.system.combat.damageTrack.applyImpaired = actor.system.damage.applyImpaired;
      updateData.system.combat.damageTrack.applyDebilitated = actor.system.damage.applyDebilitated;
      delete updateData.system["damage"];
    }
    if (actor.system.teen?.damage != null) {
      updateData.system.teen.combat.damageTrack.state = actor.system.teen.damage.damageTrack;
      updateData.system.teen.combat.damageTrack.applyImpaired = actor.system.teen.damage.applyImpaired;
      updateData.system.teen.combat.damageTrack.applyDebilitated = actor.system.teen.damage.applyDebilitated;
      delete updateData.system.teen["damage"];
    }
  }

  async function migrateCombatDamageAndArmor() {
    if (actor.system.damage != null) {
      updateData.system.combat.damage = actor.system.damage;
      delete updateData.system["damage"];
    }
    if (actor.system.armor != null) {
      updateData.system.combat.armor = actor.system.armor;
      delete updateData.system["armor"];
    }
  }

  async function migrateCombatArmor() {
    if (actor.system.armor != null) {
      updateData.system.combat.armor.ratingTotal = actor.system.armor.armorValueTotal;
      updateData.system.combat.armor.costTotal = actor.system.armor.speedCostTotal;
      delete updateData.system["armor"];
    }
    if (actor.system.teen?.armor != null) {
      updateData.system.teen.combat.armor = actor.system.teen.armor;
      delete updateData.system.teen["armor"];
    }
  }

  async function migrateAbilitiesPreparedSpells() {
    if (actor.system.basic.preparedSpells != null) {
      updateData.system.abilities.preparedSpells = actor.system.basic.preparedSpells;
      delete updateData.system.basic["preparedSpells"];
    }
  }

  async function migrateEquipmentCypherLimit() {
    if (actor.system.basic.cypherLimit != null) {
      updateData.system.equipment.cypherLimit = actor.system.basic.cypherLimit;
      delete updateData.system.basic["cypherLimit"];
    }
  }

  async function migrateNotesAndDescription() {
    if (actor.system.basic.description != null) {
      updateData.system.description = actor.system.basic.description;
      delete updateData.system.basic["description"];
    }
    if (actor.system.basic.notes != null) {
      updateData.system.notes = actor.system.basic.notes;
      delete updateData.system.basic["notes"];
    }
    if (actor.system.teen?.basic.description != null) {
      updateData.system.teen.description = actor.system.teen.basic.description;
      delete updateData.system.teen.basic["description"];
    }
    if (actor.system.teen?.basic.notes != null) {
      updateData.system.teen.notes = actor.system.teen.basic.notes;
      delete updateData.system.teen.basic["notes"];
    }
  }

  async function migrateBiographyAndDescription() {
    if (actor.system.basic.description != null) {
      updateData.system.description = actor.system.basic.description;
      delete updateData.system.basic["description"];
    }
    if (actor.system.biography != null) {
      updateData.system.notes = actor.system.biography;
      delete updateData.system["biography"];
    }
  }

  async function migrateSettingsGeneral() {
    if (actor.system.additionalPool != null) {
      updateData.system.settings.general.additionalPool.label = actor.system.additionalPool.additionalPoolName;
      updateData.system.settings.general.additionalPool.active = actor.system.additionalPool.active;
      updateData.system.teen.settings.general.additionalPool.label = actor.system.additionalPool.additionalTeenPoolName;
      updateData.system.teen.settings.general.additionalPool.active = actor.system.additionalPool.teenactive;
      delete updateData.system["additionalPool"];
    }
    if (actor.system.settings.gameMode != null) {
      updateData.system.settings.general.gameMode = actor.system.settings.gameMode.current;
      updateData.system.basic.unmaskedForm = actor.system.settings.gameMode.currentSheet;
      delete updateData.system.settings["gameMode"];
    }
    if (actor.system.settings.additionalSentence != null) {
      updateData.system.settings.general.additionalSentence.active = actor.system.settings.additionalSentence.active;
      updateData.system.settings.general.additionalSentence.label = actor.system.settings.additionalSentence.name;
      delete updateData.system.settings["additionalSentence"];
    }
    if (actor.system.settings.tags.active != null) {
      updateData.system.settings.general.tags.active = actor.system.settings.tags.active;
    }
    if (actor.system.settings.tags.tagsName != null) {
      updateData.system.settings.general.tags.label = actor.system.settings.tags.tagsName;
    }
    if (actor.system.settings.tags != null) {
      delete updateData.system.settings["tags"];
    }
    if (actor.system.settings.backgroundImage != null) {
      updateData.system.settings.general.background.image = actor.system.settings.backgroundImage;
      delete updateData.system.settings["backgroundImage"];
    }
    if (actor.system.settings.backgroundIcon != null) {
      updateData.system.settings.general.background.icon = actor.system.settings.backgroundIcon;
      delete updateData.system.settings["backgroundIcon"];
    }
    if (actor.system.teen.settings.backgroundImage != null) {
      updateData.system.teen.settings.general.background.image = actor.system.teen.settings.backgroundImage;
      delete updateData.system.teen.settings["backgroundImage"];
    }
    if (actor.system.teen.settings.backgroundIcon != null) {
      updateData.system.teen.settings.general.background.icon = actor.system.teen.settings.backgroundIcon;
      delete updateData.system.teen.settings["backgroundIcon"];
    }
  }

  async function migrateSettingsHideArchive() {
    if (actor.system.settings.hideArchived != null) {
      updateData.system.settings.general.hideArchive = actor.system.settings.hideArchived;
      delete updateData.system.settings["hideArchived"];
    }
  }

  async function migrateSettingsMarker() {
    if (actor.system.settings.isCounter != null) {
      updateData.system.settings.general.isCounter = actor.system.settings.isCounter;
      delete updateData.system.settings["isCounter"];
    }
    if (actor.system.settings.counting != null) {
      updateData.system.settings.general.counting = (Number.isInteger(actor.system.settings.counting)) ? actor.system.settings.counting : -1;
      delete updateData.system.settings["counting"];
    }
    if (actor.system.settings.hideNotes != null) {
      updateData.system.settings.general.hideNotes = actor.system.settings.hideNotes;
      delete updateData.system.settings["hideNotes"];
    }
    if (actor.system.settings.hideDescription != null) {
      updateData.system.settings.general.hideDescription = actor.system.settings.hideDescription;
      delete updateData.system.settings["hideDescription"];
    }
    if (actor.system.settings.hideEquipment != null) {
      updateData.system.settings.general.hideEquipment = actor.system.settings.hideEquipment;
      delete updateData.system.settings["hideEquipment"];
    }
  }

  async function migrateSettingsInitiative() {
    if (actor.system.settings.initiative != null) {
      updateData.system.settings.general.initiativeBonus = parseInt(actor.system.settings.initiative.initiativeBonus);
      delete updateData.system.settings["initiative"];
    }
  }

  async function migrateSettingsRemoveInitiative() {
    if (actor.system.settings.initiative != null) {
      delete updateData.system.settings["initiative"];
    }
  }

  async function migrateSettingsSkillsAndPowerShifts() {
    if (actor.system.settings.skills != null) {
      updateData.system.settings.skills.labelCategory1 = actor.system.settings.skills.nameSkills;
      updateData.system.settings.skills.labelCategory2 = actor.system.settings.skills.nameCategoryTwo;
      updateData.system.settings.skills.labelCategory3 = actor.system.settings.skills.nameCategoryThree;
      updateData.system.settings.skills.labelCategory4 = actor.system.settings.skills.nameCategoryFour;
      delete updateData.system.settings.skills["nameSkills"];
      delete updateData.system.settings.skills["nameCategoryTwo"];
      delete updateData.system.settings.skills["nameCategoryThree"];
      delete updateData.system.settings.skills["nameCategoryFour"];
    }
    if (actor.system.settings.powerShifts != null) {
      updateData.system.settings.skills.powerShifts.active = actor.system.settings.powerShifts.active;
      updateData.system.settings.skills.powerShifts.label = actor.system.settings.powerShifts.powerShiftsName;
      delete updateData.system.settings["powerShifts"];
    }
  }

  async function migrateSettingsCombat() {
    if (actor.system.settings.additionalRecoveries != null) {
      updateData.system.settings.combat.numberOneActionRecoveries = actor.system.settings.additionalRecoveries.numberOneActionRecoveries;
      updateData.system.settings.combat.numberTenMinuteRecoveries = actor.system.settings.additionalRecoveries.numberTenMinuteRecoveries;
      delete updateData.system.settings["additionalRecoveries"];
    }
    if (actor.system.settings.lastingDamage.active != null) {
      updateData.system.settings.combat.lastingDamage.active = actor.system.settings.lastingDamage.active;
      delete updateData.system.settings["lastingDamage"];
    }
    if (actor.system.settings.ammo != null) {
      updateData.system.settings.combat.ammo.active = actor.system.settings.ammo;
      delete updateData.system.settings["ammo"];
    }
  }

  async function migrateSettingsAbilities() {
    if (actor.system.settings.abilities != null) {
      updateData.system.settings.abilities.labelCategory1 = actor.system.settings.abilities.nameAbilities;
      updateData.system.settings.abilities.labelCategory2 = actor.system.settings.abilities.nameCategoryTwo;
      updateData.system.settings.abilities.labelCategory3 = actor.system.settings.abilities.nameCategoryThree;
      updateData.system.settings.abilities.labelCategory4 = actor.system.settings.abilities.nameCategoryFour;
      delete updateData.system.settings.abilities["nameAbilities"];
      delete updateData.system.settings.abilities["nameCategoryTwo"];
      delete updateData.system.settings.abilities["nameCategoryThree"];
      delete updateData.system.settings.abilities["nameCategoryFour"];
      delete updateData.system.settings.abilities["categoryTwoActive"];
      delete updateData.system.settings.abilities["categoryThreeActive"];
      delete updateData.system.settings.abilities["categoryFourActive"];
      delete updateData.system.settings.abilities["spellsActive"];
    }
  }

  async function migrateSettingsCurrency() {
    if (actor.system.settings.currency != null) {
      updateData.system.settings.equipment.currency.active = actor.system.settings.currency.active;
      updateData.system.settings.equipment.currency.hideLabels = actor.system.settings.currency.namesHidden;
      updateData.system.settings.equipment.currency.numberCategories = actor.system.settings.currency.howMany;
      updateData.system.settings.equipment.currency.labelCategory1 = actor.system.settings.currency.name;
      updateData.system.settings.equipment.currency.labelCategory2 = actor.system.settings.currency.name2;
      updateData.system.settings.equipment.currency.labelCategory3 = actor.system.settings.currency.name3;
      updateData.system.settings.equipment.currency.labelCategory4 = actor.system.settings.currency.name4;
      updateData.system.settings.equipment.currency.labelCategory5 = actor.system.settings.currency.name5;
      updateData.system.settings.equipment.currency.labelCategory6 = actor.system.settings.currency.name6;
      updateData.system.settings.equipment.currency.quantity1 = actor.system.settings.currency.quantity;
      updateData.system.settings.equipment.currency.quantity2 = actor.system.settings.currency.quantity2;
      updateData.system.settings.equipment.currency.quantity3 = actor.system.settings.currency.quantity3;
      updateData.system.settings.equipment.currency.quantity4 = actor.system.settings.currency.quantity4;
      updateData.system.settings.equipment.currency.quantity5 = actor.system.settings.currency.quantity5;
      updateData.system.settings.equipment.currency.quantity6 = actor.system.settings.currency.quantity6;
      delete updateData.system.settings["currency"];
    }
  }

  async function migrateSettingsEquipment() {
    if (actor.system.settings.equipment.cyphers != null && actor.system.settings.equipment.cyphersName != null) {
      updateData.system.settings.equipment.cyphers = {"active": actor.system.settings.equipment.cyphers, "label": actor.system.settings.equipment.cyphersName};
      delete updateData.system.settings.equipment["cyphersName"];
    }
    if (actor.system.settings.equipment.artifacts != null && actor.system.settings.equipment.artifactsName != null) {
      updateData.system.settings.equipment.artifacts = {"active": actor.system.settings.equipment.artifacts, "label": actor.system.settings.equipment.artifactsName};
      delete updateData.system.settings.equipment["artifactsName"];
    }
    if (actor.system.settings.equipment.oddities != null && actor.system.settings.equipment.odditiesName != null) {
      updateData.system.settings.equipment.oddities = {"active": actor.system.settings.equipment.oddities, "label": actor.system.settings.equipment.odditiesName};
      delete updateData.system.settings.equipment["odditiesName"];
    }
    if (actor.system.settings.equipment.materials != null && actor.system.settings.equipment.materialName != null) {
      updateData.system.settings.equipment.materials = {"active": actor.system.settings.equipment.materials, "label": actor.system.settings.equipment.materialName};
      delete updateData.system.settings.equipment["materialName"];
    }
  }

  async function migrateSettingsEquipmentAttacksArmorAmmo() {
    if (actor.system.settings.equipment.attacks != null) {
      updateData.system.settings.equipment.attacks = {"active": actor.system.settings.equipment.attacks};
    }
    if (actor.system.settings.equipment.armor != null) {
      updateData.system.settings.equipment.armor = {"active": actor.system.settings.equipment.armor};
    }
    if (actor.system.settings.equipment.ammo != null) {
      updateData.system.settings.equipment.ammo = {"active": actor.system.settings.equipment.ammo};
    }
  }

  async function deleteUnnecessaryData() {
    let deleteData = {
      "system.-=level": null,
      "system.-=rank": null,
      "system.-=advancement": null,
      "system.-=disposition": null,
      "system.-=category": null,
      "system.-=ownedBy": null,
      "system.-=crew": null,
      "system.-=weaponSystems": null,
      "system.pools.-=mightEdge": null,
      "system.pools.-=speedEdge": null,
      "system.pools.-=intellectEdge": null,
      "system.teen.pools.-=mightEdge": null,
      "system.teen.pools.-=speedEdge": null,
      "system.teen.pools.-=intellectEdge": null,
      "system.-=health": null,
      "system.-=damage": null,
      "system.-=infrastructure": null,
      "system.-=quantity": null,
      "system.-=recoveries": null,
      "system.-=damage": null,
      "system.teen.-=damage": null,
      "system.-=armor": null,
      "system.teen.-=armor": null,
      "system.basic.-=preparedSpells": null,
      "system.basic.-=cypherLimit": null,
      "system.basic.-=description": null,
      "system.basic.-=notes": null,
      "system.teen.basic.-=description": null,
      "system.teen.basic.-=notes": null,
      "system.-=biography": null,
      "system.-=additionalPool": null,
      "system.settings.-=gameMode": null,
      "system.settings.-=additionalSentence": null,
      "system.settings.-=tags": null,
      "system.settings.-=backgroundImage": null,
      "system.settings.-=backgroundIcon": null,
      "system.teen.settings.-=backgroundImage": null,
      "system.teen.settings.-=backgroundIcon": null,
      "system.settings.-=hideArchived": null,
      "system.settings.-=isCounter": null,
      "system.settings.-=counting": null,
      "system.settings.-=hideNotes": null,
      "system.settings.-=hideDescription": null,
      "system.settings.-=hideEquipment": null,
      "system.settings.-=initiative": null,
      "system.settings.-=initiative": null,
      "system.settings.skills.-=nameSkills": null,
      "system.settings.skills.-=nameCategoryTwo": null,
      "system.settings.skills.-=nameCategoryThree": null,
      "system.settings.skills.-=nameCategoryFour": null,
      "system.settings.-=powerShifts": null,
      "system.settings.-=additionalRecoveries": null,
      "system.settings.-=lastingDamage": null,
      "system.settings.-=ammo": null,
      "system.settings.abilities.-=nameAbilities": null,
      "system.settings.abilities.-=nameCategoryTwo": null,
      "system.settings.abilities.-=nameCategoryThree": null,
      "system.settings.abilities.-=nameCategoryFour": null,
      "system.settings.abilities.-=nameSpells": null,
      "system.settings.abilities.-=categoryTwoActive": null,
      "system.settings.abilities.-=categoryThreeActive": null,
      "system.settings.abilities.-=categoryFourActive": null,
      "system.settings.abilities.-=spellsActive": null,
      "system.settings.-=currency": null,
      "system.settings.equipment.-=cyphersName": null,
      "system.settings.equipment.-=artifactsName": null,
      "system.settings.equipment.-=odditiesName": null,
      "system.settings.equipment.-=materialName": null
    };
    await actor.update(deleteData);
  }
}

async function migrationActorV2ToV3(actor) {
  // Create updateData object
  let updateData = foundry.utils.deepClone(actor.toObject());

  // Migration for v2 data paths
  if (actor.system.version == 2 && actor.type == "pc") {
    if (actor.system.teen.settings.general.background.image != "foundry" ||
      actor.system.teen.settings.general.background.icon != "none" ||
      actor.system.teen.settings.general.logo.image != "black") {
      updateData.system.teen.settings.general.customSheetDesign = true;
    }
    if (actor.system.settings.general.background.image != "foundry" ||
      actor.system.settings.general.background.icon != "none" ||
      actor.system.settings.general.logo.image != "black") {
      updateData.system.settings.general.customSheetDesign = true;
    }
  }

  // Update to version 2
  updateData.system.version = 3;
  return updateData;
}

async function migrationActorV3ToV4(actor) {
  // Create updateData object
  let updateData = foundry.utils.deepClone(actor.toObject());

  if (actor.system.version == 3) {
    if (actor.type == "pc") {
      await deleteTagFlags();
    }

    // Update to version 4
    updateData.system.version = 4;
    return updateData;
  }

  async function deleteTagFlags() {
    actor.unsetFlag("cyphersystem", "tagMightModifier");
    actor.unsetFlag("cyphersystem", "tagMightEdgeModifier");
    actor.unsetFlag("cyphersystem", "tagSpeedModifier");
    actor.unsetFlag("cyphersystem", "tagSpeedEdgeModifier");
    actor.unsetFlag("cyphersystem", "tagIntellectModifier");
    actor.unsetFlag("cyphersystem", "tagIntellectEdgeModifier");
    actor.unsetFlag("cyphersystem", "recursionMightModifier");
    actor.unsetFlag("cyphersystem", "recursionMightEdgeModifier");
    actor.unsetFlag("cyphersystem", "recursionSpeedModifier");
    actor.unsetFlag("cyphersystem", "recursionSpeedEdgeModifier");
    actor.unsetFlag("cyphersystem", "recursionIntellectModifier");
    actor.unsetFlag("cyphersystem", "recursionIntellectEdgeModifier");
    actor.unsetFlag("cyphersystem", "recursion");
  }
};

async function migrationItemV1ToV2(item) {
  // Migration to new item types
  await migrationItemTypes();

  // Create updateData object
  let updateData = foundry.utils.deepClone(item.toObject());

  // Migration for v2 data paths
  if (item.system.version == 1 || item.system.version == null) {
    if (item.type == "ability") {
      await migrateNewIconPath();
      await migrateBasicAbility();
      await migrateSettingsRollButton();
      await migrateSettingsSorting();
      await deleteUnnecessaryData();
    }

    if (item.type == "ammo") {
      await migrateBasicLevel();
      await migrateBasicQuantity();
      await deleteUnnecessaryData();
    }

    if (item.type == "armor") {
      await migrateNewIconPath();
      await migrateBasicArmor();
      await migrateBasicNotes();
      await deleteUnnecessaryData();
    }

    if (item.type == "artifact") {
      await migrateBasicArtifact();
      await migrateBasicLevel();
      await migrateBasicIdentified();
      await deleteUnnecessaryData();
    }

    if (item.type == "attack") {
      await migrateNewIconPath();
      await migrateBasicAttack();
      await migrateBasicNotes();
      await migrateSettingsRollButton();
      await deleteUnnecessaryData();
    }

    if (item.type == "cypher") {
      await migrateBasicLevel();
      await migrateBasicIdentified();
      await deleteUnnecessaryData();
    }

    if (item.type == "equipment") {
      await migrateBasicLevel();
      await migrateBasicQuantity();
      await deleteUnnecessaryData();
    }

    if (item.type == "lasting-damage") {
      await migrateNewIconPath();
      await migrateBasicLastingDamage();
      await deleteUnnecessaryData();
    }

    if (item.type == "material") {
      await migrateBasicLevel();
      await migrateBasicQuantity();
      await deleteUnnecessaryData();
    }

    if (item.type == "oddity") {
      await migrateBasicLevel();
      await deleteUnnecessaryData();
    }

    if (item.type == "power-shift") {
      await migrateNewIconPath();
      await migrateBasicPowerShift();
      await deleteUnnecessaryData();
    }

    if (item.type == "recursion") {
      await migrateBasicRecursion();
      await migrateSettingsStatModifiers();
      await deleteUnnecessaryData();
    }

    if (item.type == "skill") {
      await migrateNewIconPath();
      await migrateBasicSkill();
      await migrateSettingsRollButton();
      await migrateSettingsSorting();
      await migrateSettingsSkill();
      await deleteUnnecessaryData();
    }

    if (item.type == "tag") {
      await migrateSettingsStatModifiers();
      await deleteUnnecessaryData();
    }

    // Update to version 2
    updateData.system.version = 2;
    return updateData;
  }

  async function migrationItemTypes() {
    if (item.type == "lasting Damage") {
      await item.update({"type": "lasting-damage"});
    }

    if (item.type == "power Shift") {
      await item.update({"type": "power-shift"});
    }

    if (item.type == "teen Ability") {
      await item.update({"type": "ability", "system.settings.general.unmaskedForm": "Teen"});
    }

    if (item.type == "teen Armor") {
      await item.update({"type": "armor", "system.settings.general.unmaskedForm": "Teen"});
    }

    if (item.type == "teen Attack") {
      await item.update({"type": "attack", "system.settings.general.unmaskedForm": "Teen"});
    }

    if (item.type == "teen lasting Damage") {
      await item.update({"type": "lasting-damage", "system.settings.general.unmaskedForm": "Teen"});
    }

    if (item.type == "teen Skill") {
      await item.update({"type": "skill", "system.settings.general.unmaskedForm": "Teen"});
    }
  }

  async function migrateNewIconPath() {
    if (item.img.includes("systems/cyphersystem/icons/items")) {
      updateData.img = item.img.toLowerCase().replace(/ /g, "-").replace("teen-", "");
    }
  }

  async function migrateBasicAbility() {
    if (item.system.costPoints != null) {
      updateData.system.basic.cost = item.system.costPoints;
      delete updateData.system["costPoints"];
    }
    if (item.system.costPool != null) {
      updateData.system.basic.pool = item.system.costPool;
      delete updateData.system["costPool"];
    }
    if (item.system.tier != null) {
      updateData.system.settings.general.spellTier = item.system.tier;
      delete updateData.system["tier"];
    }
  }

  async function migrateBasicArmor() {
    if (item.system.armorType != null) {
      updateData.system.basic.type = item.system.armorType;
      delete updateData.system["armorType"];
    }
    if (item.system.armorValue != null) {
      updateData.system.basic.rating = item.system.armorValue;
      delete updateData.system["armorValue"];
    }
    if (item.system.speedCost != null) {
      updateData.system.basic.cost = item.system.speedCost;
      delete updateData.system["speedCost"];
    }
    if (item.system.armorActive != null) {
      updateData.system.active = item.system.armorActive;
      delete updateData.system["armorActive"];
    }
  }

  async function migrateBasicArtifact() {
    if (item.system.depletion != null) {
      updateData.system.basic.depletion = item.system.depletion;
      delete updateData.system["depletion"];
    }
  }

  async function migrateBasicAttack() {
    if (item.system.damage != null) {
      updateData.system.basic.damage = item.system.damage;
      delete updateData.system["damage"];
    }
    if (item.system.attackType != null) {
      updateData.system.basic.type = item.system.attackType;
      delete updateData.system["attackType"];
    }
    if (item.system.modified != null) {
      updateData.system.basic.modifier = item.system.modified;
      delete updateData.system["modified"];
    }
    if (item.system.modifiedBy != null) {
      updateData.system.basic.steps = item.system.modifiedBy;
      delete updateData.system["modifiedBy"];
    }
    if (item.system.range != null) {
      updateData.system.basic.range = item.system.range;
      delete updateData.system["range"];
    }
    if (item.system.skillRating != null) {
      updateData.system.basic.skillRating = item.system.skillRating;
      delete updateData.system["skillRating"];
    }
    if (item.system.totalModified != null) {
      delete updateData.system["totalModified"];

    }
  }

  async function migrateBasicLastingDamage() {
    if (item.system.lastingDamageAmount != null) {
      updateData.system.basic.damage = item.system.lastingDamageAmount;
      delete updateData.system["lastingDamageAmount"];
    }
    if (item.system.lastingDamageEffect != null) {
      updateData.system.basic.effect = item.system.lastingDamageEffect;
      delete updateData.system["lastingDamageEffect"];
    }
    if (item.system.lastingDamagePool != null) {
      updateData.system.basic.pool = item.system.lastingDamagePool;
      delete updateData.system["lastingDamagePool"];
    }
    if (item.system.damageType != null) {
      updateData.system.basic.type = item.system.damageType;
      delete updateData.system["damageType"];
    }
    if (item.system.permanentDamage != null) {
      delete updateData.system["permanentDamage"];
    }
  }

  async function migrateBasicPowerShift() {
    if (item.system.powerShiftValue != null) {
      updateData.system.basic.shifts = item.system.powerShiftValue;
      delete updateData.system["powerShiftValue"];
    }
  }

  async function migrateBasicRecursion() {
    if (item.system.focus != null) {
      updateData.system.basic.focus = item.system.focus;
      delete updateData.system["focus"];
    }
  }

  async function migrateBasicSkill() {
    if (item.system.skillLevel != null) {
      updateData.system.basic.rating = item.system.skillLevel;
      delete updateData.system["skillLevel"];
    }
  }

  async function migrateBasicLevel() {
    if (item.system.level != null) {
      updateData.system.basic.level = item.system.level;
      delete updateData.system["level"];
    }
  }

  async function migrateBasicQuantity() {
    if (item.system.quantity != null) {
      updateData.system.basic.quantity = item.system.quantity;
      delete updateData.system["quantity"];
    }
  }

  async function migrateBasicIdentified() {
    if (item.system.identified != null) {
      updateData.system.basic.identified = item.system.identified;
      delete updateData.system["identified"];
    }
  }

  async function migrateBasicNotes() {
    if (item.system.notes != null) {
      updateData.system.basic.notes = item.system.notes;
      delete updateData.system["notes"];
    }
  }

  async function migrateSettingsRollButton() {
    if (item.system.rollButton != null) {
      updateData.system.settings.rollButton = item.system.rollButton;
      delete updateData.system["rollButton"];
    }
  }

  async function migrateSettingsSorting() {
    if (item.system.sorting != null) {
      updateData.system.settings.general.sorting = item.system.sorting;
      if (updateData.system.settings.general.sorting == "Skills") {
        updateData.system.settings.general.sorting = "Skill";
      }
      delete updateData.system["sorting"];
    }
  }

  async function migrateSettingsStatModifiers() {
    if (item.system.mightModifier != null) {
      updateData.system.settings.statModifiers.might.value = item.system.mightModifier;
      delete updateData.system["mightModifier"];
    }
    if (item.system.mightEdgeModifier != null) {
      updateData.system.settings.statModifiers.might.edge = item.system.mightEdgeModifier;
      delete updateData.system["mightEdgeModifier"];
    }
    if (item.system.speedModifier != null) {
      updateData.system.settings.statModifiers.speed.value = item.system.speedModifier;
      delete updateData.system["speedModifier"];
    }
    if (item.system.speedEdgeModifier != null) {
      updateData.system.settings.statModifiers.speed.edge = item.system.speedEdgeModifier;
      delete updateData.system["speedEdgeModifier"];
    }
    if (item.system.intellectModifier != null) {
      updateData.system.settings.statModifiers.intellect.value = item.system.intellectModifier;
      delete updateData.system["intellectModifier"];
    }
    if (item.system.intellectEdgeModifier != null) {
      updateData.system.settings.statModifiers.intellect.edge = item.system.intellectEdgeModifier;
      delete updateData.system["intellectEdgeModifier"];
    }
  }

  async function migrateSettingsSkill() {
    if (item.system.isInitiative != null) {
      updateData.system.settings.general.initiative = item.system.isInitiative;
      delete updateData.system["isInitiative"];
    }
  }

  async function deleteUnnecessaryData() {
    delete updateData.system["showDescription"];
    delete updateData.system["level"];
    delete updateData.system["recursions"];
    delete updateData.system["tags"];
    let deleteData = {
      "system.-=showDescription": null,
      "system.-=level": null,
      "system.-=recursions": null,
      "system.-=tags": null,
      "system.-=costPoints": null,
      "system.-=costPool": null,
      "system.-=tier": null,
      "system.-=armorType": null,
      "system.-=armorValue": null,
      "system.-=speedCost": null,
      "system.-=armorActive": null,
      "system.-=depletion": null,
      "system.-=damage": null,
      "system.-=attackType": null,
      "system.-=modified": null,
      "system.-=modifiedBy": null,
      "system.-=range": null,
      "system.-=skillRating": null,
      "system.-=totalModified": null,
      "system.-=lastingDamageAmount": null,
      "system.-=lastingDamageEffect": null,
      "system.-=lastingDamagePool": null,
      "system.-=damageType": null,
      "system.-=permanentDamage": null,
      "system.-=powerShiftValue": null,
      "system.-=focus": null,
      "system.-=skillLevel": null,
      "system.-=level": null,
      "system.-=quantity": null,
      "system.-=identified": null,
      "system.-=notes": null,
      "system.-=rollButton": null,
      "system.-=sorting": null,
      "system.-=mightModifier": null,
      "system.-=mightEdgeModifier": null,
      "system.-=speedModifier": null,
      "system.-=speedEdgeModifier": null,
      "system.-=intellectModifier": null,
      "system.-=intellectEdgeModifier": null,
      "system.-=isInitiative": null
    };
    await item.update(deleteData);
  }
}

async function migrationItemV2ToV3(item) {
  // Create updateData object
  let updateData = foundry.utils.deepClone(item.toObject());

  let name = updateData.name;
  let description = updateData.system.description;

  if (item.system.version == 2) {
    if (!["tag", "recursion"].includes(item.type)) {
      if (!item.actor) return;
      await migrateTags();
      await migrateRecursions();
    }

    description = description.replaceAll(/<p>\s*<\/p>/g, "");
    description = description.replaceAll(/<section class="secret.*" id=".*">\s*<\/section>/g, "");

    // Update to version 3
    updateData.system.version = 3;
    updateData.name = name;
    updateData.system.description = description;
    return updateData;
  }

  async function migrateTags() {
    const tagArray = (Array.isArray(item.flags?.cyphersystem?.tags)) ? item.flags.cyphersystem.tags : [];

    for (let tag of item.actor.items) {
      if (tag.type == "tag") {
        const tagName = "#" + tag.name;

        // Check of tags
        if ((name.includes(tagName) || description.includes(tagName)) && item.system.settings?.general?.unmaskedForm != "Teen") {
          tagArray.push(tag._id);
          name = name.replace(tagName, "");
          if (name == "") name = tag.name;
          description = description.replace(tagName, "");
        }
      }
    }

    await item.setFlag("cyphersystem", "tags", tagArray);
  }

  async function migrateRecursions() {
    const recursionArray = (Array.isArray(item.flags?.cyphersystem?.recursions)) ? item.flags.cyphersystem.recursions : [];

    for (let recursion of item.actor.items) {
      if (recursion.type == "recursion") {
        const recursionName = "@" + recursion.name;

        // Check if recursions
        if ((name.includes(recursionName) || description.includes(recursionName)) && item.system.settings?.general?.unmaskedForm != "Teen") {
          recursionArray.push(recursion._id);
          name = name.replace(recursionName, "");
          if (name == "") name = recursion.name;
          description = description.replace(recursionName, "");
        }

        // Check if active
        if (item.actor.flags?.cyphersystem?.recursion == recursionName.toLowerCase()) {
          await recursion.update({"system.active": true});
        }
      }
    }

    await item.setFlag("cyphersystem", "recursions", recursionArray);
  }
}