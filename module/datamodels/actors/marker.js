import {BaseActorData} from './base.js';

export class MarkerData extends BaseActorData {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        level: new fields.NumberField({integer: true,  initial: 0 })
      }),
      pools: new fields.SchemaField({
        quantity: new fields.SchemaField({
          value: new fields.NumberField({integer: true,  initial: 0 }),
          max:   new fields.NumberField({integer: true,  initial: 0 }),
        })
      }),
      description: new fields.HTMLField({ textSearch: true }),
      notes: new fields.HTMLField({ textSearch: true }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          isCounter:       new fields.BooleanField({ initial: true }),
          counting:        new fields.NumberField({integer: true,  initial: -1 }),
          hideArchive:     new fields.BooleanField({ initial: false }),
          hideNotes:       new fields.BooleanField({ initial: false }),
          hideDescription: new fields.BooleanField({ initial: false }),
          hideEquipment:   new fields.BooleanField({ initial: false })
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
