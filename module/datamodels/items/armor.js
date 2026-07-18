import {PricedItemData} from './priceditem.js';

export class ArmorData extends PricedItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        type: new fields.StringField({ initial: "light armor" }),
        rating: new fields.NumberField({ integer: true, initial: 0 }),
        cost: new fields.NumberField({ integer: true, initial: 0 }),  // speed cost
        notes: new fields.StringField(),
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          unmaskedForm: new fields.StringField({ initial: "Mask" })
        })
      }),
      active: new fields.BooleanField({ initial: true })
    }
  }
}
