export async function barBrawlOverwrite(document, actor) {
  await document.updateSource({
    [`flags.-=barbrawl`]: null,
    "bar1.attribute": null,
    "bar2.attribute": null
  });
  await document.updateSource(barBrawlData(actor.type, actor));
}

export function barBrawlData(type, actor) {
  let data;
  if (type === "pc") {
    data = {
      "flags.barbrawl.resourceBars": {
        "intellect": {
          id: "intellect",
          mincolor: "#0000FF",
          maxcolor: "#0000FF",
          position: "bottom-inner",
          attribute: "pools.intellect",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
        },
        "speed": {
          id: "speed",
          mincolor: "#00FF00",
          maxcolor: "#00FF00",
          position: "bottom-inner",
          attribute: "pools.speed",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
        },
        "might": {
          id: "might",
          mincolor: "#FF0000",
          maxcolor: "#FF0000",
          position: "bottom-inner",
          attribute: "pools.might",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
        }
      }
    };
  } else if (type === "npc" || type === "companion") {
    data = {
      "flags.barbrawl.resourceBars": {
        "level": {
          id: "level",
          mincolor: "#0000FF",
          maxcolor: "#0000FF",
          position: "top-inner",
          attribute: "basic.level",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
        },
        "health": {
          id: "health",
          mincolor: "#FF0000",
          maxcolor: "#FF0000",
          position: "bottom-inner",
          attribute: "pools.health",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
        }
      }
    };
  } else if (type === "community") {
    data = {
      "flags.barbrawl.resourceBars": {
        "rank": {
          id: "rank",
          mincolor: "#0000FF",
          maxcolor: "#0000FF",
          position: "top-inner",
          attribute: "basic.rank",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
        },
        "infrastructure": {
          id: "infrastructure",
          mincolor: "#0000FF",
          maxcolor: "#0000FF",
          position: "bottom-inner",
          attribute: "pools.infrastructure",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
        },
        "health": {
          id: "health",
          mincolor: "#FF0000",
          maxcolor: "#FF0000",
          position: "bottom-inner",
          attribute: "pools.health",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
        }
      }
    };
  } else if (type === "marker" && actor.name != "GMI Range") {
    data = {
      "flags.barbrawl.resourceBars": {
        "level": {
          id: "level",
          mincolor: "#0000FF",
          maxcolor: "#0000FF",
          position: "top-inner",
          attribute: "basic.level",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER
        },
        "quantity": {
          id: "quantity",
          mincolor: "#FF0000",
          maxcolor: "#FF0000",
          position: "bottom-inner",
          attribute: "pools.quantity",
          visibility: CONST.TOKEN_DISPLAY_MODES.ALWAYS
        }
      }
    };
  }

  return data;
}