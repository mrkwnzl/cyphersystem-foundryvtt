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
import { CypherVehicleSheet } from "./vehicle-sheet.js";


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
        recoveryRollMacro,
        spendEffortMacro
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
        "systems/cyphersystem/templates/teenSkillsSortedByRating.html"
    ];
    return loadTemplates(templatePaths);
}

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
    if (actor && actor.data.type == "PC") {
        let d = new Dialog({
            title: "Spend Effort",
            content: "<b>Pool: </b><select name='pool' id='pool'><option value='Might'>Might</option><option value='Speed'>Speed</option><option value='Intellect'>Intellect</option></select>&nbsp;&nbsp;<b>Levels of Effort:</b> <input name='level' id='level' style='width: 50px;margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=1 data-dtype='Number'/>",
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
            if (pool == "Might") {
                let effortValue = (level * 2) + 1 - actor.data.data.pools.mightEdge;
                if (effortValue > actor.data.data.pools.might.value) return ui.notifications.notify(`You don’t have enough Might points.`);
                let newMight = actor.data.data.pools.might.value - effortValue;
                actor.update({"data.pools.might.value": newMight})
            } else if (pool == "Speed") {
                let effortValue = (level * 2) + 1 + (level * actor.data.data.armor.speedCostTotal) - actor.data.data.pools.speedEdge;
                if (effortValue > actor.data.data.pools.speed.value) return ui.notifications.notify(`You don’t have enough Speed points.`);
                let newSpeed = actor.data.data.pools.speed.value - effortValue;
                actor.update({"data.pools.speed.value": newSpeed})
            } else if (pool == "Intellect") {
                let effortValue = (level * 2) + 1 - actor.data.data.pools.intellectEdge;
                if (effortValue > actor.data.data.pools.intellect.value) return ui.notifications.notify(`You don’t have enough Intellect points.`);
                let newintellect = actor.data.data.pools.intellect.value - effortValue;
                actor.update({"data.pools.intellect.value": newintellect})
            }
        }
    } else {
        ui.notifications.warn(`This macro only applies to PCs.`)
    }
}

function allInOneRollMacro(actor) {
    let content = `<b>Pool: </b>
        <select name='pool' id='pool'>
            <option value='Might'>Might</option>
            <option value='Speed'>Speed</option>
            <option value='Intellect'>Intellect</option>
        </select><br>
        <b>Skill Rating: </b>
        <select name='skillRating' id='skillRating'>
            <option value='2'>Specialized</option>
            <option value='1'>Trained</option>
            <option value='0'>Practiced</option>
            <option value='-1'>Inability</option>
        </select><br>
        <b>Assets: </b>
        <select name='assets' id='assets'>
            <option value='0'>0</option>
            <option value='1'>1</option>
            <option value='2'>2</option>
        </select><br>
        <b>Levels of Effort: </b>
        <select name='assets' id='assets'>
            <option value='0'>0</option>
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            <option value='4'>4</option>
            <option value='5'>5</option>
            <option value='6'>6</option>
        </select><br>
        `;
    let d = new Dialog({
        title: "All in One Roll",
        content: content,
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
    
    
}