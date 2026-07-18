const fields = foundry.data.fields;

export function rollButtonField() {
  // needs to be called from within `settings`
  return new fields.SchemaField({
    pool: new fields.StringField({ initial: "Pool" }),
    skill: new fields.StringField({ initial: "Practiced" }),
    assets: new fields.NumberField({ integer: true, initial: 0 }),
    effort1: new fields.NumberField({ integer: true, initial: 0 }),
    effort2: new fields.NumberField({ integer: true, initial: 0 }),
    effort3: new fields.NumberField({ integer: true, initial: 0 }),
    freeEffort: new fields.NumberField({ integer: true, initial: 0 }),
    stepModifier: new fields.StringField({ initial: "eased" }),
    additionalSteps: new fields.NumberField({ integer: true, initial: 0 }),
    additionalCost: new fields.NumberField({ integer: true, initial: 0 }),
    damage: new fields.NumberField({ integer: true, initial: 0 }),
    damagePerLOE: new fields.NumberField({ integer: true, initial: 3 }),
    teen: new fields.StringField({ initial: "" }),
    bonus: new fields.NumberField({ integer: true, initial: 0 }),
    macroUuid: new fields.DocumentUUIDField({ nullable: true }),
    macroExecuteAsGM: new fields.BooleanField({ initial: false }),
  })
}

export function poolField() {
  return new fields.SchemaField({
    value: new fields.NumberField({ integer: true, initial: 0 }),
    edge: new fields.NumberField({ integer: true, initial: 0 })
  })
}