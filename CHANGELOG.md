# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.26.1] - 2021-10-24
### Changed
- Updated translations.
- Updated compatibility to Foundry v9.

### Fixed
- You can now drag & drop multiple cyphers, artifacts, and oddities with the same name onto the character sheet.
- When dragging & dropping items between character sheets, the new item is created after you decide what to do with the original item. If you cancel that decision, there aren’t any duplicate items anymore.
- Slight adjustments in the css.
- The tabs on the actor sheets now work with Foundry v9.
- The name of first skill category is now applied to the character and item sheets correctly.

## [1.26.0] - 2021-10-03
### Added
- The heading for skills can now be renamed.
- Skills can now also sorted into categories, just like abilities. If you are playing Unmasked, this can only be done for Mask skills.

## [1.25.0] - 2021-09-27
### Added
- The headings for abilities and spells can now be renamed.
- Abilities can now be sorted into 4 (plus spells) categories, which can be defined for each PC individually. If you are playing Unmasked, this can only be done for Mask abilities.

### Changed
- **BREAKING:** If you have sorted abilities as spells, those need to be reassigned, as I had to change how this is done.
- Settings not applicable to the Teen form are hidden on the Teen sheet when using Unmasked mode.
- Cyphers can now be hidden in the equipment tab.

### Fixed
- Removed leftover token on Tabletop (dark) scene.

## [1.24.1] - 2021-09-17
### Added
- New darker variant of the Tabletop scene.

### Changed
- Subtly improved Tabletop scene.
- Roll macros show the target number for the beaten difficulty, unless the effective difficulty setting is enabled (too confusing in this case).
- Updated ReadMe.

### Fixed
- Fixed small typos introduced in the last update due to new formatting.

## [1.24.0] - 2021-09-07
### Added
- Abilities can now be sorted as spells (CSR, 259) in the settings of the ability sheet. If one is sorted this way, a separate list for spells appears. You can note how many of those spells are prepared, with the rest being spells from the spellbook. The idea is to archive spells in the spellbook, while prepared spells stay unarchived. If the roll buttons are enabled in the system settings, there’s a new button to mark the first unused recovery roll when casting the spell, in addition to the usual button to pay the pool points.

### Changed
- The behavior when pressing alt while moving items between actors has been flipped. Holding alt while moving items duplicates the item. The default now is that a dialog shows up asking what should be done with the original item or asking how many items should be moved.
- Updated Fan Use Policy in the ReadMe.
- Newly created abilities now start with “Any Pool” for its cost instead of “Might.”
- The display of armor rating and Speed effort cost has been streamlined in order to use less horizontal space.
- The order of the armor rating and Speed cost on the armor sheet has been reversed in order to make it the same as it’s displayed on the PC sheet.

### Fixed
- Fixed an issue with the chat output of rolls if the title or the description of the roll had single quotation marks in them.
- Fixed the editor height on actor sheets, which was 10px too low.
- Fixed armor list on non-PC sheets (which can be enabled on a token-by-token basis with the secret setting macro).
- The item type now appears translated in the chat when using roll buttons.

### Removed
- The All-in-One Roll macro replaced the Quick Roll (Template) macro. Existing macros remain functional.

## [1.23.4] - 2021-08-19
### Added
- Added “n/a” as an option for weapon and armor types. Shields and some Ptolus weapons don’t have a type and this adds support for that.

### Changed
- Reset stat pool buttons now respect lasting damage (as long as it’s not archived).
- Compatibility bumped to 0.8.9.
- Updated translations.

### Fixed
- Task eased/hindered in roll chat output is now in the correct place.
- Teen abilities now work with the pool point buttons.
- Teen abilities can now be paid with XP.
- Removed roll buttons from non-PC sheets. If you need to roll for actors that aren’t PCs, please use the roll macros.
- Clarified the licenses involved in the ReadMe.
- Corrected some minor typos.

## [1.23.3] - 2021-08-12
### Changed
- The way tags are handled have been improved. There is a new macro replacing the two old macros to (un)archive items with tags, which combines both and allows for multiple tags to be specified. This way, multiple equipment sets, spell books, or active abilities can be specified in a single macro and be changed with a single click.

### Fixed
- Order of skill level on (teen) attack sheets has been reversed in order to bring it in line with the skill sheets.
- Correction of minor typos.
- Slight CSS tweaks.

## [1.23.2] - 2021-08-10
### Changed
- I’m using a new format for the changelog.

### Fixed
- The hit box for the stat reset buttons don’t include the margin-left anymore.
- The tabs on non-PC actor sheets now don’t line break anymore for several languages.

## [1.23.1] - 2021-08-10
### Changed
- Moved reset stat button slightly to the right in order to avoid accidental clicking.
- Updated French translation.

### Fixed
- Labels on non-PC actor sheets are centered again.
- Better description of impaired/debilitated for calculation

## [1.23.0] - 2021-08-08
**Note:** This is a bigger update than I anticipated with less testing than would be needed. Please report any bugs on [GitHub](https://github.com/mrkwnzl/cyphersystem-foundryvtt/issues/new?assignees=mrkwnzl&labels=bug&template=bug_report.md), the Foundry VTT Discord, or the [Cypher FVTT Dev Discord](https://discord.gg/C5zGgtyhwa).

### Added
- The All-in-One dialog now has a button to just pay the pool point cost without rolling.
- When using a roll button or macro for any item, the item description can be shown in the chat by clicking the chat title.
- The impaired and debilitated status now can now be set to be ignored when using roll or pay pool point buttons. That should be handy for some abilities.

### Changed
- Improvements on the way limited and observed actor sheets are displayed.
- The roll button for abilities now just pays the pool point cost by default. Alt-click the button to open up the All-in-One dialog to make a roll in addition to pay the pool point cost.
- Introducing a new fancy sliding animation for item description on actor sheets. As a side effect, the position is no longer saved between reloads of Foundry VTT. But the player and GM also no longer change each others view of the sheet. Thanks, @GonzaPaEst#1106 for assisting with that!
- The roll buttons and macros can now be used even when debilitated, as there are some situations where you still need to make a roll, e.g. when defending.
- Some changes in the layout for roll buttons. The function of the buttons should be more apparent, while no function is hidden in a heading anymore (resetting pool points, for example).
- Updated translations.

### Fixed
- When using too much pool points or levels of Effort on the All-in-One dialog, all fields keep their value.

## [1.22.4] - 2021-08-04
### Fixed
- Roll buttons on abilities work again.
- Entity-links on the character sheet have the correct layout again.

## [1.22.3] - 2021-08-03
### Fixed
- Auto-rolling the level of a cypher or artifact lead to the character sheet being unable to render. No longer.

## [1.22.2] - 2021-08-03
### Changed
- Changed “depletion:” to “depletion of” for artifacts on the character sheet. I found precedent for that format in the rule books.

## [1.22.1] - 2021-08-03
### Fixed
- I’m using the proper method to determine valid dice formulas now when checking for cypher and artifact auto-roll buttons for their level.

## [1.22.0] - 2021-08-03
### Added
- The level field on cyphers and artifacts now support rollable buttons that roll for the level and replace the dice formula with the result. The button is automatically created when the level contains a valid dice formula (and nothing else). *Example:* A cypher with a level of `1d6+2` will have the roll button on the sheet. If the button is pressed, the roll is made with a result of 5. The roll formula in the level field is then replaced with `5`.

### Changed
- The depletion of artifacts is moved into parentheses behind the artifacts name instead of a dedicated column, as the content of the depletion can get rather long, especially if using a roll button (for example, `1–2 in [[/r 1d100]]`). I think this is a cleaner look and adds consistency if you put the depletion into the notes of attacks as well.
- Updated translations.

### Fixed
- You can now properly add roll buttons such as `[[/r 1d6]]` (see [Basic Dice](https://foundryvtt.com/article/dice/)) into note fields of items. In total, you can add those in the description and level, depletion, and notes fields of items.

## [1.21.0] - 2021-07-25
**Note:** There has been an important change in the way how item macros are used. Please refer to these two articles in the wiki for an explanation and how to best deal with that, if you are using item macros: [Item Macros](https://github.com/mrkwnzl/cyphersystem-foundryvtt/wiki/Item-Macros) and [Item Macros before v1.21.0](https://github.com/mrkwnzl/cyphersystem-foundryvtt/wiki/Item-Macros-Before-v1.21.0).

### Changed
- Item macros are handled drastically different from prior versions. Please refer to [Item Macros](https://github.com/mrkwnzl/cyphersystem-foundryvtt/wiki/Item-Macros) and [Item Macros before v1.21.0](https://github.com/mrkwnzl/cyphersystem-foundryvtt/wiki/Item-Macros-Before-v1.21.0) for the exact changes. In short: Item macros now prioritize values specified in the macro and *all* values can be overwritten.
- Updated roll macros to better support the new item macros.
- The navigation bar on actor sheets has a new design, looking like tabs.
- The welcome message now links to the change log.

### Fixed
- Some layout issues have been fixed, most notably with the teen sheet.

## [1.20.2] - 2021-07-11
### Changed
- The chat output for All-in-One macros and roll buttons now include the pool point cost and edge separately, so that the pool point cost is more transparent. **Note:** There are instances where the math looks a bit funky, such as `Total cost: 0 (0-2) Might points`. That’s of course because the cost cannot be less than 0.

### Fixed
- Some minor typos and layout mistakes.

## [1.20.1] - 2021-07-10
### Fixed
- Difficulty setting in the Roll Button Defaults now works the same way as everywhere else.

## [1.20.0] - 2021-07-10
**Note:** I had to dig in a lot of the code for this one. While I didn’t actually changed that much, the whole rolling and applying pool points costs is rather complicated (and given that all this somehow grew naturally, it doesn’t have the most intuitive logic behind it). So please expect bugs and report them either on [GitHub](https://github.com/mrkwnzl/cyphersystem-foundryvtt/issues/new?assignees=mrkwnzl&labels=bug&template=bug_report.md) or on the [Cypher FVTT Dev Discord](https://discord.gg/C5zGgtyhwa).

### Added
- New option to enable roll buttons on the character sheets. With that, there are roll buttons for pools, skills, power shifts, attacks, abilities, and recovery rolls. Those buttons are doing the same thing the macros are already doing, but they are directly on the sheet. Alt-click opens up the All-in-One Roll dialog, where you can customize each roll. On the item sheets, there’s a new setting tab to set default values for the roll and the dialog.
- You can now set XP as the cost for abilities. Those abilities don’t work with the All-in-One Roll dialog, though, as that doesn’t really makes sense.
- All actor sheets have been added to the system functions, so that modules can access them more easily and overwrite their functions.
- There is now a description tab for all actors, which is public for all players with limited permission or up. The former description tab has been renamed to “Notes” and is private (that is, not visible with limited permission).

### Changed
- New symbol for editing items. Conceptually, you aren’t really editing the items, you are opening the item sheets with that button, so this is more fitting. Also, it looks a bit better in conjunction with the new roll buttons, in my opinion.
- The setting for item macros using the All-in-One Roll dialog now applies to the new optional roll buttons as well. This setting switches the Alt-click to a quick roll, where a simple click will open the dialog.
- Limited permission now hides all values and tabs except for the name, the character sentence (for actors that have that), the image, and the description tab.
- Updated translations.

### Removed
- The fix for lower-case OSs has been removed. People who needed that have most likely already updated at least once, and if not, the fix can be applied manually as well.

### Fixed
- When using roll macros while the teen sheet is active, the calculations are done to the teen form now, instead of always the mask form.
- Some minor typos and layout mistakes.

## [1.19.2] - 2021-07-01
### Changed
- The descriptions of items on the character sheet now use the same HTML parser as the TinyMCE, so that dragged and dropped macros, items, journal entries, roll tables, etc. are now clickable buttons on the sheet. This replaces the workaround of creating your own links.

### Fixed
- The Propose an Intrusion macro now works as expected.

## [1.19.1] - 2021-06-29
### Fixed
- Community sheets are working again.

## [1.19.0] - 2021-06-27
### Added
- New Translate to [Recursion] macros. Add `@Recursion Name` to the name description of the items belonging to a recursion, and add the name of the recursion and Focus your character has on that recursion to the macro. This macro then does four things:
    (1) It archives all items that have a `@Different Recursion Name` in its name or description.
    (2) It unarchives all items that have `@Recursion Name` in its name or description.
    (3) It changes your Focus to the one specified in the Macro.
    (4) It adds `on Recursion Name` to the additional sentence field.
- New Unarchive Items with [Tag] macro. Similar to the recursion macro, you can tag items by writing `#tag` into the name or somewhere in the description and this macro will unarchive these items. Alt-click the macro to archive the items instead. This can be used to define different equipment sets, readied spells, or alternate forms of your character.

### Changed
- Updated compatibility to Foundry 0.8.8.
- All modifier keys now use alt instead of ctrl/cmd. ctrl/cmd has some issues and inconsistencies across OSs. Now, whenever you want an alternate function (see how that works out?), such as adding 10 instead of 1 to the quantity or sending item descriptions to the chat, press alt. **Note:** If you experience performance issues because alt also highlights all of the tokens, use my other module [Free Alt](https://foundryvtt.com/packages/free-alt).

### Fixed
- Item sheets now have the proper height again.
- The fix for case-sensitive OSs is working again, although this fix has been made so many versions ago, I doubt anyone needs that anymore. Will probably be deprecated in v1.20.0

## [1.18.3] - 2021-06-22
### Fixed
- The Tabletop scene in the compendiums now has the correct file paths for the tiles.

## [1.18.2] - 2021-06-21
### Changed
- Refined the new pool layout.
- Sorted setting macros into their own compendium out of the utility macro compendium.
- Updated translations.

### Fixed
-  The Teen sheet now shows the correct edge again.

## [1.18.1] - 2021-06-17
### Fixed
- Fixed height of non-PC actor sheets.

## [1.18.0] - 2021-06-17
### Added
- New GM Intrusion macro. With that, you can propose an intrusion to a player. If they accept, they get an XP and can choose another PC to also receive an XP. If they refuse, they pay one XP.
- New All-in-One roll macros for defense rolls.

### Changed
- Compatibility notification changed to Foundry 0.8.7.
- New pool layout. This gives the lower part of the sheet 20px more space and hopefully clarifies the relation between the current and maximum pool values.
- The check mark for active armor has been moved to the rest of the clickable controls.
- The welcome message now includes a link to the Cypher FVTT Dev Discord.

### Fixed
- The cypher limit is now only shown on PC sheets.
- The All-in-One roll macro now includes a line to customize the title.

## [1.17.2] - 2021-06-04
### Changed
- Updated Spanish translation.

### Fixed
- NPCs can roll initiative again.
- GMs can now really confirm identification requests from players.

## [1.17.1] - 2021-06-04
### Fixed
- Stat rolls can now be rerolled properly.

## [1.17.0] - 2021-06-04
### Added
- The GM now has the ability to mark artifacts and cyphers as unidentified via the item sheet. Unidentified items have their details hidden on the character sheet and players can’t access the item sheet until it has bee identified. Player can request specific artifacts or cyphers to be identified, which will send a chat message to the GM where the identification needs to be confirmed by the (or a) GM.
- All roll macros have a reroll button on their chat message, which will reroll the result with the same modifiers. Note that only the original player can reroll a-

## [1.16.1] - 2021-05-31
### Fixed
- Translation strings for PC and NPC actors are now actually working.
- Bar Brawl and Drag Ruler now really work again after the update for Foundry 0.8.6.

## [1.16.0] - 2021-05-30
### Changed
- Compatibility with Foundry 0.8.6. Foundry version 0.7.x is no longer supported.

## [1.15.5] - 2021-05-22
### Added
- New utility macros to quickly change Might, Speed, and Intellect stats of PCs.

### Changed
- New system defaults for Bar Brawl bars. Instead of bars that are visible by the owner on hovering, they are always visible to the owner. The quantity bar of Markers are always visible to all players. This is due to the new utility macros to quickly change stats. A new utility macro can be used to set the Bar Brawl bars of all tokens on the canvas to the new system default.
- Non-PC actor sheets can’t list armor on the inventory tab anymore. This was never intended, as armor items (in the Foundry VTT sense) conceptually don’t represent worn equipment, but how this worn equipment is used as Armor (in the Cypher rules sense) by the actor. A such, NPCs and other non-PC actors don’t use armor items (in the Foundry VTT sense), since their stats don’t depend on that. People who really want to use attacks and armor on non-PC actors (such as for loot and even though their stats don’t correspond to the stats of the NPC), can use this macro code on tokens on the canvas:
  `token.actor.update({"data.settings.equipment.attacks": true})`
  `token.actor.update({"data.settings.equipment.armor": true})`
  If you want to deactivate the settings again, replace `true` with `false`.
- When using Marker tokens as counters, the amount of the quantity can now be specified. This is helpful when counting time in other increments than single steps. For example, you can use a Marker to indicate something happens in 60 Minutes. When you specify that each step are ten minutes, you can count 60 minutes in 10 minute increments. A new macro lets you count the specified steps outside of initiative as well.
- Updated translations.

### Fixed
- The Recovery Roll macro is sorted correctly with the roll macros again.

## [1.15.4] - 2021-05-19
### Fixed
- The new utility macros to quick change a stat now work on unlinked tokens correctly.

  **Note:** I needed to input a token instead of the actor, so I needed to update the macros in the compendium as well. If you have imported these, please delete to old ones and re-import them.

  If you have created your own macros based on these, replace `actor` with `token` in the line `game.cyphersystem.quickStatChange(actor, stat, modifier);`

## [1.15.3] - 2021-05-18
### Fixed
- Critical typo corrected.

## [1.15.2] - 2021-05-18
### Fixed
- Armor types for artifact and special abilities work again.

## [1.15.1] - 2021-05-18
### Fixed
- Attack type now again works for artifacts and special abilities correctly.

## [1.15.0] - 2021-05-17
### Added
- New utility macros to quickly change a stat of the selected token (or controlled actor). As usual, the macros are customizable easily by editing it, no coding skills needed. Premade macros are *XP +/- 1* (for PCs), *Health +/- 1* (for NPCs, Companions, and Communities), *Infrastructure +/- 1* (for Communities), and *Quantity +/- 1* (for Markers).
- A new XP marker, designed by @smaug18

### Changed
- I updated the tabletop scene in the compendium slightly.
- The translations have been updated.

### Fixed
- Smaller fixes with the chat output of macros.

## [1.14.2] - 2021-05-13
### Fixed
- Fixed event listeners of Community, Token, and Vehicle actors.

## [1.14.1] - 2021-05-12
### Changed
- Portuguese (Brasil) translation added. Thanks to @AgostinhoMestre.

### Fixed
- Translations have been updated to fix a few errors and missing translations.

## [1.14.0] - 2021-05-02
### Added
- Translations for French, German, Italian, and Spanish added. Thanks to Nice to see you#6655, Kadomi#9719, smaug18#2066, Eligor#5278, and ParvusDomus#9612!

### Changed
- Actors now all have the Foundry default image. This way, you don’t have to set a separate image for the prototype token after the first time.
- Token Actors have been renamed to “Markers.” **Note:** Internally, they are still called “Token” and need to be referred to as such in macros.
- The character sheet has been re-arranged slightly. The Cypher Limit is now found in the equipment tab. For that reason, the Cypher list can no longer be hidden. The sheet body has about 70px more space this way.

### Fixed
- Markers counting quantity on initiative works again. #95
- Fixed a bug preventing updates of easement/hindrance of attacks in the Combat tab.

## [1.13.9] - 2021-03-27
### Fixed
- All-in-One Roll macro didn’t take Edge into account when checking the cost before rolling.

## [1.13.8] - 2021-03-06
### Fixed
- Drag Ruler now works when the scene is set to `ft`, `ft.`, `feet`, `m`, `meter`, and `metre`. Before only `m` worked, while all other distances defaulted to feet. That means when you don’t have a unit from the above set, the drag ruler is simply black, instead of using the range colors for feet or meters. This is useful when you use Drag Ruler for overworld maps set to miles or km.

## [1.13.7] - 2021-03-01
### Fixed
- Hopefully, this really fixes the calculation of Edge in all macros.

## [1.13.6] - 2021-02-28
### Fixed
- Drag Ruler now correctly works on other scenes than the landing scene.

## [1.13.5] - 2021-02-28
### Changed
- The way Drag Ruler determines whether a token should use the drag ruler is now done via token flags instead of the actor type. This allows for individual tokens to have a different setting. For that, I have included a new compendium: Cypher System Utility Macros. There are two macros in there: “[Drag Ruler] Toggle Drag Ruler“ and “[Drag Ruler] Reset All Tokens.” The former toggles whether the ruler should be shown on an individual token, the latter resets all tokens on the canvas to their default. The defaults are still rulers for PCs, NPCs, Companions, and Vehicles, while Communities and Tokens don’t show the ruler. Note: I was only able to test this in limited circumstances. If you encounter errors or when the drag ruler doesn’t show up when it should, use “[Drag Ruler] Reset All Tokens.” That should take care of it.

### Fixed
- All macros should calculate Edge correctly. Fixes #65.

## [1.13.4] - 2021-02-21
### Changed
- Support for the new Drag Ruler API in version 1.3.0. Please make sure to update Drag Ruler. Notable changes are (1) you can now change the default colors for the ruler in the module settings of Drag Ruler and (2) Token and Community tokens don’t use the ruler as they usually don’t need them.
- Small visual change for the Eased/Hindered Quick Roll macros. They don’t stand out as much anymore.

## [1.13.3] - 2021-02-17
### Fixed
- Fixed a bug preventing items to show up on vehicle sheets.

## [1.13.2] - 2021-02-17
### Fixed
- Image file names have been changed to lower case to fix problem for Linux users. Thanks niceTSY! (#63)

## [1.13.1] - 2021-02-17
### Changed
- The item images in the description of character sheets is now on the right hand side, instead of the left hand side, in order to avoid bad formatting.

## [1.13.0] - 2021-02-16
### Added
- Optional equipment categories can now be renamed (#51).
- Drag Ruler is now natively supported. The ruler is colored according to the Cypher range bands: immediate = blue, short = green, long = yellow, very long = red, beyond = black.
- Dragging & dropping items between sheets has been widely expanded. See the wiki for details.

### Changed
- When items the category of which isn’t activated on the character sheet is dragged onto the character sheet, the category gets activated automatically. For example, by default, Cyphers are hidden on the character sheet and they need to be activated in the settings. If you drag & drop a Cypher onto the character sheet, the Cyphers show up automatically without the need to activate the list by hand.
- Actor sheets now remember which tab was last viewed and opens that tab after closing a re-opening the sheet for the current session.
- Item descriptions on the actor sheets now include the item image. If you send the description to the chat (ctrl/cmd-click on the item name), the image is sent to the chat as well.

### Fixed
- Settings and the damage tracker can no longer be dragged.

## [1.12.3] - 2021-02-03
### Changed
- Crafting Material now also lists the level on the character sheet (#48).

### Fixed
- The initiative value of NPCs, Companions, and Tokens now correctly subtract 0.5 as a tie breaker against PCs. This shows up in the chat, but the values in the combat tracker are rounded up to show the correct value.

## [1.12.2] - 2021-02-01
### Fixed
- Item images should be fixed for case sensitive file systems. (#44)

## [1.12.1] - 2021-02-01
### Fixed
- Fixed a bug where case-sensitive file formats caused trouble (#44).

## [1.12.0] - 2021-01-31
### Added
- Buttons to increase or decrease a value (such as the quantity of items) now increase/decrease 10 instead of 1 when ctrl/cmd-clicking the button.
- Values which are often changed during gameplay (current Pools, XP, Health, Infrastructure, Quantity) now have buttons to increase or decrease the values by 1. ctrl/cmd-click increases or decreases the values by 10 instead.
- A welcome message with links to GitHub and the wiki is sent to the chat each launch of the world. This can be deactivated in the settings. **Note:** As of now, the wiki is a work in progress and not yet complete.

### Changed
- Items which have a quantity (equipment, ammo, and materials) now don’t get duplicated when dragged and dropped unto a character sheet. Instead, if an item with the same name already exists, its quantity is increased by the amount of the quantity of the new item.
- The reset button has been moved into the label of the value it resets. If you want to reset your Might pool, click on “Might.” All values which have quick change buttons (see above) can be used this way, with the exception of XP.

## [1.11.2] - 2021-01-17
### Fixed
- Sending the description of list items to the chat now works correctly for other actor types than PC.

## [1.11.1] - 2021-01-17
### Fixed
- Something went wrong with the manifest file. To be sure, I made another update.

## [1.11.0] - 2021-01-17
### Added
- [Bar Brawl](https://foundryvtt.com/packages/barbrawl/) is natively supported with default bars configured for all token types. With that, PCs have three bars for all Pools. **Note:** This only applies to newly created tokens.
- Attacks now have a field for the appropriate skill rating. This calculates the total steps eased/hindered in addition to the modifier. If you have set some steps eased or hindered because of the skill level, you should set the skill level instead. Existing characters are set to being practiced, so until you change anything by hand, everything works as before. **Note:** For existing characters, this should be calculated automatically. If the steps eased or hindered don’t show up on the character sheet when they should, editing the item in question should correct this.

### Changed
- ctrl/cmd-click to send the description of list items to the chat now also delivers other info about the item, such as the skill rating, damage, or Pool point cost.

## [1.10.0] - 2021-01-14
### Added
- List items (skills, power shifts, abilities, equipment, etc.) can now be archived. This moves them to the end of the list and greys them out. Use this for depleted Cyphers, unavailable equipment, abilities from other Recursions, and everything else your character doesn’t have access to, but you aren’t ready to delete, yet.
- In the settings, the archive of items can be hidden, so that archived items aren’t moved to the end of the list but are hidden instead.

### Changed
- The delete button for items is now the archive button. To delete an item, ctrl/cmd-click the archive or unarchive buttons.

### Fixed
- Small styling errors have been fixed.
- All sheets now keep their scroll position when changes are made, as they should.

## [1.9.3] - 2021-01-10
### Fixed
- Fixed a bug where setting the defaults for the All-in-One Roll macro was applied to the wrong values.

## [1.9.2] - 2021-01-08
### Fixed
- Fixed a bug where Edge got subtracted twice from the cost when using Item Macros.

## [1.9.1] - 2020-12-30
### Fixed
- Item macros for abilities did not work when the setting “Always Use the All-in-One Roll Dialog“ was set. Fixed.

## [1.9.0] - 2020-12-26
### Added
- Token actor types can now be used as counters in the combat tracker. The default is that whenever a Token actor type gets initiative, its quantity is decreased by one. There are settings (per token) to disable this behavior completely, and to increase the quantity instead of decreasing. Track the quantity in the combat tracker for maximum effect. Closes #25
- NPCs’ initiative is now based on their level (level × 3) instead of a d20 roll. Note that there is a -0.5 to the roll as a tie breaker so that PCs come before NPCs when the roll the same value. It shows up in the chat, but the combat tracker rounds this up to the correct value. Closes #24
- A new compendium with some markers. Those are Token actor types for temporary effects, Cyphers, and a map marker. There is also an NPC marker, which is meant as stand in for all NPCs in the combat tracker.
- The All-in-One Roll macro now includes a Attack Modifier section where you can add the damage and apply Effort to the damage. If you have the system setting “Item Macros Use All-in-One Dialog” active, attacks populate these fields automatically.
- A new compendium containing the tabletop scene I use in my games.

### Changed
- Item macros can now have custom defaults for the All-in-One dialog when the system setting “Item Macros Use All-in-One Dialog” is active. Edit the macro to access the defaults.
- When having less than 4 currencies, the name of the currency is to the left of the currency field, instead of above. This reduces the empty space in the Equipment tab.

### Fixed
- If a PC is impaired, all macros that calculate Pool point costs based on Effort take the penalty for that into account.
- If a PC is debilitated, the All-in-One and Spend Effort macros can’t be used.

## [1.8.3] - 2020-12-19
### Changed
- The All-in-One roll macro now lists by how many steps the task roll is eased by using levels of Effort.
- Compatibility with Foundry 0.7.9.

### Fixed
- The All-in-One roll macro now has the correct default values in the compendium.

## [1.8.2] - 2020-12-07
### Fixed
- System manifest pointed to the wrong download.

## [1.8.1] - 2020-12-07
### Changed
- Cyphers and Artifacts now have a template for their description.
- The option for any Pool point cost for abilities has been renamed to “Any Pool” to avoid confusion.
- The All-in-One Roll macro can now be edited to have different default values. Useful if you want several of those in the macro bar with different defaults each.

### Fixed
- The chat output of the All-in-One Roll macro always gave “Might Roll” as its title, regardless of the chosen Pool. It now works as expected.
- Edge got added to the Pool if the cost of the roll was lesser than the Edge value. This doesn’t happen anymore.
- The generic roll macros now work again after the update of Foundry (0.7.8)

## [1.8.0] - 2020-12-04
### Added
- System settings for using the effective Difficulty, which tells you that you have beaten a Difficulty one step higher or lower per steps eased or hindered, respectively.
- All new All-in-One Roll macro, which opens a dialog where you can set the skill level, assets, levels of Effort, and additional modifiers for difficulty and Pool point costs. It then calculates everything and pays the cost automatically, including the relevant Edge and Speed Point cost due to armor.
- An All-in-One Roll macro template. Copy that into the macro bar and edit the values as you need it. Using the macro then calculates everything automatically just as the All-in-One Roll macro does, but you don’t need to enter the values each time.
- A system setting to always use the All-in-One Roll macro for item macros (macros that have been dragged in to the macro bar to create a macro.

### Changed
- Dragging items to the macro bar creates a quick roll macro. These macros now give more relevant info in the chat output. These macros do not calculate costs automatically! Use the All-in-One macro or your own template for that. Please replace the old macros, otherwise you’ll get an error.
- Compatibility with Foundry VTT 0.7.8.

### Deprecated
- Due to the new system setting, the macros for effective Difficulty has been deprecated. All the functionality is intact if you set the system setting.

## [1.7.0] - 2020-11-20
### Added
- New setting per sheet: Sort Skills by Rating
- In anticipation of Godforsaken, which includes a more elaborate currency system, you can now define up to 6 currencies, each with a customizable name. Defaults to the currency in Godforsaken, unless you only have one currency set, then it defaults to Shins.
- The option to hide the names of the currencies in the Equipment Tab, nicknamed “Tooltip-only Mode.” Currencies take up a lot of vertical space in the Equipment Tab, which is especially apparent when only one currency is set. With this option, you can hide the names so that they take up less space. The currency name shows up as a tooltip when hovering over it, though.

### Changed
- Compatibility is set to Foundry 0.7.5–0.7.7. It will most likely still work with Foundry 0.6.6, but I can’t test and guarantee that.

### Fixed
- Teen Skills now are preset to being trained.
- Small styling errors.

## [1.6.4] - 2020-11-07
### Changed
- Compatibility with Foundry 0.7.6.

## [1.6.3] - 2020-11-07
### Fixed
- Level fields now support strings, instead of just numbers.

## [1.6.2] - 2020-11-06
### Removed
- Sorry, that was bad planning on my part. Had to remove the Price/Value and Weight fields for compatibility reasons with the upcoming Cypher System Compendium module.

## [1.6.1] - 2020-11-06
### Fixed
- Teen Items now also have the new layout.

## [1.6.0] - 2020-11-05
### Added
- Equipment items, Cyphers, Artifacts, Oddities, Material, and Ammo now have a Weight and Price/Value field.

### Changed
- Layout changes for item sheets.
- Some general very small layout changes made it possible to reduce the character sheet height by 15 more pixels.

### Fixed
- Empty descriptions now show the “—” correctly.

## [1.5.1] - 2020-10-29
This is a hotfix release to deal with issues for PCs with a vertical screen resolution of 800 pixels. I’ll try to find a more elegant solution in the future.

### Fixed
- In order to reduce the window height of the character sheet, I reduced the height of the sheet body (below the tabs) by 50 pixels.

## [1.5.0] - 2020-10-28
### Added
- New macro: Spend Effort. This calculates the Effort cost per level and takes Effort Speed Cost from armor into account.
- New macro: Recovery Roll. This simply rolls the formula in the recovery roll field.
- Dragging any item from a character sheet to the macro bar creates a quick roll macro for that item.
- New actor sheet: Vehicle.
- The actor sheets for NPCs, Companions, Communities, Vehicles, and Tokens now have an Inventory, Storage, and Items tab, respectively. Now all actors can hold items for loot and storage. In the settings tab, individual lists can be enabled.

### Changed
- For better macro support, I re-wrote the way the Speed Cost and Armor Totals are displayed. You might have to de- and reactivate one piece of armor to have it displayed correctly again.

## [1.4.2] - 2020-10-25
### Changed
- Updated the handling of macros. The built-in macros are now functions in the system, and I moved the icons around. This way, future updates to the macros are reflected without the need re-import. For this update, **please re-import the macros** one last time.
- Actors now also have new default icons.
- Some cleaning up in the template.json. I needed to change the Interaction Level of Companions. **You need to re-enter the interaction level of existing companions** because of that.

### Fixed
- Drag & Drop of items now works from the character sheet to the sidebar, as well as vice versa. Dragging an item to the macro creates a quick roll macro for that item.

## [1.4.1] - 2020-10-24
### Fixed
- Actor item images weren’t saved when the item was created as a separate entity and then copied to the actor. Now this works.

## [1.4.0] - 2020-10-24
### Added
- It’s now possible to ctrl/cmd + left click on any list item (skills, abilities, attacks, etc.) to send the description to the chat. (Closes #4)
- All item sheets now support images. New items have a new default item. Existing items have the mystery man default. (Closes #3)
- All equipment items now have a level field. (Closes #2)

### Changed
- Removed the handle to resize actor and item sheets.

### Fixed
- Small CSS fixes due to changes in Foundry 0.7.5.

## [1.3.2] - 2020-10-21
### Changed
- Compatibility updated for Foundry VTT 0.7.5

### Fixed
- Small CSS fixes for changes in Foundry VTT 0.7.5
- NPCs rolling for initiative produced an inconsequential error in Foundry VTT 0.7.5. This has been resolved for new NPCs. If you have that in an old NPC, export the NPC, create a new one, and import the old one into the new one.

## [1.3.1] - 2020-10-19
### Fixed
- Small fix for saving ability notes.

## [1.3.0] - 2020-10-19
### Added
- The type of attacks and armor can now be set to “artifact.”

### Changed
- Lasting damage now has up and down arrows to quickly change the value in the list without the need to open the Lasting Damage Sheet.
- Active armor can now be set in the armor list without the need to open the Armor Sheet.

### Fixed
- Internal house keeping of template.json.
- Compatibility fixes for Foundry 0.7.x in the macros. This means that you have to import the changed macros to your game if you are on Foundry 0.7.x

## [1.2.2] - 2020-10-17
### Fixed
- Flavor text for dice macros has been updated slightly to make it look a bit better.
- Journal entries now use the complete height of journal windows.
- Ability point costs now allow strings for variable point costs (like a cost of 1+ points).

## [1.2.1] - 2020-10-13
### Changed
- Updated system.json for 0.7.3 compatibility

## [1.2.0] - 2020-10-13
### Added
- Now some basic dice macros are included in a compendium. Copy them to your macro bar for easy use.

### Changed
- Some values have shifted in the template file. You need to manually re-enter the pool values for characters. This ensures better compatibility with other modules.

### Fixed
- Various small fixes in the layout.
- The tab contents now have a fixed height and scroll independently from the sheet header. This way, the pool values are always in sight and it’s consistent across all tabs (up until now, only the notes tab has had this behavior, now all do).
- Small compatibility changes for Foundry VTT 0.7.3

## [1.1.1] - 2020-10-11
### Fixed
- Fixed an error occurring when deleting an item.

## [1.1.0] - 2020-10-11
### Added
- All list items (skills, attacks, armor, equipment, etc.) can now expand to show their description by clicking on their name.
- Added “Dead” to the damage track.
- Added an optional ammo list the the Combat Tab.
- Countable list items now have up and down arrows to increase or decrease their quantity.
- Stat pools, recovery rolls, and advancement options now have a button to reset them.

## [1.0.6] - 2020-10-09
### Changed
- The editor window for list items (skills, equipment, attacks, etc.) now opens automatically on creation.

## [1.0.5] - 2020-10-09
### Fixed
- In Unmasked Mode, the Teen and Mask Sheets have separate additional pools.

## [1.0.4] - 2020-10-09
### Fixed
- Workaround for undesired TinyMCE behavior by giving the editor a fixed height and the windows a min-height.

## [1.0.3] - 2020-10-08
### Fixed
- Reverted the fix for the Notes Tab. It made things worse.

## [1.0.2] - 2020-10-08
### Changed
- Removed the bottom border below the currency in the Equipment Tab.

### Fixed
- Input fields are no longer changed globally, only for the Cypher System sheets.
- The Notes Tab had a second scroll bar when there’s a certain amount of text. This  is fixed.

## [1.0.1] - 2020-10-08
### Fixed
- Notes for armor does work now both in in the item sheet as well as on the character sheet.
- Forgot to add crafting material to the settings and Equipment Tab. It’s there now.

## [1.0.0] - 2020-10-08
- Initial release
