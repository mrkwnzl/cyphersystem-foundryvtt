/**
 * A simple and flexible system for world-building using an arbitrary collection of character and item attributes
 * Author: Atropos
 * Software License: GNU GPLv3
 */

// Import Modules
import { CypherActor } from "./actor.js";
import { CypherItemSheet } from "./item-sheet.js";
import { CypherActorSheet } from "./actor-sheet.js";
import { CypherNPCSheet } from "./NPC-sheet.js";
import { CypherTokenSheet } from "./token-sheet.js";
import { CypherCommunitySheet } from "./community-sheet.js";
import { CypherCompanionSheet } from "./companion-sheet.js";


/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log(`Initializing Cypher System`);

	/**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
	CONFIG.Combat.initiative = {
	  formula: "d20 + @settings.initiative.initiativeBonus",
    decimals: 2
  };

	// Define custom Entity classes
  CONFIG.Actor.entityClass = CypherActor;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cypher", CypherActorSheet, {types: ['PC'], makeDefault: true});
  Actors.registerSheet("cypher", CypherNPCSheet, {types: ['NPC'], makeDefault: false});
  Actors.registerSheet("cypher", CypherTokenSheet, {types: ['Token'], makeDefault: false});
  Actors.registerSheet("cypher", CypherCommunitySheet, {types: ['Community'], makeDefault: false});
  Actors.registerSheet("cypher", CypherCompanionSheet, {types: ['Companion'], makeDefault: false});
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cypher", CypherItemSheet, {makeDefault: true});
});

Hooks.on("preCreateItem", (itemData) => {
    if (!itemData.img) itemData.img = `systems/cyphersystem/icons/items/${itemData.type}.svg`;
});

Hooks.on("preCreateOwnedItem", (actor, itemData) => {
    if (!itemData.img) itemData.img = `systems/cyphersystem/icons/items/${itemData.type}.svg`;
});

// Hooks.on("preUpdateItem", (itemData) => {
//     itemData.img = `systems/cyphersystem/icons/items/${itemData.type}.svg`;
// });
//
// Hooks.on("preUpdateOwnedItem", (actor, itemData) => {
//     itemData.img = `systems/cyphersystem/icons/items/${itemData.type}.svg`;
// });