/**
* A simple and flexible system for world-building using an arbitrary collection of character and item attributes
* Author: Atropos
* Software License: GNU GPLv3
*/

// Import Modules
import { CypherActor } from "./actor.js";
import { CypherItem } from "./item.js";
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
    
    game.cyphersystem = {
        CypherActor,
        CypherItem,
        quickRollMacro,
        easedRollMacro,
        hinderedRollMacro,
        easedRollEffectiveMacro,
        hinderedRollEffectiveMacro,
        diceRollMacro,
        recoveryRollMacro
    };

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
    CONFIG.Item.entityClass = CypherItem;

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

Hooks.once("ready", async function() {
    // Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
    Hooks.on("hotbarDrop", (bar, data, slot) => createCyphersystemMacro(data, slot));
});

Hooks.on("preCreateItem", (itemData) => {
    if (!itemData.img) itemData.img = `systems/cyphersystem/icons/items/${itemData.type}.svg`;
});

Hooks.on("preCreateOwnedItem", (actor, itemData) => {
    if (!itemData.img) itemData.img = `systems/cyphersystem/icons/items/${itemData.type}.svg`;
});

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

    if (actorData.type == "PC" || actorData.type == "Community") {
        mergeObject(actorData, {
            "token.displayName": CONST.TOKEN_DISPLAY_MODES.HOVER,
            "token.actorLink": true
        })
    }

    if (actorData.type == "Token")
    mergeObject(actorData, {
        "token.displayName": CONST.TOKEN_DISPLAY_MODES.HOVER
    })
})

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
    if (!("data" in data)) return ui.notifications.warn("You can only create macro buttons for owned Items");
    const item = data.data;

    // Create the macro command
    const command = `game.cyphersystem.quickRollMacro("${item.name}");`;
    let macro = game.macros.entities.find(m => (m.name === item.name) && (m.command === command));
    if (!macro) {
        macro = await Macro.create({
            name: item.name,
            type: "script",
            img: item.img,
            command: command,
            flags: { "cyphersystem.itemMacro": true }
        });
    }
    game.user.assignHotbarMacro(macro, slot);
    return false;
}

/* -------------------------------------------- */
/*  Macros                                      */
/* -------------------------------------------- */

function quickRollMacro(title) {
    let roll = new Roll("d20").roll();
    let difficulty = Math.floor(roll.result / 3);
    let effect = "";

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

    let flavor = "<b>" + title + "</b>" + "<br>Beats Difficulty " + difficulty + "<br>" + effect;

    roll.toMessage({
        speaker: ChatMessage.getSpeaker(),
        flavor: flavor
    });
}

function easedRollMacro() {
    let roll = new Roll("d20");
    showDialog();

    function showDialog(){
        let d = new Dialog({
            title: "Eased Stat Roll",
            content: "<b>" + "Eased by: " + "</b><input style='width: 50px;margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=1 data-dtype='Number'/>",
            buttons: {
                roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Roll",
                    callback: (html) => statRoll(html.find('input').val())
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
        
    function statRoll(eased){
        roll.roll();
        let difficulty = Math.floor(roll.result / 3);
        let effect = ""; 
        let easedBy = "";

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

        if (eased > 1) {
            easedBy = ", eased by " + eased + " steps";
        } else if (eased == 1) {
            easedBy = ", eased"
        }

        let flavor = "<b>Stat Roll</b>" + easedBy + "<br>Beats Difficulty " + difficulty + "<br>" + effect;

        roll.toMessage({
            speaker: ChatMessage.getSpeaker(),
            flavor: flavor
        });       
    }
}

function hinderedRollMacro() {
    let roll = new Roll("d20");
    showDialog();

    function showDialog(){
        let d = new Dialog({
            title: "Hindered Stat Roll",
            content: "<b>" + "Hindered by: " + "</b><input style='width: 50px;margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=1 data-dtype='Number'/>",
            buttons: {
                roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Roll",
                    callback: (html) => statRoll(html.find('input').val())
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
        
    function statRoll(eased){
        roll.roll();
        let difficulty = Math.floor(roll.result / 3);
        let effect = ""; 
        let easedBy = "";

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

        if (eased > 1) {
            easedBy = ", hindered by " + eased + " steps";
        } else if (eased == 1) {
            easedBy = ", hindered"
        }

        let flavor = "<b>Stat Roll</b>" + easedBy + "<br>Beats Difficulty " + difficulty + "<br>" + effect

        roll.toMessage({
            speaker: ChatMessage.getSpeaker(),
            flavor: flavor
        });       
    }
}

function easedRollEffectiveMacro() {
    let roll = new Roll("d20");
    showDialog();

    function showDialog(){
        let d = new Dialog({
            title: "Eased Stat Roll",
            content: "<b>" + "Eased by: " + "</b><input style='width: 50px;margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=1 data-dtype='Number'/>",
            buttons: {
                roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Roll",
                    callback: (html) => statRoll(html.find('input').val())
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
        
    function statRoll(eased){
        roll.roll();
        let dice = "d20";
        let beats = ", beats Difficulty ";
        let difficulty = Math.floor(roll.result / 3);
        let difficultyTotal = difficulty + parseInt(eased);
        let effect = ""; 
        let easedBy = "";

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

        if (eased > 1) {
            easedBy = ", eased by " + eased + " steps";
        } else if (eased == 1) {
            easedBy = ", eased"
        }

        let flavor = "<b>Stat Roll</b>" + easedBy + "<br>Beats Difficulty " + difficultyTotal + " (" + difficulty + "+" + eased +")" + "<br>" + effect

        roll.toMessage({
            speaker: ChatMessage.getSpeaker(),
            flavor: flavor
        });       
    }
}

function hinderedRollEffectiveMacro() {
    let roll = new Roll("d20");
    showDialog();

    function showDialog(){
        let d = new Dialog({
            title: "Hindered Stat Roll",
            content: "<b>" + "Hindered by: " + "</b><input style='width: 50px;margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=1 data-dtype='Number'/>",
            buttons: {
                roll: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Roll",
                    callback: (html) => statRoll(html.find('input').val())
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
        
    function statRoll(eased){
        roll.roll();
        let difficulty = Math.floor(roll.result / 3);
        let difficultyTotal = difficulty - parseInt(eased);
        let effect = ""; 
        let easedBy = "";

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

        if (eased > 1) {
            easedBy = ", hindered by " + eased + " steps";
        } else if (eased == 1) {
            easedBy = ", hindered"
        }

        let flavor = "<b>Stat Roll</b>" + easedBy + "<br>Beats Difficulty " + difficultyTotal + " (" + difficulty + "-" + eased +")" + "<br>" + effect

        roll.toMessage({
            speaker: ChatMessage.getSpeaker(),
            flavor: flavor
        });       
    }
}

function diceRollMacro(dice) {
    let roll = new Roll(dice).roll();

    roll.toMessage({
        speaker: ChatMessage.getSpeaker(),
        flavor: "<b>" + dice + " Roll</b>"
    });
}

function recoveryRollMacro(recoveryRoll) {
    let roll = new Roll(recoveryRoll).roll();

    roll.toMessage({
        speaker: ChatMessage.getSpeaker(),
        flavor: "<b>Recovery Roll</b>"
    });
}