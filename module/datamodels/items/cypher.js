import { PricedItemData } from './priceditem.js';

export class CypherData extends PricedItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        level: new fields.StringField({ initial: "" }),   // might be an expression 1d6+1
        type: new fields.ArrayField(new fields.NumberField({ integer: true, initial: 0 }),
          {
            initial: [0, 0]
          }),
        identified: new fields.BooleanField({ initial: true })
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          nameUnidentified: new fields.StringField()
        })
      }),
      description: new fields.HTMLField({ initial: "<p><strong>Level:</strong>&nbsp;</p><p><strong>Form:</strong>&nbsp;</p><p><strong>Effect:</strong>&nbsp;</p>", textSearch: true })
    }
  }
}
