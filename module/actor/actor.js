/**
 * Extend the base Actor entity by defining a custom roll data structure which is ideal for the Cypher system.
 * @extends {Actor}
 */
export class CypherActor extends Actor {
  static LOG_V10_COMPATIBILITY_WARNINGS = true;

  _updatePoolValue(beforepool, before, after, stat, changes) {
    let pre  = before[`system.pools.${stat}.max`] ?? beforepool[`${stat}.max`];
    let post = after[`system.pools.${stat}.max`] ?? this.system.pools[stat].max;
    if (pre != post) {
      let diff = post - pre;
      if (diff != 0) {
        if (changes===undefined) changes={};
        setProperty(changes, `system.pools.${stat}.value`, this.system.pools[stat].value + diff);
      }
    }
    return changes;
  }

  // If max pools have changed, then change corresponding value
  applyActiveEffects() {
    let before_pools    = foundry.utils.flattenObject(this.system.pools);
    let before_override = foundry.utils.flattenObject(this.overrides);
    super.applyActiveEffects();
    let after_pools = foundry.utils.flattenObject(this.overrides);
    console.log('applyActiveEffects', before_pools, after_pools);
    let changes;
    changes = this._updatePoolValue(before_pools, before_override, after_pools, "might", changes);
    changes = this._updatePoolValue(before_pools, before_override, after_pools, "speed", changes);
    changes = this._updatePoolValue(before_pools, before_override, after_pools, "intellect", changes);
    changes = this._updatePoolValue(before_pools, before_override, after_pools, "additional", changes);
    //if (changes) this.update(changes);
  }
}
