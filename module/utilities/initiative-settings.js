export async function initiativeSettings() {
  // Set an initiative formula for the system
  CONFIG.Combat.initiative = {
    formula: "1d20 + @settings.initiative.initiativeBonus",
    decimals: 0
  }

  Combatant.prototype._getInitiativeFormula = function () {
    let combatant = this.actor;
    if (combatant.data.type == "pc") {
      return "1d20";
    } else if (combatant.data.type == "npc" || combatant.data.type == "companion") {
      return String(combatant.system.basic.level * 3) + " + @settings.initiative.initiativeBonus - 0.5";
    } else if (combatant.data.type == "community" && combatant.hasPlayerOwner) {
      return String(combatant.system.basic.rank * 3) + " + @settings.initiative.initiativeBonus";
    } else if (combatant.data.type == "community" && !combatant.hasPlayerOwner) {
      return String(combatant.system.basic.rank * 3) + " + @settings.initiative.initiativeBonus - 0.5";
    } else {
      if (combatant.system.basic.level >= 1) {
        return String(combatant.system.basic.level * 3) + "- 0.5";
      } else {
        return String(combatant.system.basic.level * 3)
      }
    }
  }
}