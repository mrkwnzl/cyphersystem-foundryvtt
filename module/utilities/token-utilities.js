export async function barBrawlOverwrite(document, actor) {
  await document.data.update({
    [`flags.-=barbrawl`]: null,
    "bar1.attribute": null,
    "bar2.attribute": null
  });
  await document.data.update(barBrawlData(actor.data.type, actor));
}

export function barBrawlData(type, actor) {
  let data;
  if (type === "PC") {
    data = {
      "flags.barbrawl.resourceBars": {
        "intellect": {
          id: "intellect",
          mincolor: "#0000FF",
          maxcolor: "#0000FF",
          position: "bottom-inner",
          attribute: "pools.intellect",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        },
        "speed": {
          id: "speed",
          mincolor: "#00FF00",
          maxcolor: "#00FF00",
          position: "bottom-inner",
          attribute: "pools.speed",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        },
        "might": {
          id: "might",
          mincolor: "#FF0000",
          maxcolor: "#FF0000",
          position: "bottom-inner",
          attribute: "pools.might",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        }
      }
    }
  } else if (type === "NPC" || type === "Companion") {
    data = {
      "flags.barbrawl.resourceBars": {
        "level": {
          id: "level",
          mincolor: "#0000FF",
          maxcolor: "#0000FF",
          position: "top-inner",
          attribute: "level",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        },
        "health": {
          id: "health",
          mincolor: "#FF0000",
          maxcolor: "#FF0000",
          position: "bottom-inner",
          attribute: "health",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        }
      }
    }
  } else if (type === "Community") {
    data = {
      "flags.barbrawl.resourceBars": {
        "rank": {
          id: "rank",
          mincolor: "#0000FF",
          maxcolor: "#0000FF",
          position: "top-inner",
          attribute: "rank",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        },
        "infrastructure": {
          id: "infrastructure",
          mincolor: "#0000FF",
          maxcolor: "#0000FF",
          position: "bottom-inner",
          attribute: "infrastructure",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        },
        "health": {
          id: "health",
          mincolor: "#FF0000",
          maxcolor: "#FF0000",
          position: "bottom-inner",
          attribute: "health",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        }
      }
    }
  } else if (type === "Token" && actor.name != "GMI Range") {
    data = {
      "flags.barbrawl.resourceBars": {
        "level": {
          id: "level",
          mincolor: "#0000FF",
          maxcolor: "#0000FF",
          position: "top-inner",
          attribute: "level",
          visibility: CONST.TOKEN_DISPLAY_MODES.OWNER
        },
        "quantity": {
          id: "quantity",
          mincolor: "#FF0000",
          maxcolor: "#FF0000",
          position: "bottom-inner",
          attribute: "quantity",
          visibility: CONST.TOKEN_DISPLAY_MODES.ALWAYS
        }
      }
    }
  }

  return data;
}