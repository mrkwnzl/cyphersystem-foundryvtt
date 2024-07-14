/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Cypher system.
 * @extends {Actor}
 */
export class CypherActor extends Actor {
  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  prepareDerivedData() {
    const actorData = this;
    const systemData = actorData.system;
    const flags = actorData.flags.cyphersystem || {};

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._preparePCData(actorData);
  }

  /**
 * Prepare Character type specific data
 */
  _preparePCData(actorData) {
    if (actorData.type !== 'pc') return;

    // Make modifications to data here.
    const systemData = actorData.system;

    // Update armor
    let armorTotal = 0;
    let speedCostTotal = 0;
    let teenArmorTotal = 0;
    let teenSpeedCostTotal = 0;

    for (let piece of actorData.items) {
      if (piece.type === "armor" && piece.system.active === true && piece.system.archived === false) {
        if (piece.system.settings.general.unmaskedForm !== "Teen") {
          armorTotal = armorTotal + piece.system.basic.rating;
          speedCostTotal = speedCostTotal + piece.system.basic.cost;
        } else {
          teenArmorTotal = teenArmorTotal + piece.system.basic.rating;
          teenSpeedCostTotal = teenSpeedCostTotal + piece.system.basic.cost;
        }
      }
    }

    systemData.combat.armor.ratingTotal = armorTotal;
    systemData.combat.armor.costTotal = speedCostTotal;
    systemData.teen.combat.armor.armorValueTotal = teenArmorTotal;
    systemData.teen.combat.armor.speedCostTotal = teenSpeedCostTotal;

    // Calculate total modifier of attacks
    for (let i of actorData.items) {
      if (i.type == 'attack') {

        let skillRating = 0;
        // parseInt to correct old error
        let modifiedBy = parseInt(i.system.basic.steps);
        let totalModifier = 0;
        let totalModified = "";

        if (i.system.basic.skillRating == "Inability") skillRating = -1;
        if (i.system.basic.skillRating == "Trained") skillRating = 1;
        if (i.system.basic.skillRating == "Specialized") skillRating = 2;

        if (i.system.basic.modifier == "hindered") modifiedBy = modifiedBy * -1;

        totalModifier = skillRating + modifiedBy;

        if (totalModifier == 1) totalModified = game.i18n.localize("CYPHERSYSTEM.eased");
        if (totalModifier >= 2) totalModified = game.i18n.format("CYPHERSYSTEM.easedBySteps", {amount: totalModifier});
        if (totalModifier == -1) totalModified = game.i18n.localize("CYPHERSYSTEM.hindered");
        if (totalModifier <= -2) totalModified = game.i18n.format("CYPHERSYSTEM.hinderedBySteps", {amount: Math.abs(totalModifier)});

        // Assign and return
        if (i.system.totalModified != totalModified) {
          i.system.totalModified = totalModified;
          this.actor.updateEmbeddedDocuments("Item", [i]);
        }
      }
    }
  }
}
