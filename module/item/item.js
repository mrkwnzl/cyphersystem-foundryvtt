/**
* Extend the base Actor entity by defining a custom roll data structure which is ideal for the Cypher system.
* @extends {Actor}
*/
export class CypherItem extends Item {
  /** @override */
  prepareData() {
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing derived data.
  }

  prepareDerivedData() {
    const itemData = this;
    const systemData = itemData.system;
    const flags = itemData.flags.cyphersystem || {};

    // Make separate methods for each Item type (character, npc, etc.) to keep
    // things organized.
    this._prepareAttackData(itemData);
  }

  _prepareAttackData(itemData) {
    if (itemData.type !== 'attack') return;

    // Make modifications to data here.
    const systemData = itemData.system;

    let skillRating = 0;
    // parseInt to correct old error
    let modifiedBy = parseInt(systemData.basic.steps);
    let totalModifier = 0;
    let totalModified = "";

    if (systemData.basic.skillRating == "Inability") skillRating = -1;
    if (systemData.basic.skillRating == "Trained") skillRating = 1;
    if (systemData.basic.skillRating == "Specialized") skillRating = 2;

    if (systemData.basic.modifier == "hindered") modifiedBy = modifiedBy * -1;

    totalModifier = skillRating + modifiedBy;

    if (totalModifier == 1) totalModified = game.i18n.localize("CYPHERSYSTEM.eased");
    if (totalModifier >= 2) totalModified = game.i18n.format("CYPHERSYSTEM.easedBySteps", {amount: totalModifier});
    if (totalModifier == -1) totalModified = game.i18n.localize("CYPHERSYSTEM.hindered");
    if (totalModifier <= -2) totalModified = game.i18n.format("CYPHERSYSTEM.hinderedBySteps", {amount: Math.abs(totalModifier)});

    // Assign values
    systemData.totalModified = totalModified;
  }

  async _buildEmbedHTML(config, options) {
    const embed = await super._buildEmbedHTML(config, options);
    if (embed) return embed;
    // As per foundry.js: JournalEntryPage#_embedTextPage
    options = {...options, _embedDepth: options._embedDepth + 1, relativeTo: this};
    const {
      secrets = options.secrets,
      documents = options.documents,
      links = options.links,
      rolls = options.rolls,
      embeds = options.embeds
    } = config;
    foundry.utils.mergeObject(options, {secrets, documents, links, rolls, embeds});

    let toEnrich;
    let key;

    if (config.prependCite) {
      let poolCost = (this.system.basic.cost && this.type === "ability") ? this.system.basic.cost : "";
      if (this.type === "ability" && this.system.basic.cost !== "0") {

        if (this.system.basic.cost) {
          switch (this.system.basic.pool) {
            case "Might": poolCost = " (" + poolCost + " " + ((parseInt(this.system.basic.cost) > 1) ? game.i18n.localize("CYPHERSYSTEM.MightPoints") : game.i18n.localize("CYPHERSYSTEM.MightPoint")) + ")"; break;
            case "Speed": poolCost = " (" + poolCost + " " + ((parseInt(this.system.basic.cost) > 1) ? game.i18n.localize("CYPHERSYSTEM.SpeedPoints") : game.i18n.localize("CYPHERSYSTEM.SpeedPoint")) + ")"; break;
            case "Intellect": poolCost = " (" + poolCost + " " + ((parseInt(this.system.basic.cost) > 1) ? game.i18n.localize("CYPHERSYSTEM.IntellectPoints") : game.i18n.localize("CYPHERSYSTEM.IntellectPoint")) + ")"; break;
            case "Pool": poolCost = " (" + poolCost + " " + ((parseInt(this.system.basic.cost) > 1) ? game.i18n.localize("CYPHERSYSTEM.AnyPoolPoints") : game.i18n.localize("CYPHERSYSTEM.AnyPoolPoint")) + ")"; break;
            case "XP": poolCost = " (" + poolCost + " " + game.i18n.localize("CYPHERSYSTEM.XPPoints") + ")"; break;
          }
        }
      }

      let prependCiteLabel = (config.prependCiteLabel) ? config.prependCiteLabel : this.name;
      let prependCite = "<strong>@UUID[" + this.uuid + "]{" + prependCiteLabel + poolCost + "}:</strong> ";

      key = "CYPHERSYSTEM.Embed.prependCite";

      toEnrich = game.i18n.format(key, {
        prependCite: prependCite,
        description: this.system.description.replace(/^<p>/, "").replace(/<\/p>$/, "")  // strip leading <p> and trailing </p>
      });
    } else {
      toEnrich = this.system.description;
    }

    const container = document.createElement("div");
    container.innerHTML = await TextEditor.enrichHTML(toEnrich);
    return container.children;
  }
}
