export async function actorDataMigration() {
  // Check for newer version
  if (!isNewerVersion(game.system.version, game.settings.get("cyphersystem", "systemMigrationVersion"))) return;

  // Warn about migration
  ui.notifications.warn(game.i18n.format("CYPHERSYSTEM.MigrationInProgress", {version: game.system.version}));

  // Migrate actors in the world
  for (let actor of game.actors) {
    let actorData = await migrationRoutines(actor);
    actor.update(actorData);
  }

  // Migrate actors in compendia
  for (let pack of game.packs) {
    if (pack.metadata.type == "Actor") {
      for (let index of pack.index) {
        let lockedStatus = pack.locked;
        await pack.configure({locked: false});
        let actor = await pack.getDocument(index._id);
        let actorData = await migrationRoutines(actor);
        await actor.update(actorData);
        await pack.configure({locked: lockedStatus});
      }
    }
  }

  // Set last migrated version
  game.settings.set("cyphersystem", "systemMigrationVersion", game.system.version);

  // Notify about finished migration
  ui.notifications.notify(game.i18n.format("CYPHERSYSTEM.MigrationDone", {version: game.system.version}));
}

async function migrationRoutines(actor) {
  // Create actorData object
  let actorData = foundry.utils.deepClone(actor.toObject());

  // Fix for equipment names
  if (!actor.system.settings.equipment.cyphersName) actorData.system.settings.equipment.cyphersName = "";
  if (!actor.system.settings.equipment.artifactsName) actorData.system.settings.equipment.artifactsName = "";
  if (!actor.system.settings.equipment.odditiesName) actorData.system.settings.equipment.odditiesName = "";
  if (!actor.system.settings.equipment.materialName) actorData.system.settings.equipment.materialName = "";

  // Fix for missing cyphers
  if (actor.type === "PC" && !actor.system.settings.equipment.cyphers) actorData.system.settings.equipment.cyphers = true;

  // Fix for marker counting
  if (actor.type === "Token" && (actor.system.settings.counting == "Down" || !actor.system.settings.counting)) actorData.system.settings.counting = -1;
  if (actor.type === "Token" && actor.system.settings.counting == "Up") actorData.system.settings.counting = 1;

  // Migration to new recovery roll counting
  if (actor.type === "PC") {
    if (actor.system.settings.additionalRecoveries.active) {
      actorData.system.settings.additionalRecoveries.numberOneActionRecoveries = parseInt(actor.system.settings.additionalRecoveries.howManyRecoveries) + 1;
      actorData.system.settings.additionalRecoveries.active = false;
    }
  }

  // Migration for new description & notes paths
  if (actor.type === "PC") {
    if (actor.system.basic.description != null) {
      actorData.system.description = actor.system.basic.description;
      delete actorData.system.basic["description"];
      actor.update({"system.basic.-=description": null});
    }
    if (actor.system.basic.notes != null) {
      actorData.system.notes = actor.system.basic.notes;
      delete actorData.system.basic["notes"];
      actor.update({"system.basic.-=notes": null});
    }
  } else if (actor.system.biography != null) {
    actorData.system.notes = actor.system.biography;
    delete actorData.system["biography"];
    actor.update({"system.-=biography": null});
  }

  return actorData;
}