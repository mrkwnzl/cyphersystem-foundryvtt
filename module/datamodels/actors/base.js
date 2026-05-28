const fields = foundry.data.fields;

export class BaseActorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      version: new fields.NumberField({integer: true,  initial: 3 }),
    }
  }
}