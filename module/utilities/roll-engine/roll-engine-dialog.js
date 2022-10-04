import {rollEngineComputation} from "./roll-engine-computation.js";

export async function rollEngineDialog(actor, itemID, teen, skipDialog, skipRoll, initiativeRoll, title, pool, skillLevel, assets, effortToEase, effortOtherUses, damage, effortDamage, damagePerLOE, difficultyModifier, easedOrHindered, bonus, poolPointCost) {
  let rollEngineDialog = new Dialog({
    title: game.i18n.localize("CYPHERSYSTEM.AllInOneRoll"),
    content: rollEngineDialogString(actor, itemID, teen, pool, skillLevel, assets, effortToEase, effortOtherUses, damage, effortDamage, damagePerLOE, difficultyModifier, easedOrHindered, bonus, poolPointCost),
    buttons: {
      roll: {
        icon: '<i class="fas fa-dice-d20"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Roll"),
        callback: (html) => {
          rollEngineComputation(actor, itemID, teen, skipDialog, false, initiativeRoll, title, html.find('#pool').val(), html.find('#skillLevel').val(), html.find('#assets').val(), html.find('#effortToEase').val(), html.find('#effortOtherUses').val(), html.find('#damage').val(), html.find('#effortDamage').val(), html.find('#damagePerLOE').val(), html.find('#difficultyModifier').val(), html.find('#easedOrHindered').val(), html.find('#bonus').val(), html.find('#poolPointCost').val());
        }
      },
      pay: {
        icon: '<i class="fas fa-coins"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Pay"),
        callback: (html) => {
          rollEngineComputation(actor, itemID, teen, skipDialog, true, initiativeRoll, title, html.find('#pool').val(), html.find('#skillLevel').val(), html.find('#assets').val(), html.find('#effortToEase').val(), html.find('#effortOtherUses').val(), html.find('#damage').val(), html.find('#effortDamage').val(), html.find('#damagePerLOE').val(), html.find('#difficultyModifier').val(), html.find('#easedOrHindered').val(), html.find('#bonus').val(), html.find('#poolPointCost').val());
        }
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: game.i18n.localize("CYPHERSYSTEM.Cancel"),
        callback: () => {}
      }
    },
    default: "roll",
    close: () => {}
  });

  rollEngineDialog.render(true);
}

function rollEngineDialogString(actor, itemID, teen, pool, skillLevel, assets, effortToEase, effortOtherUses, damage, effortDamage, damagePerLOE, difficultyModifier, easedOrHindered, bonus, poolPointCost) {
  // Define stats
  let mightValue = (teen) ? actor.system.teen.pools.might.value : actor.system.pools.might.value;
  let mightMax = (teen) ? actor.system.teen.pools.might.max : actor.system.pools.might.max;
  let mightEdge = (teen) ? actor.system.teen.pools.might.edge : actor.system.pools.might.edge;
  let speedValue = (teen) ? actor.system.teen.pools.speed.value : actor.system.pools.speed.value;
  let speedMax = (teen) ? actor.system.teen.pools.speed.max : actor.system.pools.speed.max;
  let speedEdge = (teen) ? actor.system.teen.pools.speed.edge : actor.system.pools.speed.edge;
  let intellectValue = (teen) ? actor.system.teen.pools.intellect.value : actor.system.pools.intellect.value;
  let intellectMax = (teen) ? actor.system.teen.pools.intellect.max : actor.system.pools.intellect.max;
  let intellectEdge = (teen) ? actor.system.teen.pools.intellect.edge : actor.system.pools.intellect.edge;

  // Fallback for strings in skill
  if (skillLevel == 2) skillLevel = "Specialized";
  if (skillLevel == 1) skillLevel = "Trained";
  if (skillLevel == 0) skillLevel = "Practiced";
  if (skillLevel == -1) skillLevel = "Inability";

  // Check for initiative
  let item = actor.items.get(itemID);
  let isInitiative = (item) ? item.system.settings.general.initiative : false;

  // Create HTML
  let basicModifiers =
    `<div align = "center">
    <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.BasicModifiers")}</b></label><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Pool")}:</label>
    <select name='pool' id='pool' class='dialog-select' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
    <option value='Might' ${(pool == "Might" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Might")}</option>
    <option value='Speed' ${(pool == "Speed" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Speed")}</option>
    <option value='Intellect' ${(pool == "Intellect" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Intellect")}</option>
    <option value='Pool' ${(pool == "Pool" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.AnyPool")}</option>
    </select><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}:</label>
    <select name='skillLevel' id='skillLevel' class='dialog-select' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
    <option value=-1 ${(skillLevel == ("Inability") ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Inability")}</option>
    <option value=0 ${(skillLevel == ("Practiced") ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Practiced")}</option>
    <option value=1 ${(skillLevel == ("Trained") ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Trained")}</option>
    <option value=2 ${(skillLevel == ("Specialized") ? "selected" : "")}> ${game.i18n.localize("CYPHERSYSTEM.Specialized")}</option >
    </select ><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Assets")}:</label>
    <select name='assets' id='assets' class='dialog-select' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
    <option value=0 ${(assets == 0 ? "selected" : "")}>0</option>
    <option value=1 ${(assets == 1 ? "selected" : "")}>1</option>
    <option value=2 ${(assets == 2 ? "selected" : "")}> 2</option >
    </select ><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.EffortForTask")}:</label>
    <select name='effortToEase' id='effortToEase' class='dialog-select' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
    <option value=0 ${(effortToEase == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.None")}</option>
    <option value=1 ${(effortToEase == 1 ? "selected" : "")}>1 ${game.i18n.localize("CYPHERSYSTEM.level")}</option>
    <option value=2 ${(effortToEase == 2 ? "selected" : "")}> 2 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option >
    <option value=3 ${(effortToEase == 3 ? "selected" : "")}> 3 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option >
    <option value=4 ${(effortToEase == 4 ? "selected" : "")}> 4 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option >
    <option value=5 ${(effortToEase == 5 ? "selected" : "")}> 5 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option >
    <option value=6 ${(effortToEase == 6 ? "selected" : "")}> 6 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option >
    </select ><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.EffortForOther")}:</label>
    <select name='effortOtherUses' id='effortOtherUses' class='dialog-select' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
    <option value=0 ${(effortOtherUses == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.None")}</option>
    <option value=1 ${(effortOtherUses == 1 ? "selected" : "")}>1 ${game.i18n.localize("CYPHERSYSTEM.level")}</option>
    <option value=2 ${(effortOtherUses == 2 ? "selected" : "")}> 2 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option >
    <option value=3 ${(effortOtherUses == 3 ? "selected" : "")}> 3 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option >
    <option value=4 ${(effortOtherUses == 4 ? "selected" : "")}> 4 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option >
    <option value=5 ${(effortOtherUses == 5 ? "selected" : "")}> 5 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option >
    <option value=6 ${(effortOtherUses == 6 ? "selected" : "")}> 6 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option >
    </select ><br>
    <hr>`

  let attackModifiers = (!isInitiative) ?
    `<label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.AttackModifiers")}</b></label><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Damage")}:</label>
    <input name='damage' id='damage' type='number' value=${damage} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center'/><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.EffortForDamage")}:</label>
    <select name='effortDamage' id='effortDamage' class='dialog-select' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
    <option value=0 ${(effortDamage == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.None")}</option>
    <option value=1 ${(effortDamage == 1 ? "selected" : "")}>1 ${game.i18n.localize("CYPHERSYSTEM.level")}</option>
    <option value=2 ${(effortDamage == 2 ? "selected" : "")}>2 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    <option value=3 ${(effortDamage == 3 ? "selected" : "")}>3 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    <option value=4 ${(effortDamage == 4 ? "selected" : "")}>4 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    <option value=5 ${(effortDamage == 5 ? "selected" : "")}> 5 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option >
    <option value=6 ${(effortDamage == 6 ? "selected" : "")}> 6 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option >
    </select > <br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.DamageLevelEffort")}:</label>
    <input name='damagePerLOE' id='damagePerLOE' type='number' value=${damagePerLOE} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' /><br>
      <hr>`
    : ""

  let additionalModifiers =
    `<label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.AdditionalModifiers")}</b></label><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Difficulty")}:</label>
    <select name='easedOrHindered' id='easedOrHindered' class='dialog-select' style='height: 26px; width: 110px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
      <option value='eased' ${(easedOrHindered == 'eased' ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.easedBy")}</option>
      <option value='hindered' ${(easedOrHindered == 'hindered' ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.hinderedBy")}</option>
    </select>
    <input name='difficultyModifier' id='difficultyModifier' type='number' value=${difficultyModifier} style='width: 57px; margin-left: 0px; margin-bottom: 5px; text-align: center' /><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Bonus")}:</label>
    <input name='bonus' id='bonus' type='number' value=${bonus} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' /><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.PoolCost")}:</label>
    <input name='poolPointCost' id='poolPointCost' type='number' value=${poolPointCost} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' /><br>
    <hr>
    <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.CharacterInfo")}</b></label><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Effort")}:</label>
    <input name='effort' id='effort' type='number' value=${actor.system.basic.effort} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled /><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.MightPoolEdge")}:</label>
    <input name='might' id='might' type='text' value='${mightValue}/${mightMax} (${mightEdge})' style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled /><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.SpeedPoolEdge")}:</label>
    <input name='speed' id='speed' type='text' value='${speedValue}/${speedMax} (${speedEdge})' style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled /><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.IntellectPoolEdge")}:</label>
    <input name='intellect' id='intellect' type='text' value='${intellectValue}/${intellectMax} (${intellectEdge})' style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled /><br>
    </div>`

  let content = basicModifiers + attackModifiers + additionalModifiers;

  // Return HTML
  return content;
}