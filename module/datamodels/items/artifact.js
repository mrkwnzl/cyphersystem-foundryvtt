import {PricedItemData} from './priceditem.js';

export class ArtifactData extends PricedItemData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        level: new fields.StringField({ initial: "" }),  // might be 1d6+1
        depletion: new fields.StringField({ initial: "1 in [[/r d6]]" }),
        identified: new fields.BooleanField({ initial: true })
      }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          nameUnidentified: new fields.StringField({ initial: "" }),
        })
      }),
      description: new fields.HTMLField({ initial: "<p><strong>Level:</strong>&nbsp;</p><p><strong>Form:</strong>&nbsp;</p><p><strong>Effect:</strong>&nbsp;</p><p><strong>Depletion:</strong>&nbsp;</p>", textSearch: true })
    }
  }
}
