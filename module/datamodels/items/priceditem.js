import {BaseItemData} from './base.js';

export class PricedItemData extends BaseItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      price: new fields.SchemaField({
        value: new fields.NumberField({ integer: true, initial: 0 }),
        currency: new fields.StringField({ initial: "" }),
        priceTag: new fields.StringField({ initial: "" }),
        category: new fields.StringField({ initial: "none" }),
      })
    }
  }
}