export async function preloadTemplates() {
  const templatePaths = [
    "systems/cyphersystem/templates/headers/pc-base-info.html",
    "systems/cyphersystem/templates/headers/pc-stats.html",
    "systems/cyphersystem/templates/item-lists/abilities-list-01.html",
    "systems/cyphersystem/templates/item-lists/abilities-list-02.html",
    "systems/cyphersystem/templates/item-lists/abilities-list-03.html",
    "systems/cyphersystem/templates/item-lists/abilities-list-04.html",
    "systems/cyphersystem/templates/item-lists/abilities-list-teen.html",
    "systems/cyphersystem/templates/item-lists/ammo-list.html",
    "systems/cyphersystem/templates/item-lists/armor-list-teen.html",
    "systems/cyphersystem/templates/item-lists/armor-list-total.html",
    "systems/cyphersystem/templates/item-lists/armor-list.html",
    "systems/cyphersystem/templates/item-lists/artifacts-list.html",
    "systems/cyphersystem/templates/item-lists/attacks-list-teen.html",
    "systems/cyphersystem/templates/item-lists/attacks-list.html",
    "systems/cyphersystem/templates/item-lists/cyphers-list.html",
    "systems/cyphersystem/templates/item-lists/equipment-list-01.html",
    "systems/cyphersystem/templates/item-lists/equipment-list-02.html",
    "systems/cyphersystem/templates/item-lists/equipment-list-03.html",
    "systems/cyphersystem/templates/item-lists/equipment-list-04.html",
    "systems/cyphersystem/templates/item-lists/lasting-damage-list-teen.html",
    "systems/cyphersystem/templates/item-lists/lasting-damage-list.html",
    "systems/cyphersystem/templates/item-lists/materials-list.html",
    "systems/cyphersystem/templates/item-lists/oddities-list.html",
    "systems/cyphersystem/templates/item-lists/power-shifts-list.html",
    "systems/cyphersystem/templates/item-lists/recursions-list.html",
    "systems/cyphersystem/templates/item-lists/skills-list-01.html",
    "systems/cyphersystem/templates/item-lists/skills-list-02.html",
    "systems/cyphersystem/templates/item-lists/skills-list-03.html",
    "systems/cyphersystem/templates/item-lists/skills-list-04.html",
    "systems/cyphersystem/templates/item-lists/skills-list-teen.html",
    "systems/cyphersystem/templates/item-lists/spells-list.html",
    "systems/cyphersystem/templates/item-lists/tags-list.html",
    "systems/cyphersystem/templates/tabs/abilities-tab/abilities.html",
    "systems/cyphersystem/templates/tabs/abilities-tab/spells.html",
    "systems/cyphersystem/templates/tabs/combat-tab/ammo.html",
    "systems/cyphersystem/templates/tabs/combat-tab/armor.html",
    "systems/cyphersystem/templates/tabs/combat-tab/attacks.html",
    "systems/cyphersystem/templates/tabs/combat-tab/damage-track.html",
    "systems/cyphersystem/templates/tabs/combat-tab/lasting-damage.html",
    "systems/cyphersystem/templates/tabs/equipment-tab/artifacts.html",
    "systems/cyphersystem/templates/tabs/equipment-tab/currenciesUpToSix.html",
    "systems/cyphersystem/templates/tabs/equipment-tab/currenciesUpToThree.html",
    "systems/cyphersystem/templates/tabs/equipment-tab/currency.html",
    "systems/cyphersystem/templates/tabs/equipment-tab/cyphers.html",
    "systems/cyphersystem/templates/tabs/equipment-tab/equipment.html",
    "systems/cyphersystem/templates/tabs/equipment-tab/materials.html",
    "systems/cyphersystem/templates/tabs/equipment-tab/oddities.html",
    "systems/cyphersystem/templates/tabs/settings-tab/settings-cyphers-and-artifacts.html",
    "systems/cyphersystem/templates/tabs/settings-tab/settings-equipment.html",
    "systems/cyphersystem/templates/tabs/settings-tab/settings-item.html",
    "systems/cyphersystem/templates/tabs/settings-tab/settings-pc.html",
    "systems/cyphersystem/templates/tabs/settings-tab/settings-tag.html",
    "systems/cyphersystem/templates/tabs/skills-tab/power-shifts.html",
    "systems/cyphersystem/templates/tabs/skills-tab/skills.html",
    "systems/cyphersystem/templates/tabs/tags-tab/recursions.html",
    "systems/cyphersystem/templates/tabs/tags-tab/tags.html"
  ];
  return loadTemplates(templatePaths);
}