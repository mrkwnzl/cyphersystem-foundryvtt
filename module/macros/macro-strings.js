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

    game.cyphersystem.itemRollMacro(actor, "${item}", pool, skill, assets, effortTask, effortOther, modifier, poolPointCost, damage, effortDamage, damagePerLevel, teen, noRoll)`;

  return content.replace(/^ +/gm, '');
}

export function recursionString(actorID, itemID) {
  let content =
    `// Do not change anything below

    actor = game.actors.get("${actorID}");
    let item = actor.items.get("${itemID}");

    game.cyphersystem.recursionMacro(actor, item);`;

  return content.replace(/^ +/gm, '');;
}

export function tagString(actorID, itemID) {
  let content =
    `// Do not change anything below

    actor = game.actors.get("${actorID}");
    let item = actor.items.get("${itemID}");

    game.cyphersystem.tagMacro(actor, item);`;

  return content.replace(/^ +/gm, '');;
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
    <input name='level' id='level' style='width: 98px; margin-left: 5px; margin-bottom: 5px;text-align: center' type='text' value=1 /></div>`;

  return content;
}

export function calculateAttackDifficultyString(difficulty, pcRole, chatMessage, cover, positionProne, positionHighGround, surprise, range, illumination, mist, hiding, invisible, water, targetMoving, attackerMoving, attackerJostled, gravity, additionalOneValue, additionalOneName, additionalTwoValue, additionalTwoName, additionalThreeValue, additionalThreeName, persistentRollDifficulty) {
  additionalOneName = (!additionalOneName) ? "" : additionalOneName;
  additionalOneValue = (!additionalOneValue) ? 0 : additionalOneValue;
  additionalTwoName = (!additionalTwoName) ? "" : additionalTwoName;
  additionalTwoValue = (!additionalTwoValue) ? 0 : additionalTwoValue;
  additionalThreeName = (!additionalThreeName) ? "" : additionalThreeName;
  additionalThreeValue = (!additionalThreeValue) ? 0 : additionalThreeValue;

  let content =
    `<div>
      <select name='difficulty' id='difficulty' class='dialog-calcAttDiff'>
        <option value='0' ${(difficulty == 0) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 0</option>
        <option value='1' ${(difficulty == 1) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 1</option>
        <option value='2' ${(difficulty == 2) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 2</option>
        <option value='3' ${(difficulty == 3) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 3</option>
        <option value='4' ${(difficulty == 4) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 4</option>
        <option value='5' ${(difficulty == 5) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 5</option>
        <option value='6' ${(difficulty == 6) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 6</option>
        <option value='7' ${(difficulty == 7) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 7</option>
        <option value='8' ${(difficulty == 8) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 8</option>
        <option value='9' ${(difficulty == 9) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 9</option>
        <option value='10' ${(difficulty == 10) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 10</option>
        <option value='11' ${(difficulty == 11) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 11</option>
        <option value='12' ${(difficulty == 12) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 12</option>
        <option value='13' ${(difficulty == 13) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 13</option>
        <option value='14' ${(difficulty == 14) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 14</option>
        <option value='15' ${(difficulty == 15) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.BaseDifficulty")}: 15</option>
      </select><br>
      <select name='pcRole' id='pcRole' class='dialog-calcAttDiff'>
        <option value='0' ${(pcRole == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.PCIsAttacker")}</option>
        <option value='1' ${(pcRole == 1 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.PCIsTarget")}</option>
      </select><br>
      <select name='chatMessage' id='chatMessage' class='dialog-calcAttDiff'>
        <option value='0' ${(chatMessage == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.ShowDifficultyToEveryone")}</option>
        <option value='1' ${(chatMessage == 1 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.WhisperDifficultyToGM")}</option>
        <option value='2' ${(chatMessage == 2 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.WhisperDifficultyToGMAndBeVague")}</option>
      </select><br>
      <select name='persistentRollDifficulty' id='persistentRollDifficulty' class='dialog-calcAttDiff'>
        <option value='0' ${(persistentRollDifficulty == 0) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.OnlyNextRoll")}</option>
        <option value='1' ${(persistentRollDifficulty == 1) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.KeepDifficulty")}</option>
      </select>
      <hr>
      <div class="input-calcAttDiff">
        <input class='dialog-checkbox' type='checkbox' name='cover' id='cover' ${(cover == 1) ? "checked" : ""}>
          &nbsp;${game.i18n.localize("CYPHERSYSTEM.TargetHasCover")}
      </div>
      <hr>
      <select name='positionProne' id='positionProne' class='dialog-calcAttDiff' style='margin-bottom: 5px;'>
        <option value='0' ${(positionProne == 0 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsStanding")}</option>
        <option value='1' ${(positionProne == 1 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsProneMelee")}</option>
        <option value='2' ${(positionProne == 2 ? "selected" : "")}>${game.i18n.localize("CYPHERSYSTEM.TargetIsProneRanged")}</option>
      </select><br>
      <div class="input-calcAttDiff">
        <input class='dialog-checkbox' type='checkbox' name='positionHighGround' id='positionHighGround' ${(positionHighGround == 1) ? "checked" : ""}>
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
        <input class='dialog-checkbox' type='checkbox' name='mist' id='mist' ${(mist == 1) ? "checked" : ""}>
        &nbsp;${game.i18n.localize("CYPHERSYSTEM.TargetIsInMist")}<br>
      </div>
      <div class="input-calcAttDiff">
        <input class='dialog-checkbox' type='checkbox' name='hiding' id='hiding' ${(hiding == 1) ? "checked" : ""}>
        &nbsp;${game.i18n.localize("CYPHERSYSTEM.TargetIsHiding")}<br>
      </div>
      <div class="input-calcAttDiff">
        <input class='dialog-checkbox' type='checkbox' name='invisible' id='invisible' ${(invisible == 1) ? "checked" : ""}>
          &nbsp;${game.i18n.localize("CYPHERSYSTEM.TargetIsInvisible")}
      </div>
      <hr>
      <select name='water' id='water' class='dialog-calcAttDiff'>
        <option value='0' ${(water == 0) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.AttackIsOnLand")}</option>
        <option value='1' ${(water == 1) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.AttackerIsInDeepWater")}</option>
        <option value='2' ${(water == 2) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.AttackerIsUnderwaterStabbing")}</option>
        <option value='3' ${(water == 3) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.AttackerIsUnderwaterSlashing")}</option>
      </select>
      <hr>
      <div class="input-calcAttDiff">
        <input class='dialog-checkbox' type='checkbox' name='targetMoving' id='targetMoving' ${(targetMoving == 1 ? "checked" : "")}>
        &nbsp;${game.i18n.localize("CYPHERSYSTEM.TargetIsMoving")}<br>
      </div>
      <div class="input-calcAttDiff">
        <input class='dialog-checkbox' type='checkbox' name='attackerMoving' id='attackerMoving' ${(attackerMoving == 1) ? "checked" : ""}>
        &nbsp;${game.i18n.localize("CYPHERSYSTEM.AttackerIsMoving")}<br>
      </div>
      <div class="input-calcAttDiff">
        <input class='dialog-checkbox' type='checkbox' name='attackerJostled' id='attackerJostled' ${(attackerJostled == 1) ? "checked" : ""}>
        &nbsp;${game.i18n.localize("CYPHERSYSTEM.AttackerIsJostled")}
      </div>
      <hr>
      <div class="input-calcAttDiff">
        <input class='dialog-checkbox' type='checkbox' name='gravity' id='gravity' ${(gravity == 1) ? "checked" : ""}>
          &nbsp;${game.i18n.localize("CYPHERSYSTEM.AttackInGravity")}
      </div>
      <hr>

      <div class="flex-center grid grid-3col" style="gap: 3px">
        <div style="margin-bottom: 7px">
          <input class='auto-margin dialog-input' name='additionalOneName' id='additionalOneName' type='text' value='${additionalOneName}' placeholder="${game.i18n.localize("CYPHERSYSTEM.AdditionalOne")}">
          <select name='stepModifierOne' id='stepModifierOne' class='dialog-select'>
            <option value='-1' ${(additionalOneValue <= 0) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.easedBy")}</option>
            <option value='1' ${(additionalOneValue > 0) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.hinderedBy")}</option>
          </select>
          <input name='additionalOne' id='additionalOne' type='number' placeholder=${Math.abs(additionalOneValue)} style='margin-bottom: 0px; margin-left: -2px; text-align: center; width: 26px;' />
        </div>

        <div style="margin-bottom: 7px">
          <input class='auto-margin dialog-input' name='additionalTwoName' id='additionalTwoName' type='text' value='${additionalTwoName}' placeholder="${game.i18n.localize("CYPHERSYSTEM.AdditionalTwo")}">
          <select name='stepModifierTwo' id='stepModifierTwo' class='dialog-select'>
            <option value='-1' ${(additionalTwoValue <= 0) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.easedBy")}</option>
            <option value='1' ${(additionalTwoValue > 0) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.hinderedBy")}</option>
          </select>
          <input name='additionalTwo' id='additionalTwo' type='number' placeholder=${Math.abs(additionalTwoValue)} style='margin-bottom: 0px; margin-left: -2px; text-align: center; width: 26px;' />
        </div>

        <div style="margin-bottom: 7px">
          <input class='auto-margin dialog-input' name='additionalThreeName' id='additionalThreeName' type='text' value='${additionalThreeName}' placeholder="${game.i18n.localize("CYPHERSYSTEM.AdditionalThree")}">
          <select name='stepModifierThree' id='stepModifierThree' class='dialog-select'>
            <option value='-1' ${(additionalThreeValue <= 0) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.easedBy")}</option>
            <option value='1' ${(additionalThreeValue > 0) ? "selected" : ""}>${game.i18n.localize("CYPHERSYSTEM.hinderedBy")}</option>
          </select>
          <input name='additionalThree' id='additionalThree' type='number' placeholder=${Math.abs(additionalThreeValue)} style='margin-bottom: 0px; margin-left: -2px; text-align: center; width: 26px;' />
        </div>
      </div>
    </div>`;

  return content;
}

export function renameTagString(currentTag, newTag) {
  if (!currentTag) currentTag = "";
  if (!newTag) newTag = "";
  const content =
    `<div align="center">
      <label style='display: inline-block; width: 150px; text-align: right'><b>${game.i18n.localize("CYPHERSYSTEM.CurrentName")}: </b></label>
      <input name='currentTag' id='currentTag' value="${currentTag}" style='width: 200px; margin-left: 5px; margin-bottom: 5px;text-align: left' type='text' placeholder="${game.i18n.localize("CYPHERSYSTEM.TagOrRecursion")}"/>
    </div>
    <div align="center">
      <label style='display: inline-block; width: 150px; text-align: right'><b>${game.i18n.localize("CYPHERSYSTEM.NewName")}: </b></label>
      <input name='newTag' id='newTag' value="${newTag}" style='width: 200px; margin-left: 5px; margin-bottom: 5px;text-align: left' type='text' placeholder="${game.i18n.localize("CYPHERSYSTEM.TagOrRecursion")}"/>
    </div>
    <div align="center">
      <label style='display: inline-block; margin-bottom: 5px; font-size: smaller'>${game.i18n.localize("CYPHERSYSTEM.KeepEmptyToDelete")}</label>
    </div>`;

  return content;
}