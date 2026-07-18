export class BaseItemData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      version: new fields.NumberField({ required: true, nullable: false, integer: true, initial: 2 }),
      description: new fields.HTMLField({ required: false, textSearch: true }),
      archived: new fields.BooleanField({ required: true, initial: false }),
      favorite: new fields.BooleanField({ required: true, initial: false }),
    }
  }
}
