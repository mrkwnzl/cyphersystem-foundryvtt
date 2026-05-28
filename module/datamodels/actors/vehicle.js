import {BaseActorData} from './base.js';

export class VehicleData extends BaseActorData {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        level: new fields.NumberField({integer: true,  initial: 1 }),
        crew:  new fields.NumberField({integer: true,  initial: 1 }),
        weaponSystems: new fields.NumberField({integer: true,  initial: 1 })
      }),
      description: new fields.HTMLField({ initial: "", textSearch: true  }),
      notes: new fields.HTMLField({ initial: "", textSearch: true  }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          hideArchive: new fields.BooleanField({ initial: false })
        }),
        equipment: new fields.SchemaField({
          ammo: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          attacks: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          armor: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          cyphers: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          artifacts: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          oddities: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          materials: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          })
        })
      })
    }
  }
}
