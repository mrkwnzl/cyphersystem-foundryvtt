import {BaseActorData} from './base.js';

export class NPCData extends BaseActorData {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        level: new fields.NumberField({integer: true,  initial: 1 })
      }),
      pools: new fields.SchemaField({
        health: new fields.SchemaField({
          value: new fields.NumberField({integer: true,  initial: 3 }),
          max:   new fields.NumberField({integer: true,  initial: 3 })
        })
      }),
      combat: new fields.SchemaField({
        damage: new fields.NumberField({integer: true,  initial: 1 }),
        armor:  new fields.NumberField({integer: true,  initial: 0 })
      }),
      description: new fields.HTMLField({ initial: "", textSearch: true  }),
      notes: new fields.HTMLField({ initial: "<p>[Description]</p><p><strong>Motive:</strong>&nbsp;</p><p><strong>Environment:</strong>&nbsp;</p><p><strong>Health:</strong>&nbsp;</p><p><strong>Damage Inflicted:</strong>&nbsp;</p><p><strong>Movement:</strong>&nbsp;</p><p><strong>Modifications:</strong>&nbsp;</p><p><strong>Combat:</strong>&nbsp;</p><p><strong>Interaction:</strong>&nbsp;</p><p><strong>Use:</strong>&nbsp;</p><p><strong>Loot:</strong>&nbsp;</p><p><strong>GM Intrusion:</strong>&nbsp;</p>", textSearch: true  }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          initiativeBonus: new fields.NumberField({integer: true,  initial: 0 }),
          hideArchive:     new fields.BooleanField({ initial: false })
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
