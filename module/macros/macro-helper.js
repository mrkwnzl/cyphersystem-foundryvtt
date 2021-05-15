export function diceRoller(title, info, modifier) {
  // Roll dice
  let roll = new Roll("1d20").roll();
  let difficulty = Math.floor(roll.result / 3);

  // Determine result
  let difficultyResult = determineDifficultyResult(roll, difficulty, modifier);

  // Determine special effect
  let possibleEffects = {
    1: "<span style='color:red'><b>" + game.i18n.localize("CYPHERSYSTEM.GMIntrusion") + "</b></span>",
    17: "<span style='color:blue'><b>" + game.i18n.localize("CYPHERSYSTEM.OneDamage") + "</b></span>",
    18: "<span style='color:blue'><b>" + game.i18n.localize("CYPHERSYSTEM.TwoDamage") + "</b></span>",
    19: "<span style='color:green'><b>" + game.i18n.localize("CYPHERSYSTEM.MinorEffectRoll") + "</b></span>",
    20: "<span style='color:green'><b>" + game.i18n.localize("CYPHERSYSTEM.MajorEffectRoll") + "</b></span>"
  };
  let effect = (possibleEffects[roll.result] || "");

  // Determine steps eased/hindered
  let modifiedBy = "";
  if (modifier != 0) {
    if (modifier > 1) {
      modifiedBy = game.i18n.format("CYPHERSYSTEM.EasedBySteps", {amount: modifier}) + ". "
    } else if (modifier == 1) {
      modifiedBy = game.i18n.localize("CYPHERSYSTEM.Eased") + ". "
    } else if (modifier == -1) {
      modifiedBy = game.i18n.localize("CYPHERSYSTEM.Hindered") + ". "
    } else if (modifier < -1) {
      modifiedBy = game.i18n.format("CYPHERSYSTEM.HinderedBySteps", {amount: Math.abs(modifier)}) + ". "
    }
  }

  // Determine info
  info = (info != "") ?
  "<hr style='margin-top: 1px; margin-bottom: 2px;'>" + info + "<hr style='margin-top: 1px; margin-bottom: 2px;'>" :
  "<hr style='margin-top: 1px; margin-bottom: 2px;'>";

  // Put it all together into the chat flavor
  let flavor = "<b>" + title + "</b>" + info + modifiedBy + game.i18n.localize("CYPHERSYSTEM.RollBeatDifficulty") + " " + difficultyResult + "<br>" + effect;

  // Create chat message
  roll.toMessage({
    speaker: ChatMessage.getSpeaker(),
    flavor: flavor
  });
}

function determineDifficultyResult(roll, difficulty, modifier) {
  if (!game.settings.get("cyphersystem", "effectiveDifficulty")) {
    return difficulty;
  } else {
    let operator = (modifier < 0) ? "-" : "+";
    return (difficulty + parseInt(modifier)) + " (" + difficulty + operator + Math.abs(modifier) + ")";
  }
}

export function payPoolPoints(actor, cost, pool){
  pool = pool.toLowerCase();

  // Determine edge
  let relevantEdge = {
    "might": actor.data.data.pools.mightEdge,
    "speed": actor.data.data.pools.speedEdge,
    "intellect": actor.data.data.pools.intellectEdge
  };
  let edge = (relevantEdge[pool] || 0);

  // Check for weakness
  edge = (edge < 0 && (cost == 0 || cost == "")) ? 0 : edge;

  // Determine cost
  cost = cost - edge;
  if (cost < 0) cost = 0;

  // Check if enough points are avalable and update actor
  if (pool == "might") {
    if (cost > actor.data.data.pools.might.value) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughMight"));
      return false;
    }
    actor.update({"data.pools.might.value": actor.data.data.pools.might.value - cost})
  } else if (pool == "speed") {
    if (cost > actor.data.data.pools.speed.value) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughSpeed"));
      return false;
    }
    actor.update({"data.pools.speed.value": actor.data.data.pools.speed.value - cost})
  } else if (pool == "intellect") {
    if (cost > actor.data.data.pools.intellect.value) {
      ui.notifications.notify(game.i18n.localize("CYPHERSYSTEM.NotEnoughIntellect"));
      return false;
    }
    actor.update({"data.pools.intellect.value": actor.data.data.pools.intellect.value - cost})
  }

  return true;
}

export function itemRollMacroQuick(actor, itemID) {
  // Find actor and item based on item ID
  const owner = game.actors.find(actor => actor.items.get(itemID));
  const item = actor.getOwnedItem(itemID);

  // Set defaults
  let info = "";
  let modifier = 0;
  let pointsPaid = true;

  // Set title
  let itemTypeStrings = {
    "skill": game.i18n.localize("ITEM.TypeSkill"),
    "teen Skill": game.i18n.localize("ITEM.TypeTeen Skill"),
    "power Shift": game.i18n.localize("ITEM.TypePower Shift"),
    "attack": game.i18n.localize("ITEM.TypeAttack"),
    "teen Attack": game.i18n.localize("ITEM.TypeTeen Attack"),
    "ability": game.i18n.localize("ITEM.TypeAbility"),
    "teen Ability": game.i18n.localize("ITEM.TypeTeen Ability"),
    "cypher": game.i18n.localize("ITEM.TypeCypher"),
    "artifact": game.i18n.localize("ITEM.TypeArtifact"),
    "ammo": game.i18n.localize("ITEM.TypeAmmo"),
    "armor": game.i18n.localize("ITEM.TypeArmor"),
    "equipment": game.i18n.localize("ITEM.TypeEquipment"),
    "lasting Damage": game.i18n.localize("ITEM.TypeLasting Damage"),
    "material": game.i18n.localize("ITEM.TypeMaterial"),
    "oddity": game.i18n.localize("ITEM.TypeOddity"),
    "teen Armor": game.i18n.localize("ITEM.TypeTeen Armor"),
    "teen lasting Damage": game.i18n.localize("ITEM.TypeTeen Lasting Damage")
  };
  let itemType = (itemTypeStrings[item.type] || "");

  if (item.type == "skill" || item.type == "teen Skill") {
    // Set skill Levels
    let relevantSkill = {
      "Inability": game.i18n.localize("CYPHERSYSTEM.Inability"),
      "Practiced": game.i18n.localize("CYPHERSYSTEM.Practiced"),
      "Trained": game.i18n.localize("CYPHERSYSTEM.Trained"),
      "Specialized": game.i18n.localize("CYPHERSYSTEM.Specialized")
    };
    let skillInfo = (relevantSkill[item.data.data.skillLevel] || relevantSkill["Practiced"]);

    // Set info
    info = itemType + ". " + game.i18n.localize("CYPHERSYSTEM.Level") + ": " + skillInfo;

    // Determine skill level
    let skillLevels = {
      "Inability": -1,
      "Practiced": 0,
      "Trained": 1,
      "Specialized": 2
    };

    // Set difficulty modifier
    modifier = (skillLevels[item.data.data.skillLevel] || 0);

  } else if (item.type == "power Shift") {
    // Set info
    info = itemType + ". " + item.data.data.powerShiftValue + ((item.data.data.powerShiftValue == 1) ?
    " " + game.i18n.localize("CYPHERSYSTEM.Shift") :
    " " + game.i18n.localize("CYPHERSYSTEM.Shifts"));

    // Set difficulty modifier
    modifier = item.data.data.powerShiftValue;

  } else if (item.type == "attack" || item.type == "teen Attack") {
    // Set info
    info = itemType + ". " + game.i18n.localize("CYPHERSYSTEM.Damage") + ": " + item.data.data.damage;

    // Determine whether the roll is eased or hindered
    let modifiedBy = (item.data.data.modified == "hindered") ? item.data.data.modifiedBy * -1 : item.data.data.modifiedBy;

    // Determine skill level
    let attackSkill = {
      "Inability": -1,
      "Practiced": 0,
      "Trained": 1,
      "Specialized": 2
    };
    let skillRating = (attackSkill[item.data.data.skillRating] || 0);

    // Set difficulty modifier
    modifier = skillRating + modifiedBy;

  } else if (item.type == "ability" || item.type == "teen Ability") {
    // Set defaults
    let costInfo = "";

    // Slice possible "+" from cost
    let checkPlus = item.data.data.costPoints.slice(-1);
    let pointCost = (checkPlus == "+") ?
    item.data.data.costPoints.slice(0, -1) :
    item.data.data.costPoints;

    // Check if there is a point cost and prepare costInfo
    if (item.data.data.costPoints != "" && item.data.data.costPoints != "0") {
      // Determine edge
      let relevantEdge = {
        "Might": actor.data.data.pools.mightEdge,
        "Speed": actor.data.data.pools.speedEdge,
        "Intellect": actor.data.data.pools.intellectEdge
      };
      let edge = (relevantEdge[item.data.data.costPool] || 0)

      // Determine point cost
      let checkPlus = item.data.data.costPoints.slice(-1);
      let pointCostInfo = pointCost - edge;
      if (pointCostInfo < 0) pointCostInfo = 0;

      // Determine pool points
      let relevantPool = {
        "Might": function () {
          return (pointCost != 1) ?
          game.i18n.localize("CYPHERSYSTEM.MightPoints") :
          game.i18n.localize("CYPHERSYSTEM.MightPoint");
        },
        "Speed": function () {
          return (pointCost != 1) ?
          game.i18n.localize("CYPHERSYSTEM.SpeedPoints") :
          game.i18n.localize("CYPHERSYSTEM.SpeedPoint");
        },
        "Intellect": function () {
          return (pointCost != 1) ?
          game.i18n.localize("CYPHERSYSTEM.IntellectPoints") :
          game.i18n.localize("CYPHERSYSTEM.IntellectPoint");
        }
      }
      let poolPoints = (relevantPool[item.data.data.costPool]() || relevantPool["Might"]());

      // Determine edge info
      let operator = (edge < 0) ? "+" : "-";
      let edgeInfo = (edge != 0) ? " (" + pointCost + operator + Math.abs(edge) + ")" : "";

      // Put it all together for cost info
      costInfo = ". " + game.i18n.localize("CYPHERSYSTEM.Cost") + ": " + pointCostInfo + edgeInfo + " " + poolPoints;
    }

    // Put everything together for info
    info = itemType + costInfo

    // Pay pool points and check whether there are enough points
    pointsPaid = payPoolPoints(actor, pointCost, item.data.data.costPool)

  } else if (item.type == "cypher") {
    // Determine level info
    let levelInfo = (item.data.data.level != "") ?
    ". " + game.i18n.localize("CYPHERSYSTEM.Level") + ": " + item.data.data.level :
    "";

    // Put it all together for info
    info = itemType + levelInfo;

  } else if (item.type == "artifact") {
    // Determine level info
    let levelInfo = (item.data.data.level != "") ?
    game.i18n.localize("CYPHERSYSTEM.Level") + ": " + item.data.data.level + ". " :
    "";

    // Determine depletion info
    let depletionInfo = game.i18n.localize("CYPHERSYSTEM.Depletion") + ": " + item.data.data.depletion;

    // Put it all together for info
    info = itemType + ". " + levelInfo + depletionInfo;

  } else {
    // Default to simply outputting item type
    info = itemType
  }

  // Parse to dice roller macro
  if (pointsPaid == true) {
    diceRoller(item.name, info, modifier, 0);
  }
}

function titleCase(phrase) {
  const words = phrase.split(" ");

  for (let i = 0; i < words.length; i++) {
    words[i] = words[i][0].toUpperCase() + words[i].substr(1);
  }

  return words.join(" ");
}

// Deprecation messages in case someone has old macros in their world
export function easedRollEffectiveMacro() {
  ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.EasedRollEffectiveMacro"))
}

export function hinderedRollEffectiveMacro() {
  ui.notifications.warn(game.i18n.localize("CYPHERSYSTEM.HinderedRollEffectiveMacro"))
}
