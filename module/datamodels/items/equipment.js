import {PricedItemData} from './priceditem.js';

export class EquipmentData extends PricedItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        level: new fields.NumberField({ integer: true }),
        quantity: new fields.NumberField({ integer: true, initial: 1 })
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          sorting: new fields.StringField({ initial: "Equipment}" })
        })
      })
    }
  }
}
