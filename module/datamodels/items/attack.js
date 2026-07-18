import {PricedItemData} from './priceditem.js';
import {rollButtonField} from './common.js'

export class AttackData extends PricedItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        type: new fields.StringField({ initial: "light weapon" }),
        damage: new fields.NumberField({ integer: true, initial: 0 }),
        modifier: new fields.StringField({ initial: "eased" }),
        steps: new fields.NumberField({ integer: true, initial: 0 }),
        range: new fields.StringField(),
        notes: new fields.StringField(),
        skillRating: new fields.StringField({ initial: "Practiced" })
      }),
      settings: new fields.SchemaField({
        rollButton: rollButtonField(),
        general: new fields.SchemaField({
          unmaskedForm: new fields.StringField({ initial: "Mask" })
        })
      })
    }
  }
}
