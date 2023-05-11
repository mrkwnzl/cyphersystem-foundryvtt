/**
* Extend the basic ItemSheet with some very simple modifications
* @extends {ItemSheet}
*/

import {getBackgroundIcon, getBackgroundIconOpacity, getBackgroundImage, getBackgroundImageOverlayOpacity, getBackgroundImagePath} from "../forms/sheet-customization.js";
import {renameTag} from "../macros/macro-helper.js";
import {htmlEscape} from "../utilities/html-escape.js";

export class CypherItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cyphersystem", "sheet", "item", "item-sheet"],
      width: 550,
      resizable: false,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      scrollY: [".sheet-body", ".tab"]
    });
  }

  /** @override */
  get template() {
    const path = "systems/cyphersystem/templates/item-sheets";
    const itemType = this.item.type;
    return `${path}/${itemType}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData() {
    const data = await super.getData();

    // Sheet settings
    data.sheetSettings = {};
    data.sheetSettings.isGM = game.user.isGM;
    data.sheetSettings.isObserver = !this.options.editable;
    data.sheetSettings.rollButtons = game.settings.get("cyphersystem", "rollButtons");
    data.sheetSettings.spells = game.i18n.localize("CYPHERSYSTEM.Spells");
    data.sheetSettings.identified = this.item.system.basic?.identified;

    // Enriched HTML
    data.enrichedHTML = {};
    data.enrichedHTML.description = await TextEditor.enrichHTML(this.item.system.description, {async: true, secrets: this.item.isOwner, relativeTo: this.item});

    data.actor = data.item.parent ? data.item.parent : "";

    // Sheet customizations
    // -- Get root css variables
    let root = document.querySelector(':root');

    // -- Sheet settings
    data.sheetSettings.backgroundImageBaseSetting = "background-image";

    data.sheetSettings.backgroundImage = getBackgroundImage();
    data.sheetSettings.backgroundImagePath = getBackgroundImagePath();
    data.sheetSettings.backgroundImageOverlayOpacity = getBackgroundImageOverlayOpacity();
    data.sheetSettings.backgroundIcon = getBackgroundIcon();
    data.sheetSettings.getBackgroundIconOpacity = getBackgroundIconOpacity();

    if (data.sheetSettings.backgroundImage == "custom") {
      root.style.setProperty('--custom-background-image-path', `url(/${data.sheetSettings.backgroundImagePath})`);
      root.style.setProperty('--custom-background-overlay-opacity', data.sheetSettings.backgroundImageOverlayOpacity);
    }

    if (data.sheetSettings.backgroundIcon == "custom") {
      if (!data.sheetSettings.backgroundIconPath) {
        data.sheetSettings.backgroundIconPath = "/systems/cyphersystem/icons/background/icon-transparent.webp";
      }
      root.style.setProperty('--custom-background-icon-opacity', data.sheetSettings.getBackgroundIconOpacity);
    } else {
      data.sheetSettings.backgroundIconPath = "/systems/cyphersystem/icons/background/icon-" + getBackgroundIcon() + ".svg";
    }

    data.sheetEffects = await this._getEffects();

    return data;
  }

  async _getEffects() {
    const temporary = new Array();
    const permanent = new Array();
    for (const effect of this.item.effects) {
        const val = {
            id: effect.id,
            label: effect.label,
            icon: effect.icon,
            disabled: effect.disabled,
            //favorite: effect.getFlag('swade', 'favorite') ?? false,
        };
        if (effect.origin) {
            val.origin = await effect._getSourceName();
        }
        if (effect.isTemporary) {
            temporary.push(val);
        }
        else {
            permanent.push(val);
        }
    }
    return { temporary, permanent };
  }


  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    html.find('.identify-item').click(clickEvent => {
      if (this.item.system.basic.identified) {
        this.item.update({"system.basic.identified": false});
      } else {
        this.item.update({"system.basic.identified": true});
      }
    });

    html.find('.input-tag').change(changeEvent => {
      if (!this.item.actor?.id) return;
      let currentTag = "#" + htmlEscape(this.item.name.trim());
      let newTag = "#" + htmlEscape(changeEvent.target.value.trim());
      let actor = game.actors.get(this.item.actor.id);

      renameTag(actor, currentTag, newTag);
    });

    html.find('.input-recursion').change(changeEvent => {
      if (!this.item.actor?.id) return;
      let currentTag = "@" + htmlEscape(this.item.name.trim());
      let newTag = "@" + htmlEscape(changeEvent.target.value.trim());
      let actor = game.actors.get(this.item.actor.id);

      renameTag(actor, currentTag, newTag);
    });

    /**
     * Active Effects
     */
    html.find('.effect-action').on('click', (ev) => {
      const a = ev.currentTarget;
      const effectId = a.closest('li').dataset.effectId;
      const effect = this.item.effects.get(effectId, { strict: true });
      const action = a.dataset.action;
      switch (action) {
        case 'edit':
          return effect.sheet?.render(true);
        case 'delete':
          return effect.deleteDialog();
        case 'toggle':
          return effect.update({ disabled: !effect?.disabled });
        case 'open-origin':
          fromUuid(effect.data?.origin).then((item) => {
            this.item.items.get(item.id)?.sheet?.render(true);
          });
          break;
        default:
          console.warn(`The action ${action} is not currently supported`);
          break;
      }
    });

    html.find('.effect-add').on('click', (ev) => {
      this._createActiveEffect()
    })
  }

  async _createActiveEffect() {
    const newEffect = await CONFIG.ActiveEffect.documentClass.create({
        label: game.i18n.format('DOCUMENT.New', {
            type: game.i18n.localize('DOCUMENT.ActiveEffect'),
        }),
        icon: "icons/svg/aura.svg",
        transfer: true,
    }, { parent: this.item });
    newEffect?.sheet?.render(true);
  }
}
