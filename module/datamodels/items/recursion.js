import {BaseItemData} from './base.js';
import {poolField} from './common.js'

export class RecursionData extends BaseItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        focus: new fields.StringField({initial:""})
      }),
      settings: new fields.SchemaField({
        statModifiers: new fields.SchemaField({
          might: poolField(),
          speed: poolField(),
          intellect: poolField()
        })
      }),
      active: new fields.BooleanField({ initial: false })
    }
  }
}