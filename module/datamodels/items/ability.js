import { BaseItemData } from './base.js';
import { rollButtonField } from './common.js'

export class AbilityData extends BaseItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        cost: new fields.StringField({ initial: "0" }),   // might be "3+", so can't be NumberField
        pool: new fields.StringField({ initial: "Pool" }),
      }),
      settings: new fields.SchemaField({
        rollButton: rollButtonField(),
        general: new fields.SchemaField({
          sorting: new fields.StringField({ initial: "Ability" }),
          spellTier: new fields.StringField({ initial: "low" }),
          unmaskedForm: new fields.StringField({ initial: "Mask" })
        })
      })
    }
  }
}
