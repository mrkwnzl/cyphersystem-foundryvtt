export function itemMacroString(item) {
  const content =
  `// Change the defaults for the macro dialog.
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

  game.cyphersystem.itemRollMacro(actor, "${item}", pool, skill, assets, effortTask, effortOther, modifier, poolPointCost, damage, effortDamage, damagePerLevel)`

  return content.replace(/^ +/gm, '');
}

export function allInOneRollDialogString(actor, pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE) {
  let content =
  `<div align="center">
  <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.BasicModifiers")}</b></label><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Pool")}:</label>
  <select name='pool' id='pool' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value='Might' ${(pool == "Might" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Might")}</option>
  <option value='Speed' ${(pool == "Speed" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Speed")}</option>
  <option value='Intellect' ${(pool == "Intellect" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Intellect")}</option>
  </select><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}:</label>
  <select name='skill' id='skill' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  {{#select skill}}
  <option value=-1 ${(skill == "Inability" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Inability")}</option>
  <option value=0 ${(skill == "Practiced" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Practiced")}</option>
  <option value=1 ${(skill == "Trained" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Trained")}</option>
  <option value=2 ${(skill == "Specialized" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Specialized")}</option>
  {{/select}}
  </select><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Assets")}:</label>
  <select name='assets' id='assets' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value=0 ${(assets == 0 ? "selected" : "")}>0</option>
  <option value=1 ${(assets == 1 ? "selected" : "")}>1</option>
  <option value=2 ${(assets == 2 ? "selected" : "")}>2</option>
  </select><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.EffortForTask")}:</label>
  <select name='effort1' id='effort1' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value=0 ${(effort1 == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.None")}</option>
  <option value=1 ${(effort1 == 1 ? "selected" : "")}>1 ${game.i18n.localize("CYPHERSYSTEM.Level")}</option>
  <option value=2 ${(effort1 == 2 ? "selected" : "")}>2 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=3 ${(effort1 == 3 ? "selected" : "")}>3 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=4 ${(effort1 == 4 ? "selected" : "")}>4 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=5 ${(effort1 == 5 ? "selected" : "")}>5 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=6 ${(effort1 == 6 ? "selected" : "")}>6 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  </select><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.EffortForOther")}:</label>
  <select name='effort2' id='effort2' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value=0 ${(effort2 == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.None")}</option>
  <option value=1 ${(effort2 == 1 ? "selected" : "")}>1 ${game.i18n.localize("CYPHERSYSTEM.Level")}</option>
  <option value=2 ${(effort2 == 2 ? "selected" : "")}>2 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=3 ${(effort2 == 3 ? "selected" : "")}>3 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=4 ${(effort2 == 4 ? "selected" : "")}>4 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=5 ${(effort2 == 5 ? "selected" : "")}>5 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=6 ${(effort2 == 6 ? "selected" : "")}>6 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  </select><br>
  <hr>
  <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.AttackModifiers")}</b></label><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Damage")}:</label>
  <input name='damage' id='damage' type='number' value=${damage} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center'/><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.EffortForDamage")}:</label>
  <select name='effort3' id='effort3' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value=0 ${(effort3 == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.None")}</option>
  <option value=1 ${(effort3 == 1 ? "selected" : "")}>1 ${game.i18n.localize("CYPHERSYSTEM.Level")}</option>
  <option value=2 ${(effort3 == 2 ? "selected" : "")}>2 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=3 ${(effort3 == 3 ? "selected" : "")}>3 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=4 ${(effort3 == 4 ? "selected" : "")}>4 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=5 ${(effort3 == 5 ? "selected" : "")}>5 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  <option value=6 ${(effort3 == 6 ? "selected" : "")}>6 ${game.i18n.localize("CYPHERSYSTEM.Levels")}</option>
  </select><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.DamageLevelEffort")}:</label>
  <input name='damagePerLOE' id='damagePerLOE' type='number' value=${damagePerLOE} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center'/><br>
  <hr>
  <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.AdditionalModifiers")}</b></label><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Difficulty")}:</label>
  <select name='stepModifier' id='stepModifier' style='height: 26px; width: 110px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value='eased' ${(stepModifier == 'eased' ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.EasedBy")}</option>
  <option value='hindered' ${(stepModifier == 'hindered' ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.HinderedBy")}</option>
  </select>
  <input name='additionalSteps' id='additionalSteps' type='number' value=${additionalSteps} style='width: 57px; margin-left: 0px; margin-bottom: 5px; text-align: center'/><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.PoolCost")}:</label>
  <input name='additionalCost' id='additionalCost' type='number' value=${additionalCost} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center'/><br>
  <hr>
  <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.CharacterInfo")}</b></label><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Effort")}:</label>
  <input name='effort' id='effort' type='number' value=${actor.data.data.basic.effort} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.MightPoolEdge")}:</label>
  <input name='might' id='might' type='text' value='${actor.data.data.pools.might.value}/${actor.data.data.pools.might.max} (${actor.data.data.pools.mightEdge})' style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.SpeedPoolEdge")}:</label>
  <input name='speed' id='speed' type='text' value='${actor.data.data.pools.speed.value}/${actor.data.data.pools.speed.max} (${actor.data.data.pools.speedEdge})' style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
  <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.IntellectPoolEdge")}:</label>
  <input name='intellect' id='intellect' type='text' value='${actor.data.data.pools.intellect.value}/${actor.data.data.pools.intellect.max} (${actor.data.data.pools.intellectEdge})' style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
  </div>`

  return content;
}

export function spendEffortString() {
  const content =
  `<div align="center">
  <label style='display: inline-block; width: 98px; text-align: right'><b>${game.i18n.localize("CYPHERSYSTEM.Pool")}: </b></label>
  <select name='pool' id='pool' style='width: 98px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
  <option value='Might'>${game.i18n.localize("CYPHERSYSTEM.Might")}</option><option value='Speed'>${game.i18n.localize("CYPHERSYSTEM.Speed")}</option>
  <option value='Intellect'>${game.i18n.localize("CYPHERSYSTEM.Intellect")}</option>
  </select><br>
  <label style='display: inline-block; width: 98px; text-align: right'><b>${game.i18n.localize("CYPHERSYSTEM.LevelOfEffort")}: </b></label>
  <input name='level' id='level' style='width: 98px; margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=1 data-dtype='Number'/></div>`

  return content;
}
