import {PricedItemData} from './priceditem.js';

export class MaterialData extends PricedItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        level: new fields.NumberField({ integer: true }),
        quantity: new fields.NumberField({ integer: true, initial: 1 })
      })
    }
  }
}
