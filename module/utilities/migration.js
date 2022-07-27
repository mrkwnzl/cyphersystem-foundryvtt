export async function actorDataMigration() {
  // Update existing characters
  for (let actor of game.actors.contents) {
    if (!actor.system.settings.equipment.cyphersName) await actor.update({"system.settings.equipment.cyphersName": ""});
    if (!actor.system.settings.equipment.artifactsName) await actor.update({"system.settings.equipment.artifactsName": ""});
    if (!actor.system.settings.equipment.odditiesName) await actor.update({"system.settings.equipment.odditiesName": ""});
    if (!actor.system.settings.equipment.materialName) await actor.update({"system.settings.equipment.materialName": ""});
    if (actor.type === "PC" && !actor.system.settings.equipment.cyphers) await actor.update({"system.settings.equipment.cyphers": true});
    if (actor.type === "Token" && (actor.system.settings.counting == "Down" || !actor.system.settings.counting)) await actor.update({"system.settings.counting": -1});
    if (actor.type === "Token" && actor.system.settings.counting == "Up") await actor.update({"system.settings.counting": 1});
    if (actor.type === "PC") {
      if (actor.system.settings.additionalRecoveries.active) {
        await actor.update({
          "system.settings.additionalRecoveries.numberOneActionRecoveries": parseInt(actor.system.settings.additionalRecoveries.howManyRecoveries) + 1, "system.settings.additionalRecoveries.active": false
        })
      }
      if (actor.system.basic.description != null) {
        await actor.update({"system.description": actor.system.basic.description})
        await actor.update({"system.basic.-=description": null})
      }
      if (actor.system.basic.notes != null) {
        await actor.update({"system.notes": actor.system.basic.notes})
        await actor.update({"system.basic.-=notes": null})
      }
    }
    if (actor.system.biography != null) {
      await actor.update({"system.notes": actor.system.biography})
      await actor.update({"system.-=biography": null})
    }
  }

  console.log("Migration complete");
}