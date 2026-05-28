import {BaseItemData} from './base.js';
import {rollButtonField} from './common.js'

export class SkillData extends BaseItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        rating: new fields.StringField({ initial: "Trained" })
      }),
      settings: new fields.SchemaField({
        rollButton: rollButtonField(),
        general: new fields.SchemaField({
          sorting: new fields.StringField({ initial: "Skill" }),
          initiative: new fields.BooleanField({ initial: false }),
          unmaskedForm: new fields.StringField({ initial: "Mask" })
        })
      })
    }
  }
}
