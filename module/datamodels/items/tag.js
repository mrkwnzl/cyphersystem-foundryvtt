import {BaseItemData} from './base.js';
import {poolField} from './common.js'

export class TagData extends BaseItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          sorting: new fields.StringField({ initial: "Tag" })
        }),
        statModifiers: new fields.SchemaField({
          might: poolField(),
          speed: poolField(),
          intellect: poolField()
        }),
        macroUuid: new fields.DocumentUUIDField(),
      }),
      active: new fields.BooleanField({ initial: false }),
      exclusive: new fields.BooleanField({ initial: false })
    }
  }
}
