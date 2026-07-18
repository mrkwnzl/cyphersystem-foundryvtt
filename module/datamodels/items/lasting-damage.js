import {BaseItemData} from './base.js';

export class LastingDamageData extends BaseItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        damage: new fields.NumberField({ integer: true, initial: 0 }),
        effect: new fields.StringField({ initial: "" }),
        pool: new fields.StringField({ initial: "Might" }),
        type: new fields.StringField({ initial: "Lasting" })
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          unmaskedForm: new fields.StringField({ initial: "Mask" })
        })
      })
    }
  }
}
