import {BaseActorData} from './base.js';

export class CompanionData extends BaseActorData {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        level: new fields.NumberField({integer: true,  initial: 3 }),
        disposition: new fields.StringField({ initial: "" }),
        category: new fields.StringField({ initial: "" }),
        ownedBy: new fields.StringField({ initial: "" })
      }),
      pools: new fields.SchemaField({
        health: new fields.SchemaField({
          value: new fields.NumberField({integer: true,  initial: 8 }),
          max:   new fields.NumberField({integer: true,  initial: 8 })
        })
      }),
      combat: new fields.SchemaField({
        armor:  new fields.NumberField({integer: true,  initial: 0 }),
        damage: new fields.NumberField({integer: true,  initial: 3 })
      }),
      description: new fields.HTMLField({ initial: "", textSearch: true  }),
      notes: new fields.HTMLField({ initial: "<p><strong>Character Benefit:</strong>&nbsp;</p><p><strong>Background:</strong>&nbsp;</p><p><strong>Description:</strong>&nbsp;</p>", textSearch: true  }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          initiativeBonus: new fields.NumberField({integer: true,  initial: 0 }),
          hideArchive: new fields.BooleanField({ initial: false })
        }),
        skills: new fields.SchemaField({
          sortByRating: new fields.BooleanField({ initial: false })
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
