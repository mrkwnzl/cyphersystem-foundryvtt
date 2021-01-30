// Import Modules
import {CypherActor} from "./actor.js";
import {CypherItem} from "./item.js";
import {CypherItemSheet} from "./item-sheet.js";
import {CypherActorSheet} from "./actor-sheet.js";
import {CypherNPCSheet} from "./NPC-sheet.js";
import {CypherTokenSheet} from "./token-sheet.js";
import {CypherCommunitySheet} from "./community-sheet.js";
import {CypherCompanionSheet} from "./companion-sheet.js";
import {CypherVehicleSheet} from "./vehicle-sheet.js";


/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once("init", async function() {
  console.log(`Initializing Cypher System`);

  CONFIG.debug.hooks = true;

  game.cyphersystem = {
    CypherActor,
    CypherItem,
    quickRollMacro,
    easedRollMacro,
    hinderedRollMacro,
    easedRollEffectiveMacro,
    hinderedRollEffectiveMacro,
    diceRollMacro,
    recoveryRollMacro,
    spendEffortMacro,
    itemRollMacro,
    allInOneRollMacro,
    allInOneRollDialog
  };

  // Register system settings
  game.settings.register("cyphersystem", "effectiveDifficulty", {
    name: "Roll Macros Use Effective Difficulty",
    hint: "With this setting, the steps eased or hindered for roll macros are added and subtracted from the difficulty, respectively. In effect, this gives the effective difficulty that gets beaten by the roll. For example, if you roll a 9 on a roll that is eased by one step, the macro tells you that you beat difficulty 4 (3+1). If you were hindered, it would have told you that you beat difficulty 2 (3-1) instead. With this option deactivated, it will tell you that you have beaten difficulty 3.",
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });

  game.settings.register("cyphersystem", "itemMacrosUseAllInOne", {
    name: "Item Macros Use All-in-One Dialog",
    hint: "With this setting, the item macros created by dragging an item to the macro bar uses the All-in-One Roll macro instead of the Quick Roll macro.",
    scope: "world",
    type: Boolean,
    default: false,
    config: true
  });

  // Set an initiative formula for the system
  CONFIG.Combat.initiative = {
    formula: "1d20 + @settings.initiative.initiativeBonus",
    decimals: 2
  };
  Combat.prototype._getInitiativeFormula = _getInitiativeFormula;

  // Define custom Entity classes
  CONFIG.Actor.entityClass = CypherActor;
  CONFIG.Item.entityClass = CypherItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cypher", CypherActorSheet, {types: ['PC'], makeDefault: true});
  Actors.registerSheet("cypher", CypherNPCSheet, {types: ['NPC'], makeDefault: false});
  Actors.registerSheet("cypher", CypherTokenSheet, {types: ['Token'], makeDefault: false});
  Actors.registerSheet("cypher", CypherCommunitySheet, {types: ['Community'], makeDefault: false});
  Actors.registerSheet("cypher", CypherCompanionSheet, {types: ['Companion'], makeDefault: false});
  Actors.registerSheet("cypher", CypherVehicleSheet, {types: ['Vehicle'], makeDefault: false});
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cypher", CypherItemSheet, {makeDefault: true});

  //Pre-load HTML templates
  preloadHandlebarsTemplates();
});

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    "systems/cyphersystem/templates/equipment.html",
    "systems/cyphersystem/templates/equipment-settings.html",
    "systems/cyphersystem/templates/skills.html",
    "systems/cyphersystem/templates/skillsSortedByRating.html",
    "systems/cyphersystem/templates/teenSkills.html",
    "systems/cyphersystem/templates/teenSkillsSortedByRating.html",
    "systems/cyphersystem/templates/currenciesUpToThree.html",
    "systems/cyphersystem/templates/currenciesUpToSix.html",
    "systems/cyphersystem/templates/abilities.html",
    "systems/cyphersystem/templates/teenAbilities.html",
    "systems/cyphersystem/templates/equipment.html",
    "systems/cyphersystem/templates/ammo.html",
    "systems/cyphersystem/templates/armor.html",
    "systems/cyphersystem/templates/armorTotal.html",
    "systems/cyphersystem/templates/armorWithoutTotal.html",
    "systems/cyphersystem/templates/artifacts.html",
    "systems/cyphersystem/templates/cyphers.html",
    "systems/cyphersystem/templates/materials.html",
    "systems/cyphersystem/templates/oddities.html",
    "systems/cyphersystem/templates/teenArmor.html"
  ];
  return loadTemplates(templatePaths);
}

Hooks.once("ready", async function() {
  // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
  Hooks.on("hotbarDrop", (bar, data, slot) => createCyphersystemMacro(data, slot));

  // Calculate totalModified for existing characters
  for (let a of game.actors.entities) {
    for (let i of a.data.items) {
      if (i.type == "attack" || i.type == "teen Attack") {
        if (i.data.totalModified == "") {
          let skillRating = 0;
          let modifiedBy = i.data.modifiedBy;
          let totalModifier = 0;
          let totalModified = "";

          if (i.data.skillRating == "Inability") skillRating = -1;
          if (i.data.skillRating == "Trained") skillRating = 1;
          if (i.data.skillRating == "Specialized") skillRating = 2;

          if (i.data.modified == "hindered") modifiedBy = modifiedBy * -1;

          totalModifier = skillRating + modifiedBy;

          if (totalModifier == 1) totalModified = "eased";
          if (totalModifier >= 2) totalModified = "eased by " + totalModifier + " steps";
          if (totalModifier == -1) totalModified = "hindered";
          if (totalModifier <= -2) totalModified = "hindered by " + Math.abs(totalModifier) + " steps";

          i.data.totalModified = totalModified;

          a.updateEmbeddedEntity('OwnedItem', i)
        }
      }
    }
  }
});

Hooks.on("preCreateItem", (itemData) => {
  if (!itemData.img) itemData.img = `systems/cyphersystem/icons/items/${itemData.type}.svg`;
});

Hooks.on("preCreateOwnedItem", (actor, itemData) => {
  if (!itemData.img) itemData.img = `systems/cyphersystem/icons/items/${itemData.type}.svg`;
});

const _getInitiativeFormula = function(combatant) {
  if (combatant.actor.data.type == "PC") {
    return "1d20 + @settings.initiative.initiativeBonus";
  } else if (combatant.actor.data.type == "NPC" || combatant.actor.data.type == "Companion") {
    return String(combatant.actor.data.data.level * 3) + " + @settings.initiative.initiativeBonus";
  } else if (combatant.actor.data.type == "Community") {
    return String(combatant.actor.data.data.rank * 3) + " + @settings.initiative.initiativeBonus";
  } else {
    return String(combatant.actor.data.data.level * 3);
  }
}

/**
* Set default values for new actors' tokens
*/
Hooks.on("preCreateActor", (actorData) => {
  if (!actorData.img) actorData.img = `systems/cyphersystem/icons/actors/${actorData.type}.svg`;

  if (actorData.type == "NPC")
  mergeObject(actorData, {
    "token.bar1": {"attribute": "health"},
    "token.bar2": {"attribute": "level"},
    "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
    "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
  })

  if (actorData.type == "Companion")
  mergeObject(actorData, {
    "token.bar1": {"attribute": "health"},
    "token.bar2": {"attribute": "level"},
    "token.displayName": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
    "token.displayBars": CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
    "token.actorLink": true
  })

  if (actorData.type == "PC" || actorData.type == "Community")
  mergeObject(actorData, {
    "token.displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
    "token.actorLink": true
  })

  if (actorData.type == "Token")
  mergeObject(actorData, {
    "token.displayName": CONST.TOKEN_DISPLAY_MODES.HOVER
  })
})

Hooks.on("preCreateToken", function(_scene, data) {
  if (!data.actorId) return;
  console.log(data.actorId);
  let actor = game.actors.get(data.actorId);
  if (actor.data.type === "PC") {
    setProperty(data, "flags.barbrawl.resourceBars", {
      "bar1": {
        id: "bar1",
        mincolor: "#0000FF",
        maxcolor: "#0000FF",
        position: "bottom-inner",
        attribute: "pools.intellect",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      },
      "bar2": {
        id: "bar2",
        mincolor: "#00FF00",
        maxcolor: "#00FF00",
        position: "bottom-inner",
        attribute: "pools.speed",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      },
      "bar3": {
        id: "bar3",
        mincolor: "#FF0000",
        maxcolor: "#FF0000",
        position: "bottom-inner",
        attribute: "pools.might",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      }
    })
  } else if (actor.data.type === "NPC" || actor.data.type === "NPC") {
    setProperty(data, "flags.barbrawl.resourceBars", {
      "bar1": {
        id: "bar1",
        mincolor: "#0000FF",
        maxcolor: "#0000FF",
        position: "top-inner",
        attribute: "level",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      },
      "bar2": {
        id: "bar2",
        mincolor: "#FF0000",
        maxcolor: "#FF0000",
        position: "bottom-inner",
        attribute: "health",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      }
    })
  } else if (actor.data.type === "Community") {
    setProperty(data, "flags.barbrawl.resourceBars", {
      "bar1": {
        id: "bar1",
        mincolor: "#0000FF",
        maxcolor: "#0000FF",
        position: "top-inner",
        attribute: "rank",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      },
      "bar2": {
        id: "bar2",
        mincolor: "#0000FF",
        maxcolor: "#0000FF",
        position: "bottom-inner",
        attribute: "infrastructure",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      },
      "bar3": {
        id: "bar3",
        mincolor: "#FF0000",
        maxcolor: "#FF0000",
        position: "bottom-inner",
        attribute: "health",
        visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
      }
    })
  }
});

Hooks.on("updateCombat", function() {
  let combatant = game.combat.combatant;

  if (combatant.actor.data.type == "Token" && combatant.actor.data.data.settings.isCounter == true && combatant.actor.data.data.settings.counting == "down") {
    let token = canvas.tokens.ownedTokens.filter(el => el.actor.data._id == combatant.actor.data._id)[0];
    let newQuantity = token.actor.data.data.quantity.value - 1;
    token.update({"actorData.data.quantity.value": newQuantity});
  } else if (combatant.actor.data.type == "Token" && combatant.actor.data.data.settings.isCounter == true && combatant.actor.data.data.settings.counting == "up") {
    let token = canvas.tokens.ownedTokens.filter(el => el.actor.data._id == combatant.actor.data._id)[0];
    let newQuantity = token.actor.data.data.quantity.value + 1;
    token.update({"actorData.data.quantity.value": newQuantity});
  }
});

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
* Create a Macro from an Item drop.
* Get an existing item macro if one exists, otherwise create a new one.
* @param {Object} data     The dropped data
* @param {number} slot     The hotbar slot to use
* @returns {Promise}
*/
async function createCyphersystemMacro(data, slot) {
  if (data.type !== "Item") return;
  if (!("data" in data)) return ui.notifications.warn("You can only create macros for owned Items.");
  const item = data.data;

  // Create the macro command
  const command = `// Change the defaults for the macro dialog.
// Some values are overwritten by the items and can’t be changed.
// Change the values after the equal sign.
// Keep the quotation marks where there are any.

// What Pool is used to pay the cost?
// Might, Speed, or Intellect?
// Abilities overwrite this value.
let pool = "Might";

// What is the skill level?
// Inability, Practiced, Trained, or Specialized?
// Skills and Attacks overwrite this value.
let skill = "Practiced";

// How many assets do you have?
// 0, 1, or 2?
let assets = 0;

// How many levels of Effort to ease the task?
// 0, 1, 2, 3, 4, 5, or 6?
let effortTask = 0;

// How many levels of Effort for other uses?
// 0, 1, 2, 3, 4, 5, or 6?
let effortOther = 0;

// How many steps is the roll eased or hindered (excl. Effort)?
// Eased: positive value. Hindered: negative value.
// Cannot be changed for Attacks and Power Shifts.
let modifier = 0;

// How many additional Pool points does it cost (excl. Effort)?
// Abilities overwrite this value.
let poolPointCost = 0;

// How much damage?
// Attacks overwrite this value.
let damage = 0;

// How many levels of Effort for extra damage?
// 0, 1, 2, 3, 4, 5, or 6?
let effortDamage = 0;

// How much extra damage per level of Effort?
// Generally, this is 3.
// Area attacks usually only deal 2 points of damage per level.
let damagePerLevel = 3;


// Do not change anything below

game.cyphersystem.itemRollMacro(actor, "${item._id}", pool, skill, assets, effortTask, effortOther, modifier, poolPointCost, damage, effortDamage, damagePerLevel);`;

  let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: "script",
      img: item.img,
      command: command,
      flags: {"cyphersystem.itemMacro": true}
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/* -------------------------------------------- */
/*  Macros                                      */
/* -------------------------------------------- */

// Background functions
function diceRoller(title, info, modifier) {
  let roll = new Roll("1d20").roll();
  let difficulty = Math.floor(roll.result / 3);
  let difficultyResult = determineDifficultyResult(roll, difficulty, modifier);
  let effect = "";
  let modifiedBy = "";

  if (roll.result == 1) {
    effect = "<span style='color:red'><b>GM Intrusion!</b></span>";
  } else if (roll.result == 17) {
    effect = "<span style='color:blue'><b>+1 Damage</b></span>"
  } else if (roll.result == 18) {
    effect = "<span style='color:blue'><b>+2 Damage</b></span>"
  } else if (roll.result == 19) {
    effect = "<span style='color:green'><b>Minor Effect or +3 Damage</b></span>"
  } else if (roll.result == 20) {
    effect = "<span style='color:green'><b>Major Effect or +4 Damage</b></span>"
  }

  if (modifier > 1) {
    modifiedBy = "Eased by " + modifier + " steps. "
  } else if (modifier == 1) {
    modifiedBy = "Eased. "
  } else if (modifier == -1) {
    modifiedBy = "Hindered. "
  } else if (modifier < -1) {
    modifiedBy = "Hindered by " + Math.abs(modifier) + " steps. "
  }

  if (info != "") {
    info = "<hr style='margin-top: 1px; margin-bottom: 2px;'>" + info + "<hr style='margin-top: 1px; margin-bottom: 2px;'>"
  } else {
    info = "<hr style='margin-top: 1px; margin-bottom: 2px;'>"
  }

  let flavor = "<b>" + title + "</b>" + info + modifiedBy + "Beats difficulty " + difficultyResult + "<br>" + effect;

  roll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: flavor
  });
}

function determineDifficultyResult(roll, difficulty, modifier) {
  let symbol = "+";

  if (!game.settings.get("cyphersystem", "effectiveDifficulty")) {
    return difficulty;
  } else {
    let difficultyTotal = difficulty + parseInt(modifier);
    if (modifier < 0) {
      symbol = "-"
    }
    return difficultyTotal + " (" + difficulty + symbol + Math.abs(modifier) + ")";
  }
}

// Macros
function quickRollMacro(title) {
  diceRoller(title, "", 0, 0)
}

function easedRollMacro() {
  let d = new Dialog({
    title: "Eased Stat Roll",
    content: `<div align="center"><label style='display: inline-block; text-align: right'><b>Eased by: </b></label>
    <input style='width: 50px; margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=1 data-dtype='Number'/></div>`,
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: "Roll",
        callback: (html) => diceRoller("Stat Roll", "", html.find('input').val(), 0)
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel",
        callback: () => { }
      }
    },
    default: "roll",
    close: () => { }
  });
  d.render(true);
}

function hinderedRollMacro() {
  let d = new Dialog({
    title: "Hindered Stat Roll",
    content: `<div align="center"><label style='display: inline-block; text-align: right'><b>Hindered by: </b></label>
    <input style='width: 50px; margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=1 data-dtype='Number'/></div>`,
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: "Roll",
        callback: (html) => diceRoller("Stat Roll", "", html.find('input').val()*-1, 0)
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel",
        callback: () => { }
      }
    },
    default: "roll",
    close: () => { }
  });
  d.render(true);
}

function easedRollEffectiveMacro() {
  ui.notifications.warn(`This macro has been deprecated. Use the “Eased Roll” macro and the system setting “Roll Macros Use Effective Difficulty” instead.`)
}

function hinderedRollEffectiveMacro() {
  ui.notifications.warn(`This macro has been deprecated. Use the “Hindered Roll” macro and the system setting “Roll Macros Use Effective Difficulty” instead.`)
}

function diceRollMacro(dice) {
  if (dice.charAt(0) == "d") dice = "1" + dice;

  let roll = new Roll(dice).roll();

  roll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: "<b>" + dice + " Roll</b>"
  });
}

function recoveryRollMacro(actor) {
  if (actor && actor.data.type == "PC") {
    let roll = new Roll(actor.data.data.recoveries.recoveryRoll).roll();

    roll.toMessage({
      speaker: ChatMessage.getSpeaker(),
      flavor: "<b>Recovery Roll</b>"
    });
  } else {
    ui.notifications.warn(`This macro only applies to PCs.`)
  }
}

function spendEffortMacro(actor) {
  if (actor.data.data.damage.damageTrack == "Debilitated") return ui.notifications.warn(`Debilitated PCs can’t spend Effort.`)

  if (actor && actor.data.type == "PC") {
    let d = new Dialog({
      title: "Spend Effort",
      content: `<div align="center">
      <label style='display: inline-block; width: 98px; text-align: right'><b>Pool: </b></label>
      <select name='pool' id='pool' style='width: 75px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
      <option value='Might'>Might</option><option value='Speed'>Speed</option>
      <option value='Intellect'>Intellect</option>
      </select><br>
      <label style='display: inline-block; width: 98px; text-align: right'><b>Levels of Effort: </b></label>
      <input name='level' id='level' style='width: 75px; margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=1 data-dtype='Number'/></div>`,
      buttons: {
        roll: {
          icon: '<i class="fas fa-check"></i>',
          label: "Apply",
          callback: (html) => applyToPool(html.find('select').val(), html.find('input').val())
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel",
          callback: () => { }
        }
      },
      default: "roll",
      close: () => { }
    });
    d.render(true);

    function applyToPool(pool, level) {
      let cost;
      let impaired = 0;

      if (actor.data.data.damage.damageTrack == "Impaired") impaired = level;

      if (pool == "Might") {
        cost = (level * 2) + 1 + parseInt(impaired) - actor.data.data.pools.mightEdge;
      } else if (pool == "Intellect") {
        cost = (level * 2) + 1 + parseInt(impaired) - actor.data.data.pools.intellectEdge;
      } else if (pool == "Speed") {
        cost = (level * 2) + 1 + (level * actor.data.data.armor.speedCostTotal) + parseInt(impaired) - actor.data.data.pools.speedEdge;
      }

      payPoolPoints(actor, cost, pool);
    }
  } else {
    ui.notifications.warn(`This macro only applies to PCs.`)
  }
}

function allInOneRollMacro(actor, title, info, cost, pool, modifier) {
  if (!actor || actor.data.type != "PC") {
    return ui.notifications.warn(`This macro only applies to PCs.`)
  }

  if (actor.data.data.damage.damageTrack == "Debilitated") return ui.notifications.warn(`Debilitated PCs may not take actions.`)

  const pointsPaid = payPoolPoints(actor, cost, pool);
  if (pointsPaid == true) diceRoller(title, info, modifier);
}

function payPoolPoints(actor, cost, pool){
  pool = pool.toLowerCase();

  if (pool == "might") {
    if (cost < 0) cost = 0;
    if (cost > actor.data.data.pools.might.value) {
      ui.notifications.notify(`You don’t have enough Might points.`);
      return false;
    }
    let newMight = actor.data.data.pools.might.value - cost;
    actor.update({"data.pools.might.value": newMight})
  } else if (pool == "speed") {
    if (cost < 0) cost = 0;
    if (cost > actor.data.data.pools.speed.value) {
      ui.notifications.notify(`You don’t have enough Speed points.`);
      return false;
    }
    let newSpeed = actor.data.data.pools.speed.value - cost;
    actor.update({"data.pools.speed.value": newSpeed})
  } else if (pool == "intellect") {
    if (cost < 0) cost = 0;
    if (cost > actor.data.data.pools.intellect.value) {
      ui.notifications.notify(`You don’t have enough Intellect points.`);
      return false;
    }
    let newIntellect = actor.data.data.pools.intellect.value - cost;
    actor.update({"data.pools.intellect.value": newIntellect})
  }

  return true;
}

function allInOneRollDialog(actor, pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE) {
  if (!actor || actor.data.type != "PC") {
    return ui.notifications.warn(`This macro only applies to PCs.`)
  }

  if (actor.data.data.damage.damageTrack == "Debilitated") return ui.notifications.warn(`Debilitated PCs may not take actions.`)

  if (!damage) damage = 0;
  if (!damagePerLOE) damagePerLOE = 3;

  let d = new Dialog({
    title: "All-in-One Roll",
    content: createContent(actor, pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE),
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: "Roll",
        callback: (html) => {
          applyToMacro(html.find('#pool').val(), html.find('#skill').val(), html.find('#assets').val(), html.find('#effort1').val(), html.find('#effort2').val(), html.find('#additionalCost').val(), html.find('#additionalSteps').val(), html.find('#stepModifier').val(), title, html.find('#damage').val(), html.find('#effort3').val(), html.find('#damagePerLOE').val());
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel",
        callback: () => { }
      }
    },
    default: "roll",
    close: () => { }
  });
  d.render(true);

  function applyToMacro(pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE) {
    let cost = parseInt(additionalCost);
    let effort = parseInt(effort1) + parseInt(effort2) + parseInt(effort3);
    if (stepModifier == "hindered") additionalSteps = parseInt(additionalSteps) * -1;
    let modifier = parseInt(skill) + parseInt(assets) + parseInt(effort1) + parseInt(additionalSteps);
    let skillRating = "Practiced";
    let steps = " steps";
    let points = " points";
    let rollEffort = " levels";
    let otherEffort = " levels";
    let damageEffortLevel = " levels";
    let attackModifier = "";
    let damageEffort = parseInt(damagePerLOE) * parseInt(effort3);
    let totalDamage = parseInt(damage) + parseInt(damageEffort);

    if (skill == 2) skillRating = "Specialized";
    if (skill == 1) skillRating = "Trained";
    if (skill == -1) skillRating = "Inability";

    if (effort > actor.data.data.basic.effort) {
      additionalSteps = Math.abs(additionalSteps);
      allInOneRollDialog(actor, pool, skillRating, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier);
      return ui.notifications.notify(`You tried to apply more Effort than your Effort score allows.`);
    }

    let armorCost = 0;

    if (pool == "Speed") armorCost = parseInt(effort) * parseInt(actor.data.data.armor.speedCostTotal);

    let edge = 0;

    if (pool == "Might") {
      edge = actor.data.data.pools.mightEdge;
    } else if (pool == "Speed") {
      edge = actor.data.data.pools.speedEdge;
    } else if (pool == "Intellect") {
      edge = actor.data.data.pools.intellectEdge;
    }

    let impaired = 0;

    if (actor.data.data.damage.damageTrack == "Impaired") impaired = effort;

    if (effort > 0) {
      cost = (effort * 2) + 1 + parseInt(additionalCost) + parseInt(armorCost) - edge + parseInt(impaired);
    } else {
      cost = parseInt(additionalCost) - edge;
    }

    if (cost < 0) cost = 0;

    if (pool == "Might" && cost > actor.data.data.pools.might.value || pool == "Speed" && cost > actor.data.data.pools.speed.value || pool == "Intellect" && cost > actor.data.data.pools.intellect.value) {
      additionalSteps = Math.abs(additionalSteps);
      allInOneRollDialog(actor, pool, skillRating, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier);
      return ui.notifications.notify(`You don’t have enough ${pool} points.`);
    }

    if (additionalSteps == 1 || additionalSteps == -1) steps = " step";

    if (cost == 1) points = " point";

    if (title == "") title = pool + " Roll";

    if (effort1 == 1) rollEffort = " level";

    if (effort2 == 1) otherEffort = " level";

    if (damageEffort == 1) damageEffortLevel = " level";

    if (damage != 0 || effort3 != 0) {
      attackModifier = "<hr style='margin-top: 1px; margin-bottom: 2px;'>Effort for extra damage: " + effort3 + damageEffortLevel + "<br>Damage: " + totalDamage + " (" + damage + "+" + damageEffort + ")" + "<hr style='margin-top: 1px; margin-bottom: 2px;'>";
    } else {
      attackModifier = "<hr style='margin-top: 1px; margin-bottom: 2px;'>"
    }

    let info = "Skill level: " + skillRating + "<br>" + "Assets: " + assets + "<br>" + "Effort to ease task: " + effort1 + rollEffort + "<br>" + "Effort for other uses: " + effort2 + otherEffort + attackModifier + "Difficulty: " + titleCase(stepModifier) + " by " + Math.abs(additionalSteps) + " additional " + steps + "<br>" + "Total cost: " + cost + " " + pool + points

    allInOneRollMacro(actor, title, info, cost, pool, modifier);
  }
}

function createContent(actor, pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE) {
  let content = `<div align="center">
  <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>Basic Modifiers</b></label><br>
  <label style='display: inline-block; width: 170px; text-align: right'>Pool:</label>
  <select name='pool' id='pool' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value='Might' ${(pool == "Might" ? "selected" : "")}>Might</option>
  <option value='Speed' ${(pool == "Speed" ? "selected" : "")}>Speed</option>
  <option value='Intellect' ${(pool == "Intellect" ? "selected" : "")}>Intellect</option>
  </select><br>
  <label style='display: inline-block; width: 170px; text-align: right'>Skill level:</label>
  <select name='skill' id='skill' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  {{#select skill}}
  <option value=-1 ${(skill == "Inability" ? "selected" : "")}>Inability</option>
  <option value=0 ${(skill == "Practiced" ? "selected" : "")}>Practiced</option>
  <option value=1 ${(skill == "Trained" ? "selected" : "")}>Trained</option>
  <option value=2 ${(skill == "Specialized" ? "selected" : "")}>Specialized</option>
  {{/select}}
  </select><br>
  <label style='display: inline-block; width: 170px; text-align: right'>Assets:</label>
  <select name='assets' id='assets' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value=0 ${(assets == 0 ? "selected" : "")}>0</option>
  <option value=1 ${(assets == 1 ? "selected" : "")}>1</option>
  <option value=2 ${(assets == 2 ? "selected" : "")}>2</option>
  </select><br>
  <label style='display: inline-block; width: 170px; text-align: right'>Effort to ease the task:</label>
  <select name='effort1' id='effort1' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value=0 ${(effort1 == 0 ? "selected" : "")}>None</option>
  <option value=1 ${(effort1 == 1 ? "selected" : "")}>1 level</option>
  <option value=2 ${(effort1 == 2 ? "selected" : "")}>2 levels</option>
  <option value=3 ${(effort1 == 3 ? "selected" : "")}>3 levels</option>
  <option value=4 ${(effort1 == 4 ? "selected" : "")}>4 levels</option>
  <option value=5 ${(effort1 == 5 ? "selected" : "")}>5 levels</option>
  <option value=6 ${(effort1 == 6 ? "selected" : "")}>6 levels</option>
  </select><br>
  <label style='display: inline-block; width: 170px; text-align: right'>Effort for other uses:</label>
  <select name='effort2' id='effort2' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value=0 ${(effort2 == 0 ? "selected" : "")}>None</option>
  <option value=1 ${(effort2 == 1 ? "selected" : "")}>1 level</option>
  <option value=2 ${(effort2 == 2 ? "selected" : "")}>2 levels</option>
  <option value=3 ${(effort2 == 3 ? "selected" : "")}>3 levels</option>
  <option value=4 ${(effort2 == 4 ? "selected" : "")}>4 levels</option>
  <option value=5 ${(effort2 == 5 ? "selected" : "")}>5 levels</option>
  <option value=6 ${(effort2 == 6 ? "selected" : "")}>6 levels</option>
  </select><br>
  <hr>
  <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>Attack Modifiers</b></label><br>
  <label style='display: inline-block; width: 170px; text-align: right'>Damage:</label>
  <input name='damage' id='damage' type='number' value=${damage} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center'/><br>
  <label style='display: inline-block; width: 170px; text-align: right'>Effort for extra damage:</label>
  <select name='effort3' id='effort3' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value=0 ${(effort3 == 0 ? "selected" : "")}>None</option>
  <option value=1 ${(effort3 == 1 ? "selected" : "")}>1 level</option>
  <option value=2 ${(effort3 == 2 ? "selected" : "")}>2 levels</option>
  <option value=3 ${(effort3 == 3 ? "selected" : "")}>3 levels</option>
  <option value=4 ${(effort3 == 4 ? "selected" : "")}>4 levels</option>
  <option value=5 ${(effort3 == 5 ? "selected" : "")}>5 levels</option>
  <option value=6 ${(effort3 == 6 ? "selected" : "")}>6 levels</option>
  </select><br>
  <label style='display: inline-block; width: 170px; text-align: right'>Damage per level of Effort:</label>
  <input name='damagePerLOE' id='damagePerLOE' type='number' value=${damagePerLOE} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center'/><br>
  <hr>
  <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>Additional Modifiers</b></label><br>
  <label style='display: inline-block; width: 170px; text-align: right'>Difficulty:</label>
  <select name='stepModifier' id='stepModifier' style='height: 26px; width: 110px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value='eased' ${(stepModifier == 'eased' ? "selected" : "")}>eased by</option>
  <option value='hindered' ${(stepModifier == 'hindered' ? "selected" : "")}>hindered by</option>
  </select>
  <input name='additionalSteps' id='additionalSteps' type='number' value=${additionalSteps} style='width: 57px; margin-left: 0px; margin-bottom: 5px; text-align: center'/><br>
  <label style='display: inline-block; width: 170px; text-align: right'>Pool point cost:</label>
  <input name='additionalCost' id='additionalCost' type='number' value=${additionalCost} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center'/><br>
  <hr>
  <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>Character Info</b></label><br>
  <label style='display: inline-block; width: 170px; text-align: right'>Effort:</label>
  <input name='effort' id='effort' type='number' value=${actor.data.data.basic.effort} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
  <label style='display: inline-block; width: 170px; text-align: right'>Might Pool (Edge):</label>
  <input name='might' id='might' type='text' value='${actor.data.data.pools.might.value}/${actor.data.data.pools.might.max} (${actor.data.data.pools.mightEdge})' style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
  <label style='display: inline-block; width: 170px; text-align: right'>Speed Pool (Edge):</label>
  <input name='speed' id='speed' type='text' value='${actor.data.data.pools.speed.value}/${actor.data.data.pools.speed.max} (${actor.data.data.pools.speedEdge})' style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
  <label style='display: inline-block; width: 170px; text-align: right'>Intellect Pool (Edge):</label>
  <input name='intellect' id='intellect' type='text' value='${actor.data.data.pools.intellect.value}/${actor.data.data.pools.intellect.max} (${actor.data.data.pools.intellectEdge})' style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
  </div>
  `;
  return content;
}

function titleCase (phrase) {
  const words = phrase.split(" ");

  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }

  return words.join(" ");
}

function itemRollMacro (actor, itemID, pool, skill, assets, effort1, effort2, additionalSteps, additionalCost, damage, effort3, damagePerLOE) {
  const owner = game.actors.find(actor => actor.items.get(itemID));
  let pointsPaid = true;

  if (!actor || actor.data.type != "PC") {
    return ui.notifications.warn(`This macro can only be used by ${owner.name}.`)
  }

  const item = actor.getOwnedItem(itemID);

  if (item == null) {
    return ui.notifications.warn(`This macro can only be used by ${owner.name}.`)
  }

  if (game.settings.get("cyphersystem", "itemMacrosUseAllInOne")) {
    if (!skill) skill = "Practiced";
    if (!assets) assets = 0;
    if (!effort1) effort1 = 0;
    if (!effort2) effort2 = 0;
    if (!effort3) effort3 = 0;
    if (!additionalCost) additionalCost = 0;
    if (!additionalSteps) additionalSteps = 0;
    if (!damage) damage = 0;
    if (!pool) pool = "Might";
    if (!damagePerLOE) damagePerLOE = 3;

    let stepModifier = (additionalSteps < 0) ? "hindered" : "eased";

    if (item.type == "skill" || item.type == "teen Skill") {
      skill = item.data.data.skillLevel;
    }

    if (item.type == "power Shift") {
      additionalSteps = item.data.data.powerShiftValue;
    }

    if (item.type == "attack" || item.type == "teen Attack") {
      skill = item.data.data.skillRating;
      additionalSteps = item.data.data.modifiedBy;
      stepModifier = item.data.data.modified;
      damage = item.data.data.damage;
    }

    if (item.type == "ability" || item.type == "teen Ability") {
      pool = item.data.data.costPool;
      let checkPlus = item.data.data.costPoints.slice(-1)
      if (checkPlus == "+") {
        let cost = item.data.data.costPoints.slice(0, -1);
        additionalCost = parseInt(cost);
      } else {
        let cost = item.data.data.costPoints;
        additionalCost = parseInt(cost);
      }
    }

    allInOneRollDialog(actor, pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, item.name, damage, effort3, damagePerLOE)
  } else {
    itemRollMacroQuick(actor, itemID);
  }
}

function itemRollMacroQuick (actor, itemID) {
  const owner = game.actors.find(actor => actor.items.get(itemID));
  const item = actor.getOwnedItem(itemID);

  let info = "";
  let modifier = 0;
  let pointsPaid = true;

  if (item.type == "skill" || item.type == "teen Skill") {
    info = titleCase(item.type) + ". Level: " + item.data.data.skillLevel;
    if (item.data.data.skillLevel == "Inability") modifier = -1;
    if (item.data.data.skillLevel == "Trained") modifier = 1;
    if (item.data.data.skillLevel == "Specialized") modifier = 2;
  } else if (item.type == "power Shift") {
    let name = "Power Shift";
    let shifts = " Shifts";
    if (item.data.data.powerShiftValue == 1) {
      shifts = " Shift"
    }
    if (actor.data.data.settings.powerShifts.powerShiftsName != 0) {
      name = actor.data.data.settings.powerShifts.powerShiftsName.slice(0, -1);
    }
    info = name + ". " + item.data.data.powerShiftValue + shifts;
    modifier = item.data.data.powerShiftValue;
  } else if (item.type == "attack" || item.type == "teen Attack") {
    let modifiedBy = item.data.data.modifiedBy;
    info = titleCase(item.type) + ". Damage: " + item.data.data.damage;
    if (item.data.data.modified == "hindered") modifiedBy = item.data.data.modifiedBy * -1;
    let skillRating = 0;
    if (item.data.data.skillRating == "Inability") skillRating = -1;
    if (item.data.data.skillRating == "Trained") skillRating = 1;
    if (item.data.data.skillRating == "Specialized") skillRating = 2;
    modifier = skillRating + modifiedBy;
  } else if (item.type == "ability" || item.type == "teen Ability") {
    let cost = "";
    if (item.data.data.costPoints != "" && item.data.data.costPoints != "0") {
      let points = " points";
      if (item.data.data.costPoints == "1") points = " point";
      cost = ". Cost: " + item.data.data.costPoints + " " + item.data.data.costPool + points;
    }
    info = titleCase(item.type) + cost
    pointsPaid = payPoolPoints(actor, item.data.data.costPoints, item.data.data.costPool)
  } else if (item.type == "cypher") {
    let level = "";
    if (item.data.data.level != "") level = " Level: " + item.data.data.level;
    info = "Cypher." + level;
  } else if (item.type == "artifact") {
    let level = "";
    if (item.data.data.level != "") level = " Level: " + item.data.data.level + ".";
    info = "Artifact." + level + " Depletion: " + item.data.data.depletion;
  } else {
    info = titleCase(item.type)
  }

  if (pointsPaid == true) {
    diceRoller(item.name, info, modifier, 0);
  }
}
