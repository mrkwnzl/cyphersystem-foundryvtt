import {BaseActorData} from './base.js';

export class PCData extends BaseActorData {
  static defineSchema() {
    const fields = foundry.data.fields;

    return {
      ...super.defineSchema(),
      basic: new fields.SchemaField({
        descriptor: new fields.StringField({ initial: "", textSearch: true}),
        type:  new fields.StringField({ initial: "", textSearch: true }),
        focus: new fields.StringField({ initial: "", textSearch: true }),
        additionalSentence: new fields.StringField({ initial: "" }),
        unmaskedForm: new fields.StringField({ initial: "Mask" }),
        tier:   new fields.NumberField({integer: true,  initial: 1 }),
        effort: new fields.NumberField({integer: true,  initial: 1 }),
        xp:     new fields.NumberField({integer: true,  initial: 0 }),
        advancement: new fields.SchemaField({
          stats:  new fields.BooleanField({ initial: false }),
          effort: new fields.BooleanField({ initial: false }),
          edge:   new fields.BooleanField({ initial: false }),
          skill:  new fields.BooleanField({ initial: false }),
          other:  new fields.BooleanField({ initial: false })
        }),
        gmiRange: new fields.NumberField({integer: true,  initial: 1 })
      }),
      pools: new fields.SchemaField({
        might: new fields.SchemaField({
          value: new fields.NumberField({integer: true,  initial: 10 }),
          max:   new fields.NumberField({integer: true,  initial: 10 }),
          edge:  new fields.NumberField({integer: true,  initial: 0 })
        }),
        speed: new fields.SchemaField({
          value: new fields.NumberField({integer: true,  initial: 10 }),
          max:   new fields.NumberField({integer: true,  initial: 10 }),
          edge:  new fields.NumberField({integer: true,  initial: 0 })
        }),
        intellect: new fields.SchemaField({
          value: new fields.NumberField({integer: true,  initial: 10 }),
          max:   new fields.NumberField({integer: true,  initial: 10 }),
          edge:  new fields.NumberField({integer: true,  initial: 0 })
        }),
        additional: new fields.SchemaField({
          value: new fields.NumberField({integer: true,  initial: 3 }),
          max:   new fields.NumberField({integer: true,  initial: 3 }),
          edge:  new fields.NumberField({integer: true,  initial: 0 })
        })
      }),
      combat: new fields.SchemaField({
        recoveries: new fields.SchemaField({
          roll: new fields.StringField({ initial: "1d6+1" }),
          oneAction: new fields.BooleanField({ initial: false }),
          oneAction2: new fields.BooleanField({ initial: false }),
          oneAction3: new fields.BooleanField({ initial: false }),
          oneAction4: new fields.BooleanField({ initial: false }),
          oneAction5: new fields.BooleanField({ initial: false }),
          oneAction6: new fields.BooleanField({ initial: false }),
          oneAction7: new fields.BooleanField({ initial: false }),
          tenMinutes: new fields.BooleanField({ initial: false }),
          tenMinutes2: new fields.BooleanField({ initial: false }),
          oneHour:  new fields.BooleanField({ initial: false }),
          tenHours: new fields.BooleanField({ initial: false })
        }),
        damageTrack: new fields.SchemaField({
          state: new fields.StringField({ initial: "Hale" }),
          applyImpaired: new fields.BooleanField({ initial: true }),
          applyDebilitated: new fields.BooleanField({ initial: true })
        }),
        stress: new fields.SchemaField({
          quantity: new fields.NumberField({integer: true,  initial: 0 }),
          levels: new fields.NumberField({integer: true,  initial: 0 }),
          supernaturalLevels: new fields.NumberField({integer: true,  initial: 0 }),
        }),
        armor: new fields.SchemaField({
          ratingTotal: new fields.NumberField({integer: true,  initial: 0 }),
          costTotal: new fields.NumberField({integer: true,  initial: 0 })
        })
      }),
      abilities: new fields.SchemaField({
        preparedSpells: new fields.NumberField({integer: true,  initial: 0 })
      }),
      equipment: new fields.SchemaField({
        cypherLimit: new fields.NumberField({integer: true,  initial: 2 })
      }),
      notes: new fields.HTMLField({ initial: "", textSearch: true  }),
      gmNotes: new fields.HTMLField({ initial: "", textSearch: true  }),
      description: new fields.HTMLField({ initial: "", textSearch: true  }),
      settings: new fields.SchemaField({
        general: new fields.SchemaField({
          gameMode: new fields.StringField({ initial: "Cypher" }),
          rollTwoD20: new fields.BooleanField({ initial: false }),
          additionalSentence: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          }),
          additionalPool: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" }),
            hasEdge: new fields.BooleanField({ initial: false })
          }),
          showPrice: new fields.BooleanField({ initial: false }),
          tags: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            labelCategory1: new fields.StringField({ initial: "" }),
            labelCategory2: new fields.StringField({ initial: "" }),
            labelCategory3: new fields.StringField({ initial: "" }),
            labelCategory4: new fields.StringField({ initial: "" })
          }),
          hideArchive: new fields.BooleanField({ initial: false }),
          hideEmptyCategories: new fields.BooleanField({ initial: false }),
          hideFavoriteButton: new fields.BooleanField({ initial: false }),
          customSheetDesign: new fields.BooleanField({ initial: false }),
          background: new fields.SchemaField({
            image: new fields.StringField({ initial: "foundry" }),
            imagePath: new fields.FilePathField({ categories: ["IMAGE"] }),
            overlayOpacity: new fields.AlphaField({ initial: 0.75 }),
            icon: new fields.StringField({ initial: "none" }),
            iconPath: new fields.FilePathField({ categories: ["IMAGE"] }),
            iconOpacity: new fields.AlphaField({ initial: 0.5 })
          }),
          logo: new fields.SchemaField({
            image: new fields.StringField({ initial: "black" }),
            imagePath: new fields.FilePathField({ categories: ["IMAGE"] }),
            imageOpacity: new fields.AlphaField({ initial: 1 })
          })
        }),
        skills: new fields.SchemaField({
          sortByRating: new fields.BooleanField({ initial: false }),
          labelCategory1: new fields.StringField({ initial: "" }),
          labelCategory2: new fields.StringField({ initial: "" }),
          labelCategory3: new fields.StringField({ initial: "" }),
          labelCategory4: new fields.StringField({ initial: "" }),
          powerShifts: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" })
          })
        }),
        combat: new fields.SchemaField({
          stress: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" }),
            supernaturalStressActive: new fields.BooleanField({ initial: true }),
            supernaturalStressLabel: new fields.StringField({ initial: "" }),
          }),
          additionalStepDamageTrack: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" }),
          }),
          numberOneActionRecoveries: new fields.NumberField({integer: true,  initial: 1 }),
          numberTenMinuteRecoveries: new fields.NumberField({integer: true,  initial: 1 }),
          lastingDamage: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          ammo: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false })
          }),
          armor: new fields.SchemaField({
            active: new fields.BooleanField({ initial: true }),
          }),
        }),
        abilities: new fields.SchemaField({
          labelCategory1: new fields.StringField({ initial: "" }),
          labelCategory2: new fields.StringField({ initial: "" }),
          labelCategory3: new fields.StringField({ initial: "" }),
          labelCategory4: new fields.StringField({ initial: "" }),
          labelSpells: new fields.StringField({ initial: "" })
        }),
        equipment: new fields.SchemaField({
          labelCategory1: new fields.StringField({ initial: "" }),
          labelCategory2: new fields.StringField({ initial: "" }),
          labelCategory3: new fields.StringField({ initial: "" }),
          labelCategory4: new fields.StringField({ initial: "" }),
          currency: new fields.SchemaField({
            active: new fields.BooleanField({ initial: false }),
            hideLabels: new fields.BooleanField({ initial: false }),
            numberCategories: new fields.NumberField({integer: true,  initial: 1 }),
            labelCategory1: new fields.StringField({ initial: "" }),
            labelCategory2: new fields.StringField({ initial: "" }),
            labelCategory3: new fields.StringField({ initial: "" }),
            labelCategory4: new fields.StringField({ initial: "" }),
            labelCategory5: new fields.StringField({ initial: "" }),
            labelCategory6: new fields.StringField({ initial: "" }),
            quantity1: new fields.NumberField({integer: true,  initial: 0 }),
            quantity2: new fields.NumberField({integer: true,  initial: 0 }),
            quantity3: new fields.NumberField({integer: true,  initial: 0 }),
            quantity4: new fields.NumberField({integer: true,  initial: 0 }),
            quantity5: new fields.NumberField({integer: true,  initial: 0 }),
            quantity6: new fields.NumberField({integer: true,  initial: 0 })
          }),
          cyphers: new fields.SchemaField({
            active: new fields.BooleanField({ initial: true }),
            label: new fields.StringField({ initial: "" }),
            sortByType: new fields.BooleanField({ initial: false }),
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
            sortyByLevel: new fields.BooleanField({ initial: false }),
            label: new fields.StringField({ initial: "" }),
            displayMode: new fields.StringField({ initial: "price" }),
          })
        })
      }),
      teen: new fields.SchemaField({
        basic: new fields.SchemaField({
          name: new fields.StringField({ initial: "" }),
          img:  new fields.FilePathField({ categories: ["IMAGE"], initial: "icons/svg/mystery-man.svg" }),
          descriptor: new fields.StringField({ initial: "" })
        }),
        pools: new fields.SchemaField({
          might: new fields.SchemaField({
            value: new fields.NumberField({integer: true,  initial: 6 }),
            max:   new fields.NumberField({integer: true,  initial: 6 }),
            edge:  new fields.NumberField({integer: true,  initial: 0 })
          }),
          speed: new fields.SchemaField({
            value: new fields.NumberField({integer: true,  initial: 6 }),
            max:   new fields.NumberField({integer: true,  initial: 6 }),
            edge:  new fields.NumberField({integer: true,  initial: 0 })
          }),
          intellect: new fields.SchemaField({
            value: new fields.NumberField({integer: true,  initial: 6 }),
            max:   new fields.NumberField({integer: true,  initial: 6 }),
            edge:  new fields.NumberField({integer: true,  initial: 0 })
          }),
          additional: new fields.SchemaField({
            value: new fields.NumberField({integer: true,  initial: 3 }),
            max:   new fields.NumberField({integer: true,  initial: 3 })
          })
        }),
        combat: new fields.SchemaField({
          damageTrack: new fields.SchemaField({
            state: new fields.StringField({ initial: "Hale" }),
            applyImpaired:    new fields.BooleanField({ initial: true }),
            applyDebilitated: new fields.BooleanField({ initial: true })
          }),
          armor: new fields.SchemaField({
            ratingTotal: new fields.NumberField({integer: true,  initial: 0 }),
            costTotal:   new fields.NumberField({integer: true,  initial: 0 })
          })
        }),
        notes: new fields.HTMLField({ initial: "", textSearch: true  }),
        description: new fields.HTMLField({ initial: "", textSearch: true  }),
        settings: new fields.SchemaField({
          general: new fields.SchemaField({
            rollTwoD20: new fields.BooleanField({ initial: false }),
            additionalPool: new fields.SchemaField({
              label: new fields.StringField({ initial: "" }),
              active: new fields.BooleanField({ initial: false })
            }),
            customSheetDesign: new fields.BooleanField({ initial: false }),
            background: new fields.SchemaField({
              image: new fields.StringField({ initial: "foundry" }),
              imagePath: new fields.FilePathField({ categories: ["IMAGE"] }),
              overlayOpacity: new fields.AlphaField({ initial: 0.75 }),
              icon: new fields.StringField({ initial: "none" }),
              iconPath: new fields.FilePathField({ categories: ["IMAGE"] }),
              iconOpacity: new fields.AlphaField({ initial: 0.5 })
            }),
            logo: new fields.SchemaField({
              image: new fields.StringField({ initial: "black" }),
              imagePath: new fields.FilePathField({ categories: ["IMAGE"] })
            })
          })
        })
      })
    }
  }
}
