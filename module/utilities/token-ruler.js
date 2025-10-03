export class CypherSystemTokenRuler extends foundry.canvas.placeables.tokens.TokenRuler {
  static WAYPOINT_LABEL_TEMPLATE = "systems/cyphersystem/templates/token-ruler/tokenrulerlabel.hbs";

  _getWaypointLabelContext(waypoint, state) {
    const isGridless = this.token.scene.grid.type == 0;
    const rulerSetting = game.settings.get("cyphersystem", "showRulerGridless");
    const isPathfinding =
      game.user.getFlag("cyphersystem", "isPathfinding") ||
      game.keyboard.isModifierActive("Control") ||
      (waypoint.index >= 1 &&
        (waypoint.previous?.previous || (waypoint.previous && waypoint.next))) ||
      (waypoint.index >= 2 && !waypoint.next);

    // Only on grid
    if (rulerSetting == 0 && isGridless && !isPathfinding) return null;

    // Grid & combat
    if (rulerSetting == 1 && isGridless && !this.token.inCombat && !isPathfinding) {
      return null;
    }

    // Create ruler label
    const context = super._getWaypointLabelContext(waypoint, state);
    if (!context || !context.cost.total) return context;

    let unit = context.cost.units;
    let cost = parseFloat(context.cost.total);
    let category = getCategory(this.token, cost, unit);

    if (category.label) {
      context.cyphersystemLabel = game.i18n.format("CYPHERSYSTEM.DistanceLabelCategory", {
        category: category.label,
        distance: category.cost,
        unit: unit
      });
    } else {
      context.cyphersystemLabel = game.i18n.format("CYPHERSYSTEM.DistanceLabel", {
        distance: category.cost,
        unit: unit
      });
    }

    return context;
  }

  _getWaypointStyle(waypoint) {
    const isGridless = this.token.scene.grid.type == 0;
    const rulerSetting = game.settings.get("cyphersystem", "showRulerGridless");
    const isPathfinding =
      game.user.getFlag("cyphersystem", "isPathfinding") ||
      game.keyboard.isModifierActive("Control") ||
      waypoint.index >= 2 ||
      (waypoint.index == 0 && waypoint?.next?.next) ||
      (waypoint.previous && waypoint.next);

    // Only grid
    if (rulerSetting == 0 && isGridless && !isPathfinding) {
      return {radius: 0};
    }

    // Grid & combat
    if (rulerSetting == 1 && isGridless && !this.token.inCombat && !isPathfinding) {
      return {radius: 0};
    }

    let category = getCategory(
      this.token,
      parseFloat(waypoint.measurement.cost),
      this.token.scene.grid.units
    );

    let {radius, alpha} = super._getWaypointStyle(waypoint);
    return {radius, color: category.color, alpha};
  }

  _getSegmentStyle(waypoint) {
    const isGridless = this.token.scene.grid.type == 0;
    const rulerSetting = game.settings.get("cyphersystem", "showRulerGridless");
    const isPathfinding =
      game.user.getFlag("cyphersystem", "isPathfinding") ||
      game.keyboard.isModifierActive("Control") ||
      !(waypoint.index <= 1 && !waypoint.next);

    // Only grid
    if (rulerSetting == 0 && isGridless && !isPathfinding) return {width: 0};

    // Grid & combat
    if (rulerSetting == 1 && isGridless && !this.token.inCombat && !isPathfinding) {
      return {width: 0};
    }

    let category = getCategory(
      this.token,
      parseFloat(waypoint.measurement.cost),
      this.token.scene.grid.units
    );

    let {width, alpha} = super._getSegmentStyle(waypoint);
    return {width, color: category.color, alpha};
  }

  _getGridHighlightStyle(waypoint, offset) {
    let {alpha} = super._getGridHighlightStyle(waypoint);

    let category = getCategory(
      this.token,
      parseFloat(waypoint.measurement.cost),
      this.token.scene.grid.units
    );

    return {color: category.color, alpha};
  }
}

function getCategory(token, cost, unit) {
  let label;
  let color = 0x808080;
  let rounding;
  let immediate;
  let short;
  let long;
  let veryLong;

  // Set meters or feet
  if (["m", "meter", "metre", game.i18n.format("CYPHERSYSTEM.UnitDistanceMeter")].includes(unit)) {
    rounding = 0.5;
    immediate = 3;
    short = 15;
    long = 30;
    veryLong = 150;
  } else if (["ft", game.i18n.format("CYPHERSYSTEM.UnitDistanceFeet")].includes(unit)) {
    rounding = 1;
    immediate = 10;
    short = 50;
    long = 100;
    veryLong = 500;
  }

  // Set rounding
  if (token.scene.grid.type == 0) {
    cost = cost.toNearest(rounding);
  }

  // Define range bands
  if (cost <= immediate) {
    label = game.i18n.format("CYPHERSYSTEM.Immediate");
    color = 0x0000ff;
  } else if (cost <= short) {
    label = game.i18n.format("CYPHERSYSTEM.Short");
    color = 0x008000;
  } else if (cost <= long) {
    label = game.i18n.format("CYPHERSYSTEM.Long");
    color = 0xffa500;
  } else if (cost <= veryLong) {
    label = game.i18n.format("CYPHERSYSTEM.VeryLong");
    color = 0xff0000;
  }

  return {cost: cost, label: label, color: color};
}

export class CypherSystemToken extends foundry.canvas.placeables.Token {
  _initializeRuler() {
    const rulerClass = CypherSystemTokenRuler;
    const excludedActorTypesString = game.settings.get("cyphersystem", "disableRulerTypes");
    const excludedActorTypes = excludedActorTypesString.toLowerCase().split(/\s*,\s*/);

    if (!rulerClass) return null;
    if (excludedActorTypes.includes(this.actor.type)) return null;

    return new rulerClass(this);
  }

  async _addDragWaypoint(point, {snap = false} = {}) {
    super._addDragWaypoint(point, {snap});
    await game.user.setFlag("cyphersystem", "isPathfinding", true);
  }

  async _triggerDragLeftCancel() {
    super._triggerDragLeftCancel();
    await game.user.setFlag("cyphersystem", "isPathfinding", false);
  }

  // async _onDragClickRight(event) {
  //   if (!this.ruler) await game.user.setFlag("cyphersystem", "isPathfinding", false);
  //   super._onDragClickRight(event);
  // }

  // async _removeDragWaypoint() {
  //   super._removeDragWaypoint();
  //   if (!this.mouseInteractionManager.interactionData.contexts) return;

  //   for (const context of Object.values(this.mouseInteractionManager.interactionData.contexts)) {
  //     if (context.waypoints.length == 0) {
  //       game.user.setFlag("cyphersystem", "isPathfinding", false);
  //     }
  //   }
  // }
}
