/**
* Extend the base Actor entity by defining a custom roll data structure which is ideal for the Cypher system.
* @extends {Actor}
*/
export class CypherItem extends Item {
  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing derived data.
  }

  prepareDerivedData() {
    const itemData = this;
    const systemData = itemData.system;
    const flags = itemData.flags.cyphersystem || {};

    // Make separate methods for each Item type (character, npc, etc.) to keep
    // things organized.
    this._prepareAttackData(itemData);
  }

  _prepareAttackData(itemData) {
    if (itemData.type !== 'attack') return;

    // Make modifications to data here.
    const systemData = itemData.system;

    let skillRating = 0;
    // parseInt to correct old error
    let modifiedBy = parseInt(systemData.basic.steps);
    let totalModifier = 0;
    let totalModified = "";

    if (systemData.basic.skillRating == "Inability") skillRating = -1;
    if (systemData.basic.skillRating == "Trained") skillRating = 1;
    if (systemData.basic.skillRating == "Specialized") skillRating = 2;

    if (systemData.basic.modifier == "hindered") modifiedBy = modifiedBy * -1;

    totalModifier = skillRating + modifiedBy;

    if (totalModifier == 1) totalModified = game.i18n.localize("CYPHERSYSTEM.eased");
    if (totalModifier >= 2) totalModified = game.i18n.format("CYPHERSYSTEM.easedBySteps", {amount: totalModifier});
    if (totalModifier == -1) totalModified = game.i18n.localize("CYPHERSYSTEM.hindered");
    if (totalModifier <= -2) totalModified = game.i18n.format("CYPHERSYSTEM.hinderedBySteps", {amount: Math.abs(totalModifier)});

    // Assign values
    systemData.totalModified = totalModified;
  }
}
