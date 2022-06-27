/**
* Extend the basic ActorSheet with some very simple modifications
* @extends {FormApplication}
*/

import { rollEngineComputation } from "../utilities/roll-engine/roll-engine-computation.js";

export class rollEngineDialogSheet extends FormApplication {
  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet"],
      template: "systems/cyphersystem/templates/forms/roll-engine-dialog-sheet.html",
      title: "All-in-One Roll",
      closeOnSubmit: false,
      submitOnChange: true,
      submitOnClose: false,
      width: 745,
      height: false,
      resizable: false
    });
  }

  getData() {
    // Basic data
    const data = super.getData().object;
    if (!data.title) data.title = game.i18n.localize("CYPHERSYSTEM.StatRoll");

    data.mightValue = (data.teen) ? data.actor.data.data.teen.pools.might.value : data.actor.data.data.pools.might.value;
    data.mightMax = (data.teen) ? data.actor.data.data.teen.pools.might.max : data.actor.data.data.pools.might.max;
    data.mightEdge = (data.teen) ? data.actor.data.data.teen.pools.mightEdge : data.actor.data.data.pools.mightEdge;

    data.speedValue = (data.teen) ? data.actor.data.data.teen.pools.speed.value : data.actor.data.data.pools.speed.value;
    data.speedMax = (data.teen) ? data.actor.data.data.teen.pools.speed.max : data.actor.data.data.pools.speed.max;
    data.speedEdge = (data.teen) ? data.actor.data.data.teen.pools.speedEdge : data.actor.data.data.pools.speedEdge;

    data.intellectValue = (data.teen) ? data.actor.data.data.teen.pools.intellect.value : data.actor.data.data.pools.intellect.value;
    data.intellectMax = (data.teen) ? data.actor.data.data.teen.pools.intellect.max : data.actor.data.data.pools.intellect.max;
    data.intellectEdge = (data.teen) ? data.actor.data.data.teen.pools.intellectEdge : data.actor.data.data.pools.intellectEdge;

    // Summary
    data.summaryTaskModified = summaryTaskModified(data);
    data.summaryTotalDamage = summaryTotalDamage(data);
    data.summaryTotalCostArray = summaryTotalCost(data.actor, data, data.teen);
    data.summaryTotalCost = data.summaryTotalCostArray[0];
    data.summaryTotalCostString = data.summaryTotalCostArray[1];
    data.summaryTitle = data.title + ".";
    data.summaryTooMuchEffort = summaryCheckEffort(data.actor, data);
    data.summaryNotEnoughPointsString = summaryCheckPoints(data);
    data.summaryAllocatePoints = (data.pool == "Pool") ? game.i18n.localize("CYPHERSYSTEM.AllocatePointsYourself") : "";

    // Derived data
    data.totalEffort = parseInt(data.effortToEase) + parseInt(data.effortOtherUses) + parseInt(data.effortDamage);
    data.disabledButton = (data.summaryTooMuchEffort || data.summaryNotEnoughPointsString) ? "disabled" : "";

    data.mightValue = (data.pool == "Might") ? data.mightValue - data.summaryTotalCost : data.mightValue;
    data.speedValue = (data.pool == "Speed") ? data.speedValue - data.summaryTotalCost : data.speedValue;
    data.intellectValue = (data.pool == "Intellect") ? data.intellectValue - data.summaryTotalCost : data.intellectValue;

    data.impairedString = "";
    if (data.actor.data.data.damage.damageTrack == "Impaired" && data.actor.data.data.damage.applyImpaired) {
      data.impairedString = game.i18n.localize("CYPHERSYSTEM.PCIsImpaired");
    } else if (data.actor.data.data.damage.damageTrack == "Debilitated" && data.actor.data.data.damage.applyDebilitated) {
      data.impairedString = game.i18n.localize("CYPHERSYSTEM.PCIsDebilitated");
    };

    data.armorCost = (!data.teen) ? data.actor.data.data.armor.speedCostTotal : data.actor.data.data.teen.armor.speedCostTotal;
    data.speedCostArmor = (data.pool == "Speed" && data.armorCost > 0) ? game.i18n.format("CYPHERSYSTEM.SpeedEffortAdditionalCostPerLevel", { armorCost: data.armorCost }) : "";

    data.exceedEffort = (data.summaryTooMuchEffort) ? "exceeded" : "";
    data.exceedMight = (data.pool == "Might" && data.summaryNotEnoughPointsString) ? "exceeded" : "";
    data.exceedSpeed = (data.pool == "Speed" && data.summaryNotEnoughPointsString) ? "exceeded" : "";
    data.exceedIntellect = (data.pool == "Intellect" && data.summaryNotEnoughPointsString) ? "exceeded" : "";

    // Return data
    return data;
  }

  _updateObject(event, formData) {
    let data = this.object;

    // Basic data
    data.assets = (formData.assets) ? parseInt(formData.assets) : 0;
    data.bonus = (formData.bonus) ? parseInt(formData.bonus) : 0;
    data.damage = (formData.damage) ? parseInt(formData.damage) : 0;
    data.damagePerLOE = (formData.damagePerLOE) ? parseInt(formData.damagePerLOE) : 3;
    data.difficultyModifier = (formData.difficultyModifier) ? parseInt(formData.difficultyModifier) : 0;
    data.easedOrHindered = formData.easedOrHindered;
    data.effortDamage = parseInt(formData.effortDamage);
    data.effortOtherUses = parseInt(formData.effortOtherUses);
    data.effortToEase = parseInt(formData.effortToEase);
    data.pool = formData.pool;
    data.poolPointCost = (formData.poolPointCost) ? parseInt(formData.poolPointCost) : 0;
    data.skillLevel = parseInt(formData.skillLevel);

    // Summary
    data.summaryTaskModified = summaryTaskModified(formData);
    data.summaryTotalDamage = summaryTotalDamage(formData);
    data.summaryTotalCostArray = summaryTotalCost(data.actor, formData, data.teen);
    data.summaryTotalCost = data.summaryTotalCostArray[0];
    data.summaryTotalCostString = data.summaryTotalCostArray[1];
    data.summaryTooMuchEffort = summaryCheckEffort(data.actor, formData);
    data.summaryNotEnoughPointsString = summaryCheckPoints(data);
    data.summaryAllocatePoints = (data.pool == "Pool") ? game.i18n.localize("CYPHERSYSTEM.AllocatePointsYourself") : "";

    // Derived data
    data.totalEffort = parseInt(formData.effortToEase) + parseInt(formData.effortOtherUses) + parseInt(formData.effortDamage);
    data.disabledButton = (data.summaryTooMuchEffort || data.summaryNotEnoughPointsString) ? "disabled" : "";

    data.mightValue = (data.pool == "Might") ? data.mightValue - data.summaryTotalCost : data.mightValue;
    data.speedValue = (data.pool == "speed") ? data.speedValue - data.summaryTotalCost : data.speedValue;
    data.intellectValue = (data.pool == "Intellect") ? data.intellectValue - data.summaryTotalCost : data.intellectValue;

    data.impairedString = "";
    if (data.actor.data.data.damage.damageTrack == "Impaired" && data.actor.data.data.damage.applyImpaired) {
      data.impairedString = game.i18n.localize("CYPHERSYSTEM.PCIsImpaired");
    } else if (data.actor.data.data.damage.damageTrack == "Debilitated" && data.actor.data.data.damage.applyDebilitated) {
      data.impairedString = game.i18n.localize("CYPHERSYSTEM.PCIsDebilitated");
    };

    data.armorCost = (!data.teen) ? data.actor.data.data.armor.speedCostTotal : data.actor.data.data.teen.armor.speedCostTotal;
    data.speedCostArmor = (data.pool == "Speed" && data.armorCost > 0) ? game.i18n.format("CYPHERSYSTEM.SpeedEffortAdditionalCostPerLevel", { armorCost: data.armorCost }) : "";

    data.exceedEffort = (data.summaryTooMuchEffort) ? "exceeded" : "";
    data.exceedMight = (data.pool == "Might" && data.summaryNotEnoughPointsString) ? "exceeded" : "";
    data.exceedSpeed = (data.pool == "Speed" && data.summaryNotEnoughPointsString) ? "exceeded" : "";
    data.exceedIntellect = (data.pool == "Intellect" && data.summaryNotEnoughPointsString) ? "exceeded" : "";

    // Render sheet
    this.render();
  }

  /**
  * Event listeners for roll engine dialog sheets
  */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.roll-engine-roll').click(clickEvent => {
      rollEngineComputation(this.object.actor, this.object.itemID, this.object.teen, this.object.skipDialog, false, this.object.initiativeRoll, this.object.title, this.object.pool, this.object.skillLevel, this.object.assets, this.object.effortToEase, this.object.effortOtherUses, this.object.damage, this.object.effortDamage, this.object.damagePerLOE, this.object.difficultyModifier, this.object.easedOrHindered, this.object.bonus, this.object.poolPointCost);

      this.close();
    });

    html.find('.roll-engine-pay').click(clickEvent => {
      rollEngineComputation(this.object.actor, this.object.itemID, this.object.teen, this.object.skipDialog, true, this.object.initiativeRoll, this.object.title, this.object.pool, this.object.skillLevel, this.object.assets, this.object.effortToEase, this.object.effortOtherUses, this.object.damage, this.object.effortDamage, this.object.damagePerLOE, this.object.difficultyModifier, this.object.easedOrHindered, this.object.bonus, this.object.poolPointCost);

      this.close();
    });

    html.find('.roll-engine-cancel').click(clickEvent => {
      this.close();
    });

  }
}

function summaryTaskModified(data) {
  let difficultyModifier = (data.easedOrHindered == "hindered") ? parseInt(data.difficultyModifier) * -1 : parseInt(data.difficultyModifier);

  let sum = parseInt(data.skillLevel) + parseInt(data.assets) + parseInt(data.effortToEase) + difficultyModifier;

  let taskModifiedString = "";

  if (sum <= -2) {
    taskModifiedString = game.i18n.format("CYPHERSYSTEM.TaskHinderedBySteps", { amount: Math.abs(parseInt(sum)) });
  } else if (sum == -1) {
    taskModifiedString = game.i18n.localize("CYPHERSYSTEM.TaskHinderedByStep");
  } else if (sum == 0) {
    taskModifiedString = game.i18n.localize("CYPHERSYSTEM.TaskUnmodified");
  } else if (sum == 1) {
    taskModifiedString = game.i18n.localize("CYPHERSYSTEM.TaskEasedByStep");
  } else if (sum >= 2) {
    taskModifiedString = game.i18n.format("CYPHERSYSTEM.TaskEasedBySteps", { amount: parseInt(sum) });
  }

  return taskModifiedString;
}

function summaryTotalDamage(data) {
  let sum = parseInt(data.damage) + (parseInt(data.effortDamage) * parseInt(data.damagePerLOE))

  let totalDamageString = "";

  if (sum == 1) {
    totalDamageString = game.i18n.format("CYPHERSYSTEM.AttackDealsPointDamage", { amount: parseInt(sum) });
  } else if (sum >= 2) {
    totalDamageString = game.i18n.format("CYPHERSYSTEM.AttackDealsPointsDamage", { amount: parseInt(sum) });
  }

  return totalDamageString;
}

function summaryTotalCost(actor, data, teen) {
  let armorCost = 0;

  if (data.pool == "Speed") {
    armorCost = (!teen) ? actor.data.data.armor.speedCostTotal : actor.data.data.teen.armor.speedCostTotal;
  }

  let impairedCost = 0;
  if (actor.data.data.damage.damageTrack == "Impaired" && actor.data.data.damage.applyImpaired) {
    impairedCost = 1;
  }
  if (actor.data.data.damage.damageTrack == "Debilitated" && actor.data.data.damage.applyDebilitated) {
    impairedCost = 1;
  }

  let edge = 0;
  if (!teen) {
    if (data.pool == "Might") edge = actor.data.data.pools.mightEdge;
    if (data.pool == "Speed") edge = actor.data.data.pools.speedEdge;
    if (data.pool == "Intellect") edge = actor.data.data.pools.intellectEdge;
  } else {
    if (data.pool == "Might") edge = actor.data.data.teen.pools.mightEdge;
    if (data.pool == "Speed") edge = actor.data.data.teen.pools.speedEdge;
    if (data.pool == "Intellect") edge = actor.data.data.teen.pools.intellectEdge;
  }

  let effortCost = 1 + (data.totalEffort * 2) + (data.totalEffort * armorCost) + (data.totalEffort * impairedCost);

  let totalCost = (data.totalEffort >= 1) ? parseInt(data.poolPointCost) + effortCost - edge : parseInt(data.poolPointCost) - edge;
  if (totalCost < 0) totalCost = 0;

  let totalCostString = "";
  if (totalCost == 1) {
    totalCostString = game.i18n.format("CYPHERSYSTEM.TaskCostsPoint", { amount: parseInt(totalCost), pool: data.pool });
  } else {
    totalCostString = game.i18n.format("CYPHERSYSTEM.TaskCostsPoints", { amount: parseInt(totalCost), pool: data.pool });
  }

  return [totalCost, totalCostString];
}

function summaryCheckEffort(actor, data) {
  let tooMuchEffortString = (data.totalEffort > actor.data.data.basic.effort) ? game.i18n.localize("CYPHERSYSTEM.SpendTooMuchEffort") : "";

  return tooMuchEffortString;
}

function summaryCheckPoints(data) {
  let poolPoints = 0;
  if (data.pool == "Might") poolPoints = data.mightValue;
  if (data.pool == "Speed") poolPoints = data.speedValue;
  if (data.pool == "Intellect") poolPoints = data.intellectValue;

  let summaryNotEnoughPointsString = "";

  if ((data.summaryTotalCost > poolPoints) && (data.pool != "Pool")) {
    summaryNotEnoughPointsString = game.i18n.format("CYPHERSYSTEM.NotEnoughPoint", { amount: poolPoints, pool: data.pool });
  }

  return summaryNotEnoughPointsString;
}