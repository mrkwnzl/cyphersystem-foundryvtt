# Cypher System for Foundry VTT

![GitHub Latest Release](https://img.shields.io/github/release/mrkwnzl/cyphersystem-foundryvtt?style=flat-square)
![GitHub All Releases](https://img.shields.io/github/downloads/mrkwnzl/cyphersystem-foundryvtt/total?style=flat-square)
![License](https://img.shields.io/github/license/mrkwnzl/cyphersystem-foundryvtt?style=flat-square)

This is a simple system for the Cypher System family of games (Cypher System, Numenera, The Strange, Predation, Unmasked, Gods of the Fall, Vurt, Shotguns & Sorcery).

It’s a very simple, yet very flexible digital character sheet, without any kind of automation. Included are some dice macros for the usual rolls in Cypher games. This allows players and GMs to use any rules interpretation and house rule they could use at a physical table. If you can do it at the table, you can do it with this system.

For an explanation of the various options, see ReadMe.
If you want a prettier, more elaborate character sheet with roll macros, SolarBear has you covered: [SolarBear’s Numenera System](https://foundryvtt.com/packages/numenera/)

## Highlights

- Support for Numenera and any Cypher System game (including Unmasked, Predation, and Gods of the Fall). You can use it for The Strange as well, but I couldn’t figure out an elegant way to handle recursions, so there are some creative ideas needed.
- An Unmasked mode in which you can switch between your Teen Form and Mask Form.
- An optional additional text field for your character sentence. You can use it for the Domain in Gods of the Fall, or to note down the flavor of your Type.
- Optional Power Shifts, including additional checkboxes for 1 Action Recovery Rolls. Handy for every superhero game, Gods of the Fall, or the Setting in Stay Alive!. The Power Shifts can be renamed to anything you like.
- An option for an additional pool, for people with the Luck Descriptor or the Datasphere in Numenera. This pool can be renamed to anything you like.

## Recommended Modules

Although this system does come with dice macros, I recommend to use [Simple Dice Roller](https://foundryvtt.com/packages/simple-dice-roller/) and [Dice So Nice!](https://foundryvtt.com/packages/dice-so-nice/). With that, you have all the dice you need for a Cypher game right in the toolbar. And they’re 3D, too!

For a quick overview of your stats, I recommend [Token Tooltip Alt](https://foundryvtt.com/packages/token-tooltip-alt/). I use these settings:
|color | icon | value |
|------|------|-------|
| Red | fa-fist-raised | pools.might |
| green | fa-running | pools.speed |
| blue | fa-brain | pools.intellect |

## Actor Types

There are 5 Actor Types, all with their own sheets:

1. PC
2. NPC
3. Companion (Predation)
4. Community (Numenera Destiny)
5. Token.

### The PC Sheet

The PC sheet consists of the basic information in the sheet header and tabs for skills, abilities, equipment, and character notes.

In the Settings Tab, you’ll find the following settings:

- **Game Mode:** Here you can choose between the default Cypher System and Unmasked. If you choose *Unmasked*, The Mask and Teen Sheet gets activated. Your character defaults to the mask form, but you’ll find a switch next to your character name where you can switch to the teen form. Your pools, skills, Combat Sheet, and abilities get replaced with the ones from the teen. You still only have shared recovery rolls, though, as per the rules.
- **Bonus to Initiative Rolls:** Here you can add a bonus or malus to the initiative roll in the combat tracker. This is to support the optional rule in Cypher to act in order of the initiative roll result. Add -3/3/6 for inability/trained/specialized in initiative rolls.
- **Additional Sentence Field:** This add another text field next to your focus. Use this for your domain in Gods of the Fall, your race in Shotguns & Sorcery, or the flavor of your type. You can rename this field.
- **Additional Pool:** This adds a fourth pool to your stat pools. This one doesn’t have an Edge, though. Use this for Luck, Determination, or the Datasphere. You can rename this pool.
- **Power Shifts:** This adds a list of Power Shifts to the Skill Tab. You can rename those, for example to “Divine Shifts” (Gods of the Fall) or “Blood Shifts” (Stay Alive!).
- **Additional Recovery Rolls:** This adds additional checkboxes to the 1 Action recovery rolls. If you play in Unmasked Mode, those get only added to your Mask Form, as they most likely come from Power Shifts.
- **Lasting/Permanent Damage:** This adds a list for lastinf and permanent damage to your Combat Tab. Use this when you use the optional rule for lasting damage (Cypher System,  436; Numenera Discovery, 344) or when playing Vurt.
- **Currency:** This adds a currency field in the Equipment Tab. You can rename the  currency for your game.
- **Cyphers, Artifacts, Oddities, and Crafting Material:** This adds lists for cyphers, artifacts, oddities, and crafting material in the Equipment Tab. Use this if your game has these. You can rename the crafting material to something fitting for your game.

### The NPC Sheet

The NPC sheet is for your NPC needs. It has text fields for Level, Health, Damage, and Armor, for easy reference. You can copy & paste the description of the NPC into the editor.

I recommend adding the level and health bar to the token of NPCs. This greatly speeds up the game, in my experience.

### The Companion Sheet

The Companion sheet is intended for use with Predation, but might be helpful in other games. Pretty self-explanatory. Let me know if you have questions.

### The Community Sheet

The Community sheet is used for communities from Numenera Destiny. Can be used in other games as well. Should also be self-explanatory. Let me know if you have questions.

### The Token Sheet

The Token Sheet is a catch-all sheet for everything else. I use it for actual tokens on the virtual game table. I don’t use maps, but a virtual desktop (see screenshots), where we move around tokens like we do on an actual physical table. We use it for XP tokens, Cyphers, counting ammo and time, and temporary equipment.

It comes with a field for a level and a quantity, you that you can use it to count stuff.

## Dice Macros

In the compendium tab, you find a number of dice macros you can copy to your macro bar. These are:

### Quick Roll

This is intended for quick and simple stat rolls. It rolls a d20 and tells you what difficulty you beat, and whether a GM Intrusion occurs, whether you deal extra damage, and whether a minor or major effect occurs.

### Eased/Hindered Roll

This works like the quick roll, but you can tell the GM by how many steps the roll should be eased or hindered. This is useful in situations where your GM does not tell the difficulty beforehand or in situations where multiple players make simultaneous rolls, each eased or hindered differently, so that it’s easy for the GM to see if the rolls succeeded or not.

### Eased/Hindered Roll (Effective Difficulty)

This works like the eased/hindered rolls, but the steps eased or hindered are added and subtracted from the difficulty, respectively. In effect, this gives the effective difficulty that gets beaten by the roll. For example, if you roll an 11 on a roll that is eased by one step, the macro tells you that you beat difficulty 4 (3+1). If you were hindered, it would have told you that you beat difficulty 2 (3-1) instead.

### d6/d10/d20/d100

Those are the other dice rolls often needed in Cypher games, for rolling on tables, depletion rolls, recovery rolls, and so on.

## Roadmap

Right now, it’s pretty feature complete for my use cases. Let me know if you miss anything and I’ll see what I can do.

I don’t plan on any automation. So no automatic calculation of stat pool costs for using Effort and abilities or automatically calculated recovery rolls. This is way too dynamic in play and in my experience, filling out a form to make a roll is neither fun nor quicker than just doing it in your head. [SolarBear’s Numenera System](https://foundryvtt.com/packages/numenera/) does this well, if you want that kind of automation in your VTT.

## Credits

I used code snippets from [Simple Worldbuilding System](https://gitlab.com/foundrynet/worldbuilding/-/tree/master) and the [Boilerplate System](https://foundry-vtt-community.github.io/wiki/SD01-Getting-started/) by @asacolips#1867. I used the tutorials on the [Foundry VTT Wiki](https://foundry-vtt-community.github.io/wiki/).

My good friend Christian Tietze ([christiantietze.de](https://christiantietze.de)) helps whenever I hit a roadblock. Thanks!

@Macaroons#6574 on Discord provided me with valuable feedback and ideas. Thanks!
