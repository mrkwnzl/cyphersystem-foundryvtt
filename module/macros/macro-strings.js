export function itemMacroString(item) {
  const content =
    `// Change the defaults for the macro dialog.
    // Change the values after the equal sign.
    // Use quotation marks around words (strings). Examples: "Might", "Practiced".
    // Don’t use quotation marks around numbers (integers). Examples: -1, 0, 1, 2.
    // Don’t use quotation marks around truth values (boolean). Examples: true, false.
    // Empty strings ("") mean that the defaults are used.

    // What Pool is used to pay the cost?
    // "Might", "Speed", "Intellect", or "Pool"?
    // Use quotation marks
    let pool = "";

    // What is the skill level?
    // "Inability", "Practiced", "Trained", or "Specialized"?
    // Use quotation marks
    let skill = "";

    // How many assets do you have?
    // 0, 1, or 2?
    // Don’t use quotation marks
    let assets = "";

    // How many levels of Effort to ease the task?
    // 0, 1, 2, 3, 4, 5, or 6?
    // Don’t use quotation marks
    let effortTask = "";

    // How many levels of Effort for other uses?
    // 0, 1, 2, 3, 4, 5, or 6?
    // Don’t use quotation marks
    let effortOther = "";

    // How many steps is the roll eased or hindered (excl. Effort)?
    // Eased: positive value. Hindered: negative value.
    // Don’t use quotation marks
    let modifier = "";

    // How many additional Pool points does it cost (excl. Effort)?
    // Don’t use quotation marks
    let poolPointCost = "";

    // How much damage?
    // Don’t use quotation marks
    let damage = "";

    // How many levels of Effort for extra damage?
    // 0, 1, 2, 3, 4, 5, or 6?
    // Don’t use quotation marks
    let effortDamage = "";

    // How much extra damage per level of Effort?
    // Generally, this is 3.
    // Area attacks usually only deal 2 points of damage per level.
    // Don’t use quotation marks
    let damagePerLevel = "";

    // Only pay points instead of rolling?
    let noRoll = false;

    // Force the macro to apply to the Teen or Mask form?
    // true = apply to Teen form
    // false = apply to Mask form
    // Don’t use quotation marks
    let teen = "";


    // Do not change anything below

    game.cyphersystem.itemRollMacro(actor, "${item}", pool, skill, assets, effortTask, effortOther, modifier, poolPointCost, damage, effortDamage, damagePerLevel, teen, noRoll)`

  return content.replace(/^ +/gm, '');
}

export function allInOneRollDialogString(actor, pool, skill, assets, effort1, effort2, additionalCost, additionalSteps, stepModifier, title, damage, effort3, damagePerLOE, teen, itemID) {
  // Define stats
  let mightValue = (teen) ? actor.data.data.teen.pools.might.value : actor.data.data.pools.might.value;
  let mightMax = (teen) ? actor.data.data.teen.pools.might.max : actor.data.data.pools.might.max;
  let mightEdge = (teen) ? actor.data.data.teen.pools.mightEdge : actor.data.data.pools.mightEdge;
  let speedValue = (teen) ? actor.data.data.teen.pools.speed.value : actor.data.data.pools.speed.value;
  let speedMax = (teen) ? actor.data.data.teen.pools.speed.max : actor.data.data.pools.speed.max;
  let speedEdge = (teen) ? actor.data.data.teen.pools.speedEdge : actor.data.data.pools.speedEdge;
  let intellectValue = (teen) ? actor.data.data.teen.pools.intellect.value : actor.data.data.pools.intellect.value;
  let intellectMax = (teen) ? actor.data.data.teen.pools.intellect.max : actor.data.data.pools.intellect.max;
  let intellectEdge = (teen) ? actor.data.data.teen.pools.intellectEdge : actor.data.data.pools.intellectEdge;

  // Fallback for strings in skill
  if (skill == 2) skill = "Specialized";
  if (skill == 1) skill = "Trained";
  if (skill == 0) skill = "Practiced";
  if (skill == -1) skill = "Inability";

  // Check for initiative
  let item = actor.items.get(itemID);
  let isInitiative = (item) ? item.data.data.isInitiative : false;

  // Create HTML
  let basicModifiers =
    `<div align="center">
    <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.BasicModifiers")}</b></label><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Pool")}:</label>
    <select name='pool' id='pool' class='dialog-select' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
    <option value='Might' ${(pool == "Might" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Might")}</option>
    <option value='Speed' ${(pool == "Speed" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Speed")}</option>
    <option value='Intellect' ${(pool == "Intellect" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Intellect")}</option>
    <option value='Pool' ${(pool == "Pool" ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.AnyPool")}</option>
    </select><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.SkillLevel")}:</label>
    <select name='skill' id='skill' class='dialog-select' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
    <option value=-1 ${(skill == ("Inability") ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Inability")}</option>
    <option value=0 ${(skill == ("Practiced") ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Practiced")}</option>
    <option value=1 ${(skill == ("Trained") ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Trained")}</option>
    <option value=2 ${(skill == ("Specialized") ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.Specialized")}</option>
    </select><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Assets")}:</label>
    <select name='assets' id='assets' class='dialog-select' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
    <option value=0 ${(assets == 0 ? "selected" : "")}>0</option>
    <option value=1 ${(assets == 1 ? "selected" : "")}>1</option>
    <option value=2 ${(assets == 2 ? "selected" : "")}>2</option>
    </select><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.EffortForTask")}:</label>
    <select name='effort1' id='effort1' class='dialog-select' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
    <option value=0 ${(effort1 == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.None")}</option>
    <option value=1 ${(effort1 == 1 ? "selected" : "")}>1 ${game.i18n.localize("CYPHERSYSTEM.level")}</option>
    <option value=2 ${(effort1 == 2 ? "selected" : "")}>2 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    <option value=3 ${(effort1 == 3 ? "selected" : "")}>3 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    <option value=4 ${(effort1 == 4 ? "selected" : "")}>4 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    <option value=5 ${(effort1 == 5 ? "selected" : "")}>5 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    <option value=6 ${(effort1 == 6 ? "selected" : "")}>6 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    </select><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.EffortForOther")}:</label>
    <select name='effort2' id='effort2' class='dialog-select' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
    <option value=0 ${(effort2 == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.None")}</option>
    <option value=1 ${(effort2 == 1 ? "selected" : "")}>1 ${game.i18n.localize("CYPHERSYSTEM.level")}</option>
    <option value=2 ${(effort2 == 2 ? "selected" : "")}>2 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    <option value=3 ${(effort2 == 3 ? "selected" : "")}>3 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    <option value=4 ${(effort2 == 4 ? "selected" : "")}>4 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    <option value=5 ${(effort2 == 5 ? "selected" : "")}>5 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    <option value=6 ${(effort2 == 6 ? "selected" : "")}>6 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    </select><br>
    <hr>`

  let attackModifiers = (!isInitiative) ?
    `<label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.AttackModifiers")}</b></label><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Damage")}:</label>
    <input name='damage' id='damage' type='number' value=${damage} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center'/><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.EffortForDamage")}:</label>
    <select name='effort3' id='effort3' class='dialog-select' style='height: 26px; width: 170px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
    <option value=0 ${(effort3 == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.None")}</option>
    <option value=1 ${(effort3 == 1 ? "selected" : "")}>1 ${game.i18n.localize("CYPHERSYSTEM.level")}</option>
    <option value=2 ${(effort3 == 2 ? "selected" : "")}>2 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    <option value=3 ${(effort3 == 3 ? "selected" : "")}>3 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    <option value=4 ${(effort3 == 4 ? "selected" : "")}>4 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    <option value=5 ${(effort3 == 5 ? "selected" : "")}>5 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    <option value=6 ${(effort3 == 6 ? "selected" : "")}>6 ${game.i18n.localize("CYPHERSYSTEM.levels")}</option>
    </select><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.DamageLevelEffort")}:</label>
    <input name='damagePerLOE' id='damagePerLOE' type='number' value=${damagePerLOE} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center'/><br>
    <hr>`
    : ""

  let additionalModifiers =
    `<label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.AdditionalModifiers")}</b></label><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Difficulty")}:</label>
    <select name='stepModifier' id='stepModifier' class='dialog-select' style='height: 26px; width: 110px; margin-left: 5px; margin-bottom: 5px; text-align-last: center'>
    <option value='eased' ${(stepModifier == 'eased' ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.easedBy")}</option>
    <option value='hindered' ${(stepModifier == 'hindered' ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.hinderedBy")}</option>
    </select>
    <input name='additionalSteps' id='additionalSteps' type='number' value=${additionalSteps} style='width: 57px; margin-left: 0px; margin-bottom: 5px; text-align: center'/><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.PoolCost")}:</label>
    <input name='additionalCost' id='additionalCost' type='number' value=${additionalCost} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center'/><br>
    <hr>
    <label style='display: inline-block; width: 100%; text-align: center; margin-bottom: 5px'><b>${game.i18n.localize("CYPHERSYSTEM.CharacterInfo")}</b></label><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.Effort")}:</label>
    <input name='effort' id='effort' type='number' value=${actor.data.data.basic.effort} style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.MightPoolEdge")}:</label>
    <input name='might' id='might' type='text' value='${mightValue}/${mightMax} (${mightEdge})' style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.SpeedPoolEdge")}:</label>
    <input name='speed' id='speed' type='text' value='${speedValue}/${speedMax} (${speedEdge})' style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
    <label style='display: inline-block; width: 170px; text-align: right'>${game.i18n.localize("CYPHERSYSTEM.IntellectPoolEdge")}:</label>
    <input name='intellect' id='intellect' type='text' value='${intellectValue}/${intellectMax} (${intellectEdge})' style='width: 170px; margin-left: 5px; margin-bottom: 5px; text-align: center' disabled/><br>
    </div>`

  let content = basicModifiers + attackModifiers + additionalModifiers;

  // Return HTML
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

export function calculateAttackDifficultyString(difficulty, pcRole, chatMessage, cover, positionProne, positionHighGround, surprise, range, illumination, mist, hiding, invisible, water, targetMoving, attackerMoving, attackerJostled, gravity, additionalOneValue, additionalOneName, additionalTwoValue, additionalTwoName, additionalThreeValue, additionalThreeName) {
  let content =
    `<div>
    <select name='difficulty' id='difficulty' class='dialog-calcAttDiff'>
    <option value='0' ${(difficulty == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 0</option>
    <option value='1' ${(difficulty == 1 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 1</option>
    <option value='2' ${(difficulty == 2 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 2</option>
    <option value='3' ${(difficulty == 3 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 3</option>
    <option value='4' ${(difficulty == 4 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 4</option>
    <option value='5' ${(difficulty == 5 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 5</option>
    <option value='6' ${(difficulty == 6 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 6</option>
    <option value='7' ${(difficulty == 7 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 7</option>
    <option value='8' ${(difficulty == 8 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 8</option>
    <option value='9' ${(difficulty == 9 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 9</option>
    <option value='10' ${(difficulty == 10 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 10</option>
    <option value='11' ${(difficulty == 11 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 11</option>
    <option value='12' ${(difficulty == 12 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 12</option>
    <option value='13' ${(difficulty == 13 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 13</option>
    <option value='14' ${(difficulty == 14 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 14</option>
    <option value='15' ${(difficulty == 15 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 15</option>
    </select><br>
    <select name='pcRole' id='pcRole' class='dialog-calcAttDiff'>
    <option value='0' ${(pcRole == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.PCIsAttacker")}</option>
    <option value='1' ${(pcRole == 1 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.PCIsTarget")}</option>
    </select><br>
    <select name='chatMessage' id='chatMessage' class='dialog-calcAttDiff'>
    <option value='0' ${(chatMessage == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.ShowDifficultyToEveryone")}</option>
    <option value='1' ${(chatMessage == 1 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.WhisperDifficultyToGM")}</option>
    <option value='2' ${(chatMessage == 2 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.WhisperDifficultyToGMAndBeVague")}</option>
    </select>
    <hr>
    <div class="input-calcAttDiff">
    <input class='dialog-checkbox' type='checkbox' name='cover' id='cover' data-dtype='boolean' ${(cover == 1 ? "checked" : "")}>
    &nbsp;${game.i18n.localize("CYPHERSYSTEM.TargetHasCover")}
    </div>
    <hr>
    <select name='positionProne' id='positionProne' class='dialog-calcAttDiff' style='margin-bottom: 5px;'>
    <option value='0' ${(positionProne == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsStanding")}</option>
    <option value='1' ${(positionProne == 1 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsProneMelee")}</option>
    <option value='2' ${(positionProne == 2 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsProneRanged")}</option>
    </select><br>
    <div class="input-calcAttDiff">
    <input class='dialog-checkbox' type='checkbox' name='positionHighGround' id='positionHighGround' data-dtype='boolean' ${(positionHighGround == 1 ? "checked" : "")}'>
    &nbsp;${game.i18n.localize("CYPHERSYSTEM.AttackerHasHighGround")}
    </div>
    <hr>
    <select name='surprise' id='surprise' class='dialog-calcAttDiff' style='margin-bottom: 5px;'>
    <option value='0' ${(surprise == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsAware")}</option>
    <option value='1' ${(surprise == 1 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsUnaware")}</option>
    <option value='2' ${(surprise == 2 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsAwareButNotLocation")}</option>
    </select>
    <hr>
    <select name='range' id='range' class='dialog-calcAttDiff'>
    <option value='0' ${(range == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsInNormalRange")}</option>
    <option value='1' ${(range == 1 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsInPointBlankRange")}</option>
    <option value='2' ${(range == 2 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsInExtremeRange")}</option>
    <option value='3' ${(range == 3 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsBeyondExtremeRange")}</option>
    </select>
    <hr>
    <select name='illumination' id='illumination' class='dialog-calcAttDiff'>
    <option value='0' ${(illumination == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsIlluminated")}</option>
    <option value='1' ${(illumination == 1 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsInDimLight")}</option>
    <option value='2' ${(illumination == 2 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsInVeryDimLightImmediate")}</option>
    <option value='3' ${(illumination == 3 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsInVeryDimLightShort")}</option>
    <option value='4' ${(illumination == 4 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsInDarkness")}</option>
    </select>
    <hr>
    <div class="input-calcAttDiff">
    <input class='dialog-checkbox' type='checkbox' name='mist' id='mist' data-dtype='boolean' ${(mist == 1 ? "checked" : "")}>
    &nbsp;${game.i18n.localize("CYPHERSYSTEM.TargetIsInMist")}<br>
    </div>
    <div class="input-calcAttDiff">
    <input class='dialog-checkbox' type='checkbox' name='hiding' id='hiding' data-dtype='boolean' ${(hiding == 1 ? "checked" : "")}>
    &nbsp;${game.i18n.localize("CYPHERSYSTEM.TargetIsHiding")}<br>
    </div>
    <div class="input-calcAttDiff">
    <input class='dialog-checkbox' type='checkbox' name='invisible' id='invisible' data-dtype='boolean' ${(invisible == 1 ? "checked" : "")}>
    &nbsp;${game.i18n.localize("CYPHERSYSTEM.TargetIsInvisible")}
    </div>
    <hr>
    <select name='water' id='water' class='dialog-calcAttDiff'>
    <option value='0' ${(water == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.AttackIsOnLand")}</option>
    <option value='1' ${(water == 1 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.AttackerIsInDeepWater")}</option>
    <option value='2' ${(water == 2 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.AttackerIsUnderwaterStabbing")}</option>
    <option value='3' ${(water == 3 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.AttackerIsUnderwaterSlashing")}</option>
    </select>
    <hr>
    <div class="input-calcAttDiff">
    <input class='dialog-checkbox' type='checkbox' name='targetMoving' id='targetMoving' data-dtype='boolean' ${(targetMoving == 1 ? "checked" : "")}>
    &nbsp;${game.i18n.localize("CYPHERSYSTEM.TargetIsMoving")}<br>
    </div>
    <div class="input-calcAttDiff">
    <input class='dialog-checkbox' type='checkbox' name='attackerMoving' id='attackerMoving' data-dtype='boolean' ${(attackerMoving == 1 ? "checked" : "")}>
    &nbsp;${game.i18n.localize("CYPHERSYSTEM.AttackerIsMoving")}<br>
    </div>
    <div class="input-calcAttDiff">
    <input class='dialog-checkbox' type='checkbox' name='attackerJostled' id='attackerJostled' data-dtype='boolean' ${(attackerJostled == 1 ? "checked" : "")}>
    &nbsp;${game.i18n.localize("CYPHERSYSTEM.AttackerIsJostled")}
    </div>
    <hr>
    <div class="input-calcAttDiff">
    <input class='dialog-checkbox' type='checkbox' name='gravity' id='gravity' data-dtype='boolean' ${(gravity == 1 ? "checked" : "")}>
    &nbsp;${game.i18n.localize("CYPHERSYSTEM.AttackInGravity")}
    </div>
    <hr>

    <div class="flex-center grid grid-3col" style="gap: 3px">
    <div style="margin-bottom: 7px">
    <input class='auto-margin dialog-input' name='additionalOneName' id='additionalOneName' type='text' value='${additionalOneName}' data-dtype='String' placeholder="${game.i18n.localize("CYPHERSYSTEM.AdditionalOne")}">
    <select name='stepModifierOne' id='stepModifierOne' class='dialog-select'>
    <option value='-1' ${(additionalOneValue <= 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.easedBy")}</option>
    <option value='1' ${(additionalOneValue > 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.hinderedBy")}</option>
    </select>
    <input name='additionalOne' id='additionalOne' type='number' placeholder=${Math.abs(additionalOneValue)} style='margin-bottom: 0px; margin-left: -2px; text-align: center; width: 26px;'/>
    </div>

    <div style="margin-bottom: 7px">
    <input class='auto-margin dialog-input' name='additionalTwoName' id='additionalTwoName' type='text' value='${additionalTwoName}' data-dtype='String' placeholder="${game.i18n.localize("CYPHERSYSTEM.AdditionalTwo")}">
    <select name='stepModifierTwo' id='stepModifierTwo' class='dialog-select'>
    <option value='-1' ${(additionalTwoValue <= 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.easedBy")}</option>
    <option value='1' ${(additionalTwoValue > 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.hinderedBy")}</option>
    </select>
    <input name='additionalTwo' id='additionalTwo' type='number' placeholder=${Math.abs(additionalTwoValue)} style='margin-bottom: 0px; margin-left: -2px; text-align: center; width: 26px;'/>
    </div>

    <div style="margin-bottom: 7px">
    <input class='auto-margin dialog-input' name='additionalThreeName' id='additionalThreeName' type='text' value='${additionalThreeName}' data-dtype='String' placeholder="${game.i18n.localize("CYPHERSYSTEM.AdditionalThree")}">
    <select name='stepModifierThree' id='stepModifierThree' class='dialog-select'>
    <option value='-1' ${(additionalThreeValue <= 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.easedBy")}</option>
    <option value='1' ${(additionalThreeValue > 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.hinderedBy")}</option>
    </select>
    <input name='additionalThree' id='additionalThree' type='number' placeholder=${Math.abs(additionalThreeValue)} style='margin-bottom: 0px; margin-left: -2px; text-align: center; width: 26px;'/>
    </div>
    </div>
    </div>`;

  return content;
}