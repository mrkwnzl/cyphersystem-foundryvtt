export class CypherSystemTokenRuler extends foundry.canvas.placeables.tokens.TokenRuler {
  static WAYPOINT_LABEL_TEMPLATE = "systems/cyphersystem/templates/token-ruler/tokenrulerlabel.hbs";

  _getWaypointLabelContext(waypoint, state) {
    const isPathfinding =
      !(waypoint.index <= 1 && !waypoint.next) || game.keyboard.isModifierActive("Control");

    // Exclude Marker tokens
    const excludedActorTypes = ["marker"];
    if (excludedActorTypes.includes(this.token.actor.type) && !isPathfinding) return null;

    // Exclude tokens based on settings
    const rulerSetting = game.settings.get("cyphersystem", "showRuler");
    if (rulerSetting == 0 && !isPathfinding) return null; // Never show ruler
    if (rulerSetting == 1 && !this.token.inCombat && !isPathfinding) return null; // Show ruler only in combat

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
    const hiddenWaypoint = {radius: 0};
    const isPathfinding =
      waypoint.index >= 2 ||
      (waypoint.index == 0 && waypoint?.next?.next) ||
      (waypoint.previous && waypoint.next) ||
      game.keyboard.isModifierActive("Control");

    // Exclude Marker tokens
    const excludedActorTypes = ["marker"];
    if (excludedActorTypes.includes(this.token.actor.type) && !isPathfinding) return hiddenWaypoint;

    // Exclude tokens based on settings
    const rulerSetting = game.settings.get("cyphersystem", "showRuler");
    if (rulerSetting == 0 && !isPathfinding) return hiddenWaypoint; // Never show ruler
    if (rulerSetting == 1 && !this.token.inCombat && !isPathfinding) return hiddenWaypoint; // Show ruler only in combat

    let category = getCategory(
      this.token,
      parseFloat(waypoint.measurement.cost),
      this.token.scene.grid.units
    );

    let {radius, alpha} = super._getWaypointStyle(waypoint);
    return {radius, color: category.color, alpha};
  }

  _getSegmentStyle(waypoint) {
    const hiddenRuler = {width: 0};
    const isPathfinding =
      !(waypoint.index <= 1 && !waypoint.next) || game.keyboard.isModifierActive("Control");

    // Exclude Marker tokens
    const excludedActorTypes = ["marker"];
    if (excludedActorTypes.includes(this.token.actor.type) && !isPathfinding) return hiddenRuler;

    // Exclude tokens based on settings
    const rulerSetting = game.settings.get("cyphersystem", "showRuler");
    if (rulerSetting == 0 && !isPathfinding) return hiddenRuler; // Never show ruler
    if (rulerSetting == 1 && !this.token.inCombat && !isPathfinding) return hiddenRuler; // Show ruler only in combat

    let category = getCategory(
      this.token,
      parseFloat(waypoint.measurement.cost),
      this.token.scene.grid.units
    );

    let {width, alpha} = super._getSegmentStyle(waypoint);
    return {width, color: category.color, alpha};
  }

  _getGridHighlightStyle(waypoint, offset) {
    console.log(waypoint);
    const hiddenHighlight = {alpha: 0};
    const isPathfinding =
      (waypoint.next && waypoint.previous) || game.keyboard.isModifierActive("Control");

    // Exclude Marker tokens
    const excludedActorTypes = ["marker"];
    if (excludedActorTypes.includes(this.token.actor.type) && !isPathfinding)
      return hiddenHighlight;

    // Exclude tokens based on settings
    const rulerSetting = game.settings.get("cyphersystem", "showRuler");
    if (rulerSetting == 0 && !isPathfinding) return hiddenHighlight; // Never show ruler
    if (rulerSetting == 1 && !this.token.inCombat && !isPathfinding) return hiddenHighlight; // Show ruler only in combat

    let category = getCategory(
      this.token,
      parseFloat(waypoint.measurement.cost),
      this.token.scene.grid.units
    );

    return {color: category.color, alpha: 0.5};
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
  } else if (["ft", "feet", game.i18n.format("CYPHERSYSTEM.UnitDistanceFeet")].includes(unit)) {
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
    console.log(this);

    const rulerClass = CypherSystemTokenRuler;
    const excludedActorTypes = ["marker"];
    const rulerSetting = game.settings.get("cyphersystem", "showRuler");

    if (!rulerClass) return null;
    if (excludedActorTypes.includes(this.actor.type)) return null;
    if (rulerSetting == 0) return null;
    if (rulerSetting == 1 && !this.inCombat) return null;

    return new rulerClass(this);
  }
}
