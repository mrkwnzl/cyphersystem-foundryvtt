/**
* Event listeners for buttons on the actor sheets.
* @param {ActorSheet} actorSheet The actor sheet that gets listened to.
*/
export function eventListeners(actorSheet, html) {
  // Everything below here is only needed if the sheet is editable
  if (!actorSheet.options.editable) return;

  function showSheetForActorAndItemWithID(actor, itemID) {
    const item = actor.getOwnedItem(itemID);
    item.sheet.render(true);
  }

  function itemForClickEvent(clickEvent) {
    return $(clickEvent.currentTarget).parents(".item");
  }

  // Add Inventory Item
  html.find('.item-create').click(clickEvent => {
    const itemCreatedPromise = actorSheet._onItemCreate(clickEvent);
    itemCreatedPromise.then(itemData => {
      showSheetForActorAndItemWithID(actorSheet.actor, itemData._id);
    });
  });

  // Update Inventory Item
  html.find('.item-edit').click(clickEvent => {
    const editedItem = itemForClickEvent(clickEvent);
    showSheetForActorAndItemWithID(actorSheet.actor, editedItem.data("itemId"));
  });

  // Delete Inventory Item
  html.find('.item-delete').click(clickEvent => {
    const deletedItem = itemForClickEvent(clickEvent);
    if (event.ctrlKey || event.metaKey) {
      actorSheet.actor.deleteOwnedItem(deletedItem.data("itemId"));
      deletedItem.slideUp(200, () => actorSheet.render(false));
    } else {
      const item = duplicate(actorSheet.actor.getEmbeddedEntity("OwnedItem", deletedItem.data("itemId")));

      if (item.data.archived === true) {
        item.data.archived = false;
      }
      else {
        item.data.archived = true;
      }
      actorSheet.actor.updateEmbeddedEntity('OwnedItem', item);
    }
  });

  // Show Item Description
  html.find('.item-description').click(clickEvent => {
    const shownItem = itemForClickEvent(clickEvent);
    const item = duplicate(actorSheet.actor.getEmbeddedEntity("OwnedItem", shownItem.data("itemId")));
    if (event.ctrlKey || event.metaKey) {
      let message = "";
      let brackets = "";
      // let description = "";
      let description = "<hr style='margin:3px 0;'><img class='description-image-chat' src='" + item.img + "' width='50' height='50'/>" + item.data.description;
      let points = "";
      let notes = "";
      if (item.data.notes != "") notes = ", " + item.data.notes;
      if (item.type == "skill" || item.type == "teen Skill") {
        brackets = " (" + item.data.skillLevel + ")";
      } else if (item.type == "power Shift") {
        brackets = " (" + item.data.powerShiftValue + " " + game.i18n.localize("CYPHERSYSTEM.Shifts") + ")";
      } else if (item.type == "ability" || item.type == "teen Ability") {
        points = (item.data.costPoints == "1") ? " " + game.i18n.localize("CYPHERSYSTEM.Point") : " " + game.i18n.localize("CYPHERSYSTEM.Points");
        if (item.data.costPoints != 0 && item.data.costPoints != 0) brackets = " (" + item.data.costPoints + " " + item.data.costPool + points + ")";
      } else if (item.type == "attack") {
        points = (item.data.damage == 1) ? " " + game.i18n.localize("CYPHERSYSTEM.PointOfDamage") : " " + game.i18n.localize("CYPHERSYSTEM.PointsOfDamage");
        let damage = ", " + item.data.damage + " " + points;
        let attackType = item.data.attackType;
        let range = "";
        if (item.data.range != "") range = ", " + item.data.range;
        brackets = " (" + attackType + damage + range + notes + ")";
      } else if (item.type == "armor" || item.type == "teen Armor") {
        brackets = " (" + item.data.armorType + notes + ")";
      } else if (item.type == "lasting Damage"){
        let permanent = "";
        if (item.data.damageType == "Permanent") permanent = ", " + game.i18n.localize("CYPHERSYSTEM.permanent");
        brackets = " (" + item.data.lastingDamagePool + permanent + ")";
      } else {
        if (item.data.level != "") brackets = " (" + game.i18n.localize("CYPHERSYSTEM.level") + " " + item.data.level + ")";
      }
      message = "<b>" + item.type.capitalize() + ": " + item.name + "</b>" + brackets + description;
      ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: message
      })
    } else {
      if (item.data.showDescription === true) {
        item.data.showDescription = false;
      }
      else {
        item.data.showDescription = true;
      }
      actorSheet.actor.updateEmbeddedEntity('OwnedItem', item);
    }
  });

  // Change Armor Active
  html.find('.armor-active').click(clickEvent => {
    const shownItem = itemForClickEvent(clickEvent);
    const item = duplicate(actorSheet.actor.getEmbeddedEntity("OwnedItem", shownItem.data("itemId")));
    if (item.data.armorActive === true) {
      item.data.armorActive = false;
    }
    else {
      item.data.armorActive = true;
    }
    actorSheet.actor.updateEmbeddedEntity('OwnedItem', item);
  });

  // Increase Might
  html.find('.increase-might').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.pools.might.value + amount;
    actorSheet.actor.update({"data.pools.might.value": newValue});
  });

  // Decrease Might
  html.find('.decrease-might').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.pools.might.value - amount;
    actorSheet.actor.update({"data.pools.might.value": newValue});
  });

  // Increase Teen Might
  html.find('.increase-teen-might').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.teen.pools.might.value + amount;
    actorSheet.actor.update({"data.teen.pools.might.value": newValue});
  });

  // Decrease Teen Might
  html.find('.decrease-teen-might').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.teen.pools.might.value - amount;
    actorSheet.actor.update({"data.teen.pools.might.value": newValue});
  });

  // Increase Speed
  html.find('.increase-speed').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.pools.speed.value + amount;
    actorSheet.actor.update({"data.pools.speed.value": newValue});
  });

  // Decrease Speed
  html.find('.decrease-speed').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.pools.speed.value - amount;
    actorSheet.actor.update({"data.pools.speed.value": newValue});
  });

  // Increase Teen Speed
  html.find('.increase-teen-speed').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.teen.pools.speed.value + amount;
    actorSheet.actor.update({"data.teen.pools.speed.value": newValue});
  });

  // Decrease Teen Speed
  html.find('.decrease-teen-speed').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.teen.pools.speed.value - amount;
    actorSheet.actor.update({"data.teen.pools.speed.value": newValue});
  });

  // Increase Intellect
  html.find('.increase-intellect').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.pools.intellect.value + amount;
    actorSheet.actor.update({"data.pools.intellect.value": newValue});
  });

  // Decrease Intellect
  html.find('.decrease-intellect').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.pools.intellect.value - amount;
    actorSheet.actor.update({"data.pools.intellect.value": newValue});
  });

  // Increase Teen Intellect
  html.find('.increase-teen-intellect').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.teen.pools.intellect.value + amount;
    actorSheet.actor.update({"data.teen.pools.intellect.value": newValue});
  });

  // Decrease Teen Intellect
  html.find('.decrease-teen-intellect').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.teen.pools.intellect.value - amount;
    actorSheet.actor.update({"data.teen.pools.intellect.value": newValue});
  });

  // Increase Additional
  html.find('.increase-additional').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.pools.additional.value + amount;
    actorSheet.actor.update({"data.pools.additional.value": newValue});
  });

  // Decrease Additional
  html.find('.decrease-additional').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.pools.additional.value - amount;
    actorSheet.actor.update({"data.pools.additional.value": newValue});
  });

  // Increase Teen Additional
  html.find('.increase-teen-additional').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.teen.pools.additional.value + amount;
    actorSheet.actor.update({"data.teen.pools.additional.value": newValue});
  });

  // Decrease Teen Additional
  html.find('.decrease-teen-additional').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.teen.pools.additional.value - amount;
    actorSheet.actor.update({"data.teen.pools.additional.value": newValue});
  });

  // Increase XP
  html.find('.increase-xp').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.basic.xp + amount;
    actorSheet.actor.update({"data.basic.xp": newValue});
  });

  // Decrease XP
  html.find('.decrease-xp').click(clickEvent => {
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    let newValue = actorSheet.actor.data.data.basic.xp - amount;
    actorSheet.actor.update({"data.basic.xp": newValue});
  });

  // Add 1 to Quantity
  html.find('.plus-one').click(clickEvent => {
    const shownItem = itemForClickEvent(clickEvent);
    const item = duplicate(actorSheet.actor.getEmbeddedEntity("OwnedItem", shownItem.data("itemId")));
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    item.data.quantity = item.data.quantity + amount;
    actorSheet.actor.updateEmbeddedEntity('OwnedItem', item);
  });

  // Subtract 1 from Quantity
  html.find('.minus-one').click(clickEvent => {
    const shownItem = itemForClickEvent(clickEvent);
    const item = duplicate(actorSheet.actor.getEmbeddedEntity("OwnedItem", shownItem.data("itemId")));
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    item.data.quantity = item.data.quantity - amount;
    actorSheet.actor.updateEmbeddedEntity('OwnedItem', item);
  });

  // Add 1 to Lasting Damage
  html.find('.plus-one-damage').click(clickEvent => {
    const shownItem = itemForClickEvent(clickEvent);
    const item = duplicate(actorSheet.actor.getEmbeddedEntity("OwnedItem", shownItem.data("itemId")));
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    item.data.lastingDamageAmount = item.data.lastingDamageAmount + amount;
    actorSheet.actor.updateEmbeddedEntity('OwnedItem', item);
  });

  // Subtract 1 from Lasting Damage
  html.find('.minus-one-damage').click(clickEvent => {
    const shownItem = itemForClickEvent(clickEvent);
    const item = duplicate(actorSheet.actor.getEmbeddedEntity("OwnedItem", shownItem.data("itemId")));
    let amount = (event.ctrlKey || event.metaKey) ? 10 : 1;
    item.data.lastingDamageAmount = item.data.lastingDamageAmount - amount;
    actorSheet.actor.updateEmbeddedEntity('OwnedItem', item);
  });

  // Reset Might
  html.find('.reset-might').click(clickEvent => {
    actorSheet.actor.update({
      "data.pools.might.value": actorSheet.actor.data.data.pools.might.max
    }).then(item => {
      actorSheet.render();
    });
  });

  // Reset Speed
  html.find('.reset-speed').click(clickEvent => {
    actorSheet.actor.update({
      "data.pools.speed.value": actorSheet.actor.data.data.pools.speed.max
    }).then(item => {
      actorSheet.render();
    });
  });

  // Reset Intellect
  html.find('.reset-intellect').click(clickEvent => {
    actorSheet.actor.update({
      "data.pools.intellect.value": actorSheet.actor.data.data.pools.intellect.max
    }).then(item => {
      actorSheet.render();
    });
  });

  // Reset Additional Pool
  html.find('.reset-additionalPool').click(clickEvent => {
    actorSheet.actor.update({
      "data.pools.additional.value": actorSheet.actor.data.data.pools.additional.max
    }).then(item => {
      actorSheet.render();
    });
  });

  // Reset Additional Teen Pool
  html.find('.reset-teen-additionalPool').click(clickEvent => {
    actorSheet.actor.update({
      "data.teen.pools.additional.value": actorSheet.actor.data.data.teen.pools.additional.max
    }).then(item => {
      actorSheet.render();
    });
  });

  // Reset Teen Might
  html.find('.reset-teen-might').click(clickEvent => {
    actorSheet.actor.update({
      "data.teen.pools.might.value": actorSheet.actor.data.data.teen.pools.might.max
    }).then(item => {
      actorSheet.render();
    });
  });

  // Reset Teen Speed
  html.find('.reset-teen-speed').click(clickEvent => {
    actorSheet.actor.update({
      "data.teen.pools.speed.value": actorSheet.actor.data.data.teen.pools.speed.max
    }).then(item => {
      actorSheet.render();
    });
  });

  // Reset Teen Might
  html.find('.reset-teen-intellect').click(clickEvent => {
    actorSheet.actor.update({
      "data.teen.pools.intellect.value": actorSheet.actor.data.data.teen.pools.intellect.max
    }).then(item => {
      actorSheet.render();
    });
  });

  // Reset Advancements
  html.find('.reset-advancement').click(clickEvent => {
    actorSheet.actor.update({
      "data.advancement.advStats": false,
      "data.advancement.advEffort": false,
      "data.advancement.advEdge": false,
      "data.advancement.advSkill": false,
      "data.advancement.advOther": false
    }).then(item => {
      actorSheet.render();
    });
  });

  // Reset Recovery Rolls
  html.find('.reset-recovery-rolls').click(clickEvent => {
    actorSheet.actor.update({
      "data.recoveries.oneAction": false,
      "data.recoveries.oneActionTwo": false,
      "data.recoveries.oneActionThree": false,
      "data.recoveries.oneActionFour": false,
      "data.recoveries.oneActionFive": false,
      "data.recoveries.tenMinutes": false,
      "data.recoveries.oneHour": false,
      "data.recoveries.tenHours": false
    }).then(item => {
      actorSheet.render();
    });
  });

  // Drag events for macros.
  if (actorSheet.actor.owner) {
    let handler = ev => actorSheet._onDragStart(ev);
    // Find all items on the character sheet.
    html.find('li.item').each((i, li) => {
      // Ignore for the header row.
      if (li.classList.contains("item-header")) return;
      if (li.classList.contains("non-draggable")) return;
      if (li.classList.contains("item-settings")) return;
      // Add draggable attribute and dragstart listener.
      li.setAttribute("draggable", true);
      li.addEventListener("dragstart", handler, false);
    });
  }
}
