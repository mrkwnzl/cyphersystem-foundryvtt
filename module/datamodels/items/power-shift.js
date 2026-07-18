import {BaseItemData} from './base.js';

export class PowerShiftData extends BaseItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        shifts: new fields.NumberField({ integer: true, initial: 1 }),
        temporary: new fields.BooleanField({ initial: false })
      })
    }
  }
}
