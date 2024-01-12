# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.13.1] - 2024-01-12
### Fixed
- The Recovery Roll button is now included in the option to show the roll buttons only for stats.

## [2.13.0] - 2024-01-12
### Added
- A new setting to show the roll buttons only on stats (Might, Speed, Intellect), but nowhere else on the sheet. This can be used when you don’t want to use the All-in-One roll dialog to adjust the difficulty by hand (but in your head instead). GMs can still set a difficulty beforehand (and the AiO roll dialog can still be used), but this discourages the use of roll automations. As such, this setting works best with the Use All-in-One Dialog as Default setting disabled.
- There’s now a compatibility warning when the Cypher System Custom Sheets module is enabled.

### Changed
- Updated translations.

### Fixed
- Abilities can be copied as armor again.
- Fixed word break in tables in journals and descriptions.

## [2.12.0] - 2023-12-06
### Changed
- The tagging/recursion system has been completely reworked. Instead of writing the tags into the item’s descriptions, there’s a tags/recursion tab on each item where you can select with which tags the item should be tagged.
  
  **Note:** There is a migration routine in place that converts existing tags and recursions into the new system, but only if the PC has the appropriate tags and recursions as items. The migration routine only works once, so make sure to have the needed tag and recursion items before you update. After the tags have been removed, empty paragraphs and empty secret formatting will be removed from the item’s description. **In any case, make a backup before updating!**
  
  **Also note:** If you have actors using tags in a compendium, run `game.cyphersystem.dataMigrationPacks("pack-name")` in the console to update your compendiums.
- Items with multiple tags are being archived only if all these tags are inactive. The items stay unarchived as long as at least one of these tags is active.

### Removed
- The macros regarding tags have been removed, as they no longer serve a purpose.

### Fixed
- When using Unmasked mode and tags, the tags only work on the mask items and stats.
- Empty tag categories are shown correctly, unless the setting to hide empty categories is set (they are shown correctly then as well, but that means that they aren’t shown).

## [2.11.1] - 2023-11-02
### Fixed
- The dropdown to sort tags via the settings tab is now populated correctly.

## [2.11.0] - 2023-11-02
### Added
- It’s now possible to change stats with normal tags.
- Tags can now be sorted into four categories.

### Changed
- The propose Intrusion dialog now also shows the players who own the actors in question. Selecting a companion token now targets the owner of the companion (not the owner of the actor!) with the GMI. If the selected token doesn’t have a viable target, the dialog with all viable targets opens up instead of just throwing an error.
- The icon for exclusive tags in the character portrait now has a tooltip for the currently active exclusive tag.

### Fixed
- The Simplified Stat Roll macro now works as expected again.
- TinyMCE now changes its size dynamically when resizing the window. (Thanks for @farling)
- Items in compendia aren’t throwing an error anymore.
- Active exclusive tags can be deleted.

## [2.10.3] - 2023-10-03
### Changed
- Updated translations.

### Fixed
- Compatibility of the chat output of rolls with the Chat Portrait module.

## [2.10.2] - 2023-10-01
### Changed
- The welcome message is shown only once. Enabling the setting now only shows the welcome message the next time the world is loaded by the GM, and is then automatically disabled again.
- Actor and item sheets can finally be resized. Note that there’s a minimum height of 575 px and width of 650 px in order to keep the formatting intact. Note also that using the TinyMCE editor results in undesired behavior when resizing the sheets while editing.
- The All-in-One Roll dialog is now styled using the system’s sheet customization settings.

### Fixed
- Empty cost fields for abilities will no longer result in NaN errors in the chat output of die rolls.
- Most numerical fields in item sheets are now being auto-populated with the value “0” if they are submitted empty.

## [2.10.1] - 2023-09-24
### Fixed
- Hotfix for broken download link.

## [2.10.0] - 2023-09-24
### Added
- The difficulty control panel now has an option to use the difficulty as the base value for NPC (and for non-player communities and vehicles) initiative instead of their level. This way, all lower level NPCs would still act at the same time as the highest level NPCs, if the difficulty is set to the level of the highest level NPC, as per the rules. Within the NPC group, they are still sorted by level (see changes below).
- Power shifts now have a toggle to display a temporary power shifts (for example, for temporary blood shifts from Stay Alive!). Note that this is, as all power shifts are, mainly a cosmetic setting. It doesn’t ease any rolls automatically. That needs to be accounted for manually.
- A new game setting to always show the roll result details (see below) by default.

### Changed
- The Cypher logo (and custom logos) now use more of the space they have available, making them effectively a little bigger on the sheet.
- The dark tabletop scene now has a new table texture. Exisiting scenes are automatically using the new texture.
- NPC (and non-player community and vehicle) initiative now has the level of the NPC as the tie breaker. The initiative value now goes to one-thousands. This is only relevant, if you use the difficulty control panel to set the base for the initiative instead of the level of the NPC (see additions above). For example, a level 4 NPC with an initiative base set to difficulty 5 will have an initiative value of 4.504. 4.5 is the base difficulty 5 minus 0.5 as the tie breaker against PCs, and 0.004 is added as a tie breaker against other NPCs.
- The roll button for abilities now better reflects the All-in-One dialog settings.
- The chat output for the All-in-One rolls (including quick rolls) has been revamped so that the most important information is shown and understandable at a quick glance. With a click on each title, you get all the details.

### Fixed
- The initial cost in the All-in-One Roll Dialog is now calculated correctly.
- The Count Quantity macro to use in conjunction with Marker tokens now works correctly again.
- The button to toggle active armor works again.

## [2.9.0] - 2023-08-31
### Added
- The roll engine now has a hook with the actor and roll data, which can be called using `Hooks.on("rollEngine", actor, data);`.

### Changed
- Level 4 headings in journals are now bold and underlined to differentiate them from normal text.
- The character portrait has no longer a box around it and the aspect ratio of the image is being respected.

### Fixed
- Error message about missing permission for to reset the difficulty has been fixed.
- Added missing tooltips in difficulty panel.
- When copying abilities as attacks, the Pool and Pool point cost are being carried over as they should.

## [2.8.4] - 2023-07-30
### Changed
- Prototype tokens of newly created actors no longer have a pre-defined display name and disposition. This allows you to set your own token defaults in the system settings. Already existing actors as well as actors form compendiums keep their prototype token settings.
- Updated translations.
- The notification if players try to roll initiative before an encounter has ben created has been clarified.

## [2.8.3] - 2023-07-20
### Fixed
- Fixed a translation string for light armor.

## [2.8.2] - 2023-07-17
### Changed
- Updated translations.

### Fixed
- The All-in-One Roll dialog should work again as expected. Hopefully.

## [2.8.1] - 2023-07-16
### Fixed
- Attacks on NPCs don’t show an extra comma anymore in their notes.
- The Base Difficulty no longer locks after selecting a difficulty in the All-in-One dialog.
- Fixed dragging & dropping items onto actors.

## [2.8.0] - 2023-07-14
### Added
- Abilities now have buttons in their setting sheet to quickly copy them as skills or attacks.
- Attacks and armor now have buttons in their setting sheet to quickly copy them as equipment.
- New Difficulty Controls, which can be found in the Token Controls. With that, you can set a difficulty for the next roll or set a persistent difficulty which stays active until it’s being changed again. This also integrates with the Calculate/Announce Difficulty macro, which will set the difficulty and whether it’s for a single roll or persistent in the Difficulty Controls.

  If the GM keeps the difficulty a secret (by not selecting “Show difficulty to everyone”), it won’t show up in the Difficulty Controls (wouldn’t be a secret, then). It will be set to ”None” in that case.

### Changed
- When a difficulty is set in the Difficulty Controls, the base difficulty in the All-in-One Roll dialog is taken from there and cannot be changed in the dialog.

### Fixed
- The pre-made scenes now show their thumbnail correctly.
- Abilities that are paid with XP now show the message that the AiO dialog cannot be used correctly.
- The setting to use a skill for initiative rolls appears again when the skill in question is in the sidebar.
- Players can drag & drop abilities from the sidebar and from journals onto the sheet again.
- When the GM updates the GMI Range, open GMI Range windows that players have open don’t go into focus anymore.

## [2.7.0] - 2023-06-28
### Added
- Items of the equipment type can now be sorted into up to four categories, just like skills and abilities.
- Items that can be sorted into categories (skills, abilities, equipment) can now be sorted with drag & drop.

### Changed
- The compendia are now sorted into folders.
- The Cypher system is now only compatible with Foundry V11 or higher.
- Dragging & dropping items between actors and from the sidebar has been slightly revised to accommodate sorting items into categories. See ([the wiki](https://github.com/mrkwnzl/cyphersystem-foundryvtt/wiki/Moving-Items-Between-Actors) for details.
- If no armor type is selected, the “n/a” note is now omitted on the character sheet.

### Fixed
- Removed unnecessary hr in roll chat output.
- Item sorting in world items has been removed. Sorting happens on the character sheet.
- Folder headers in compendia have a subtle text shadow to make them more readable.
- Recovery rolls now display the correct name in the chat, even if another token is selected.
- Trying to pay with recovery rolls for spells if no recovery rolls are left now doesn’t show the wrong chat message anymore.

## [2.6.2] - 2023-05-30
### Fixed
- The system is no longer locked. **Note:** This has slipped in the last update and locked your system for updates. You need to manually remove the update lock from the setup screen. Sorry about that.
- PC actors in compendia aren’t locked in an infinite loop of updated attack items anymore.

## [2.6.1] - 2023-05-29
### Changed
- The currency labels are no longer bold.
- Compatibility with Foundry V11.

## [2.6.0] - 2023-05-19
### Added
- The teen form can now have their own portrait.
- You can now select to have zero one-action recovery rolls.
- When alt-clicking to translate to a different recursion, the current focus and equipment is dragged to the new recursion.

### Changed
- If you add the Secret style to a passage on the item sheet, this is no longer shown on the item description on the character sheet. This is useful for tags and recursions, for example, if you don’t want the mto show up there.
- All editors have been changed to the new ProseMirror editor by default. You can change it to the TinyMCE editor in the system settings.
- The Propose Intrusion button now skips the dialog when a PC token is selected and proposes the intursion to that actor.
- There’s now a message in the chat when a difficulty has been announced to indicate that it’s being used for the next roll.

### Fixed
- When sending item descriptions of ammo and equipment to the chat, they no longer show “(level null)” in the title when no level is set.
- Fixed a bug where items with a quantity were always duplicated instead of added to the quantity.
- Characters in compendiums can now update their stats when an exclusive tag is enabled.
- Fixed a bug where the custom sheet styling of PC actors has been overwritten when a custom style has been set in the system settings.

## [2.5.0] - 2023-04-10
### Added
- You can now set default sheet customizations in the system settings that apply to all actor and item sheets. You can still customize each PC actor sheet in the actor’s setting tab.

## [2.4.2] - 2023-03-22
### Changed
- Updated translations.

### Fixed
- Fixed a bug where identifying cyphers and artifacts from the chat card wasn’t working correctly.
- Fixed a bug where the chat output didn’t report the correct success or failure of a roll when using the effective difficulty setting.
- Workaround for faulty actor permissions where the GM was only having limited access to character sheets when the default for players was set to “limited.”

## [2.4.1] - 2023-02-24
### Fixed
- Fixed a bug where the difficulty of a roll wasn’t carried over to a reroll.
- Rerolls no longer open the dialog sheet when holding alt or when the option to always show the dialog sheet is enabled.

### Changed
- The chat card for rerolls now reads “Reroll” below the title.

## [2.4.0] - 2023-02-24
### Added
- A new tab for GM notes has been added.
- A new Simplified Stat Roll macro has been added. With that, you can make rolls for all actor types (instead of just PC actors, like the other stat roll macros), and it applies to either the controlled actor or selected token.
- Crafting material can now be sorted by level.

### Changed
- Non-PC actors can now also hold attack and armor items.
- The steps eased/hindered in the chat output of the All-in-One roll dialog is now clearer. The base difficulty is always shown, and the final difficulty is shown if the base difficulty is eased or hindered.
- The additional sentence field is no longer editable when using the The Strange game mode.

### Fixed
- The quick roll macros now give the correct warning when you don’t control a PC actor.
- The vague description of roll difficulties when using the calculate difficulty button now works as intended.
- The resource bar defaults now work as expected. Use of Bar Brawl is still recommended, though.
- Crafting material without a level or with level 0 now correctly show “—” for the level on the sheet.
- NPCs added to the combat tracker now correctly send their initiative value to connected clients and keep their initiative value when refreshing.

### Removed
- Removed the secret setting macros to enable attacks and armor on non-PC actors.

## [2.3.0] - 2023-01-16
### Added
- Ten new utility macros to announce the difficulty to the chat. If this is the last chat message in the chat, the announced difficulty is bein used for rolls and as the base difficulty in the All-in-One roll dialog.
- You can now set a name (or rough description) for unidentified cyphers and artifacts in the cypher’s or artifact’s item setting tab.

### Fixed
- The order of the dice icons in the dice tray is now correct again.

## [2.2.1] - 2023-01-14
### Changed
- Updated dice tray styling. Generic enough for all backgrounds and fitting the Foundry aesthetics.

### Fixed
- The Multi-Roll action is working again (this have been a macOS specific bug).
- The prototype token now has sensible defaults based on their type again.
- Refactored the tagging engine so that it works with better performance, more reliable, and on unlinked actor tokens.
- The quick stat change macros now work again on non-PC actors.

## [2.2.0] - 2023-01-08
### Added
- New customization options. There’s a new Compatible with Cypher System logo on the right hand side of the stat pools. This new logo, the  background image, and background icon can now be customized with your own images. The opacity of the logo and icon as well as a white overlay for the background image can freely be set, so that you can ensure readability with all images.

  **Note:** The default player permissions don’t allow players to open the file picker and select their own images, and for good reason. If you want your players to do that themselves, make them to trusted players or set the permissions accordingly in the User Management.
- The additional Pool now has an option to enable an Edge value for it.

## [2.1.2] - 2023-01-05
### Changed
- Updated Spanish translation.
- The Effective Difficulty can now be set to be applied dynamically depending on whether a difficulty has been set for the roll or not.
- Some CSS for the Cypher SRD Compendium.

## [2.1.1] - 2022-12-09
### Changed
- The difficulty preview in the All-in-One Roll summary now also displays the taget number.

### Fixed
- PC actors with armor no longer throw an error when opened in a locked compendium.
- Fixed compatibility warning for Bar Brawl.
- Background image and icon settings no longer show up when the Cypher System Custom Sheets module is installed.
- All-in-One Roll macro again works as expected.
- Dragging & dropping ammo and crafting material now enables their respective lists when they were disabled before.

## [2.1.0] - 2022-11-13
### Added
- The All-in-One roll dialog now includes an option to include the difficulty, which then outputs if the roll is successful or not. If a chat message with a difficulty from the Calculate Difficulty macro is the last message in the chat, the difficulty is being used as the default for the roll coming right after that message.
- The Calculate Difficulty macro is now also accessible via button in the token controls.

### Fixed
- Fixed a bug where the roll dialog has blue numbers before rolling the first time.
- Fixed a bug where document links to items of the same actor didn’t work.
- Fixed a bug where linked tokens that don’t represent an actor stopped migration.
- Roll macros are working again.
- Roll buttons & macros used on unlinked tokens now work on the token instead of the represented actor.
- Recursion and tag macros have been fixed. It might be needed that you create new macros by dragging & dropping recursions or tags onto the hotbar.
- Fixed migration for old actors & items that don’t have a version.

## [2.0.2] - 2022-10-31
### Added
- A warning to reinstall the CSRD Compendium, since updating does not work.

### Fixed
- The GMI range buttons now have the correct tooltip.

## [2.0.1] - 2022-10-31
### Fixed
- Fixed a bug in the migration that prevented tag and recursion in the world to migrate properly.

## [2.0.0] - 2022-10-31
### Added
- Macros to manually start the migration process, one for the world, one for any modules containing compendia.
- A button in the token controls to propose an intrusion to a PC. (This is the same functionality as the macro, except that it always opens up the dialog to choose the actor, instead of using the selected token).
- A new **GMI range engine** (used in Horror Mode, Disaster Mode, and Redline Maneuvers, among others), with which you can set either individual GMI range values for each PC actor that has a player owner, or a global value that applies to all PC actors. This can be accessed by both players and the GM with a button in the token controls, but players can only change the GMI range of their own characters. The GMI range is used in stat rolls and the current GMI range is displayed in the summary of the AiO roll dialog.
- A new **multi-roll action mode**. When holding alt while pressing the roll or pay button on the All-in-One roll dialog, you enter multi-roll action mode. In this mode, your used edge and Effort values are temporarily reduced until you no longer hold alt in the All-in-One roll dialog, which ends the multi roll mode and reverts your stats to their original value. Pressing the dice icon on the character portrait, representing multi-roll mode, also ends multi-roll mode.

### Changed
- BREAKING: The Data Paths of actors and items have been changed. You need to update those in you macros. Existing actors and items in the world migrate automatically, actors and items in compendia need manual migration (by using ).
- Updated compatibility to Foundry VTT V10. Earlier versions are no longer supported.
- Moving items between actors has been streamlined. It now simply always shows the dialog when moving items, so that players can choose the quantity or decide what to do with unique items on the origin actor. GMs now have the option to hold alt and simply duplicate the item onto the new actor. Players always see the copy dialog with the appropriate options for the item, regardless of whether they hold alt or not.
- Chat card buttons (accept/refuse GMI, regain pool points, re-roll dice) are now only visible for players who can actually use them, which now also always includes the GM.
- Skills, Abilities, Armor, Attack, and Lasting Damage now have a setting to show these on the mask or teen sheet, if the game mode is set to Unmasked. This setting defaults to the sheet active at the time of creation. Dragging & dropping items does not change the setting.
- PCs who don’t have at least 1 XP can’t refuse an intrusion anymore.

### Deprecated
- Actor and item types have been renamed to be lower case to be more consistent with other conventions. The old types are still part of the template file in order to migrate existing actors and types. With the release of Foundry V12, the old types will be removed from the system, making migration of worlds created with Foundry V9 directly to Foundry V12 impossible. In order to use your existing worlds, you need to upgrade to Foundry V10 or V11 and upgrade the Cypher system to v2 before updating to Foundry V12.

### Removed
- Holding alt while dragging & droping cyphers or artifacts no longer flips the identified status. Use the system settings for a default or use the item settings for that.
- The level field in cyphers and artifacts no longer support inline roll formulas.
- The compendium with basic skills has been moved to the Cypher SRD Compendium.
- Teen items have been removed in favor of a setting for normal items.

### Fixed
- Replaced `event.altKey` with the more appropriate `game.keyboard.isModifierActive('Alt')`.
- Checks for Bar Brawl now work as intended.
- TinyMCE editor content now keeps its scroll position when the sheet is re-rendered.
- When the teen form regains points from a roll using the chat, the correct pools regains the points and the name of the teen is shown in the chat message.
- Rerolling a stat roll no longer applies its result as the initiative value.
- The Propose Intrusion macro now also works when only one PC actor has an owner.

## [1.33.2] - 2022-06-30
### Fixed
- Fixed a bug preventing PC sheets to be opened when the Cypher System Custom Sheets module was not installed.

## [1.33.1] - 2022-06-29
### Changed
- Updated language files.

### Removed
- Removed the Italian translation for now. About half of the system is untranslated. If you have interest in translating the system into Italian, let me know.

### Fixed
- Locked stats can no longer be reached with tab.
- The rolls from the dice tray now show the correct actor name in the chat, regardless of the selected actor.

## [1.33.0] - 2022-06-27
### Added
- There are two new settings with which you can customize the visual look of PC sheets by changing the background image and a background icon. These can be set independently of each other. Teen and mask sheets have separate settings as well.
- New secret setting macro: This macro will lock some stats of the selected/controlled actor: Tier, Effort, advancements, max pool, recovery roll formula, and Cypher limit. A small lock icon on the PC’s image indicates this.

### Changed
- Some refactoring of system functions. Most notably, the All-in-One roll macros has been reworked into the Roll Engine, which will allow for easier customization and bug fixing.
- The All-in-One dialog has been changed from a dialog to a custom form, which allows for more interaction. The dialog now gives you a preview of the easements/hindrances, the total damage, and total cost. In addition, there’s a preview of the PC’s stat Pools after the roll. **Note:** As always when I touch the all-in-one roll, I likely broke something, which is part of the reason for this refactoring. Please let me know if something does not work as expected.
- When using a roll/pay button on a character sheet, the speaker in the chat  message is always the character it comes from, not the selected token.

### Fixed
- Optimized the sheet actor sheets for font sizes of up to 7.
- The styling of descriptions and editor contents has been slightly tweaked in order to make the paragraphs more noticeable.
- The teen sheet no longer shows skills that it shouldn’t.

## [1.32.7] - 2022-05-15
### Changed
- The default for Bar Brawl bars is now set to show up only when the owner of the token hovers above the token. **Note:** This only applies to newly created tokens. Tokens already on the canvas always show their bars. To change how the old tokens work, please use the “Reset Token Settings” macro found in the Secret Settings compendium.

### Fixed
- The dice tray on the PC sheets only shows up on PC sheets you own, not when viewing them with limited or observer permission.

## [1.32.6] - 2022-05-08
### Fixed
- Fixed a bug where Edge wasn’t taken into account when regaining points on a rolled 20.

## [1.32.5] - 2022-05-06
### Fixed
- The translate to recursion item macros now work as expected.

## [1.32.4] - 2022-05-02
### Fixed
- The reroll button for recovery rolls now works as expected.

## [1.32.3] - 2022-05-01
### Fixed
- The reroll icon for recovery rolls is now in line with all the other ones.

## [1.32.2] - 2022-04-15
### Fixed
- The additional easements/hindrances in the chat output of the AiO roll is now in the correct position.

## [1.32.1] - 2022-04-15
### Fixed
- Small css corrections.
- The non-stat rolls now have an icon as reroll button as well.

## [1.32.0] - 2022-04-14
### Added
- On a natural 20, a button to regain the spent Pool points appears in the chat output.

### Changed
- Button for rerolls is now an icon.

### Fixed
- The chat output for rolls no longer shows negative difficulties beaten, if they are eased by more steps than the difficulty was.

## [1.31.3] - 2022-04-14
### Changed
- Bonus and penalties can now be added to the All-in-One rolls.
- Roll macros based in the All-in-One roll macro are updated with new variable for bonuses or penalties for the rolls.
- The chat output for AiO rolls has been streamlined. Now only the basic (skill level, assets, effort to ease task) info is always shown, while the rest only appears when it has a non-zero value.

### Fixed
- The horizontal ruler in chat messages now has the correct margins.

## [1.31.2] - 2022-04-13
### Changed
- The GMI Range marker and macros to change them now come with four different genres: modern (the current one), fantasy, horror, and sci-fi. Those need to be specified in the macros in order to change the marker.
- The notes, description, and equipment tab on marker actors can now be hidden. Use case would be, for example, to hide the notes and description on trading actors or loot sheets, so that the equipment tab is the first (and only) one to open when the actor sheet is opened.

### Fixed
- Too long entity link names in the chat are now fixed.

## [1.31.1] - 2022-03-27
### Changed
- Renamed Compendia.
- Document links and clickable roll formulas on the character sheet are now rendered smaller in order to be less invasive of the layout.

### Fixed
- The lighting tab in the token settings now works properly.
- Bar Brawl was behaving a bit unreliable, probably due to the fact that I tried to pre-configure it while at the same time allow for user-configured defaults. There is now a system setting with which you can choose to either use the Cypher system defaults (which will always overwrite your own defaults and prototype token settings, and hide the resource tab on the token configuration window) or let you configure Bar Brawl yourself. In both cases, existing tokens keep their Bar Brawl settings. This should let Bar Brawl work more reliable.

  **Note:** There are two macros in the Secret Setting compendium, with which you can either reset or remove the Bar Brawl settings of a selected token (or else all tokens on the canvas, if none is selected). This should make it easier to correct any wrong configurations.

## [1.31.0] - 2022-03-09
### Added
- New macros and a marker to signify GMI Range, as it’s used in Disaster Mode (First Responders), Horror Mode (CSR and Stay Alive!), Redline Maneuvers & Void Rules (The Stars Are Fire), and Curse Mode (We Are All Mad Here).
- New setting for the default identification status of cyphers and artifacts, when they are dragged & dropped onto actor sheets. Holding alt while dragging & dropping reverses the identified status. The setting from Nice(TSY) Cypher Add-Ons takes precedence, though.

### Changed
- Some spring cleaning and refactoring of the code.
- Removed Dead status from character sheet. It served no purpose and it makes using the Combat Tracker module more streamlined.
- Default disposition of all new actors across all types is now neutral.
- The GM can now mark cyphers and artifacts as identified right from the actor sheets.
- Moved the button to mark cyphers and artifacts as (un)identified on the item sheets from the navigation bar next to the level.

### Fixed
- Fixed a translation string for Calculate Difficulty macro.
- The dice tray now works correctly at the right hand side when using the Custom Sheets module.

## [1.30.3] - 2022-02-20
### Fixed
- Further improvements to line height for document links.

## [1.30.2] - 2022-02-20
### Fixed
- Further improvements to line height for document links.

## [1.30.1] - 2022-02-20
### Fixed
- Further improvements to line height for document links.

## [1.30.0] - 2022-02-20
### Added
- A new option for a dice tray that appears on PC sheets. This dice tray allows for general d6, 10, d20, and d100 rolls.

### Fixed
- Increased line spacing in item descriptions on the character sheet in order to give document links a bit more space.

## [1.29.1] - 2022-02-05
### Changed
- Improved on the Rename #Tag/@Recursion macro. It’s now required to use “#” or “@” for tags/recursions. Also, the macro renames the tag and recursion items on the character sheet as well.
- Tags and recursions in names and descriptions of items are now only recognized as such when they either stat at a new line, end a line, or have spaces around them (or a combination of those). That means that `something#tag`, `recursion@` and `lonely # or @ characters somewhere in the text` are no longer recognized as tags/recursions.

### Fixed
- Updating combatants, for example when adding them to the combat tracker, threw an error for all connected players.
- Items that contain a document link in their description are no longer falsely archived when translating to a different recursion.

## [1.29.0] - 2022-01-29
### Added
- A new game mode: The Strange. This enables a new tab on the character sheet where you can specify recursions and the focus your PC has on that recursion. Add `@recursion` to the name or description of any item in order to unarchive the item when translating, while archiving all items that have a different recursion added to the name or description. Additionally, you can add modifiers to your stat pools and Edge values, which only apply when being on that recursion. Translating to a recursion enables the additional sentence field, which is then used for the current recursion.

  *Example:* Hopper has been on Earth and Ardeyn, so there are two recursions specified in the new tab. On Earth, Hopper *Entertains*, while on Ardeyn, Hopper *Slays Dragons*. Because of that, Hopper’s player has added `@Earth` to the description of the ability *Levity*, but `@Ardeyn` to the skills *greatswords and lances* and *Names, habits, suspected lairs, and related topics regarding dragons in Ardeyn. You can make yourself understood in the language of dragons*, which Hopper is practiced and trained in, respectively, on Ardeyn. Hopper also added `@Ardeyn` to the ability *Dragon Bane*. When Hopper translates from Earth to Ardeyn, *Levity* is being archived, while the Ardeyn-specific skills and *Dragon Bane* are being unarchived.

- A new setting to enable tags on the character sheet. If the game mode is The Strange, the tags will be listed in the recursion tab, else a new tags tab appears. Add `#tag` to the name or description of any item in order to unarchive the item when enabling or disabling the tags. Additionally, you can define a tag as an *exclusive tag*. Only one exclusive tag can be active at the same time and if you enable an exclusive tag, all other exclusive tags are being disabled. Exclusive tags can add modifiers to your stat pools and Edge values, which only apply when the tag is active. Regular tags are not affected by exclusive tags.

  *Example:* Taggart has three tags defined in the tags list: Set 01 (regular tag), Set 02, and Set 03 (both exclusive tags). If Set 01 is enabled or disabled, all items that have `#Set 01` added in either the name or description is bein unarchived or archived, respectively. Set 02 is an exclusive tag, and it has a +2 bonus to Taggart’s Might pool set. If Set 02 is enabled, Set 03 is being disabled, the current and maximum Might pool is increased by 2, and all items that have `#Set 02` aded to their name or description are being unarchived, while all items that have `#Set 03` added to their name or description are being archived. If Taggart then enables Set 03, this is being reversed.

- When a tag or recursion item is renamed, the corresponding tags and recursions on the items are renamed as well.
- New utility macro to batch rename or delete tags and recursions.

### Fixed
- The ammo list is now getting enabled in the settings when ammo gets dragged onto the character sheet.

## [1.28.1] - 2022-01-16
### Changed
- Using the recovery roll button on the character sheet now auto-checks the next free recovery.
- Updated the Recovery Roll macro so that auto-checking a recovery can be disabled and a different dice formula can be used.
- Updated translations.

## [1.28.0] - 2022-01-09
### Added
- Added a new Calculate Difficulty macro, with which the GM can tally the difficulty (with most combat-relevant modifiers included) and send the result to the chat. The idea is that the GM tallies only the GM-side of the difficulty, while the players then apply skills, assets, Effort, and anything else from their side (abilities, cyphers, artifacts) to that difficulty.

  The result can be send to everyone, whispered to the GM, or whispered to the GM while the players only get a vague description of the difficulty. Note that difficulties 3, 5, 7, and 9 could have the higher or the lower description. This is done so that there’s some ambiguity for the players.

  | Difficulty | Vague Description                                      |
  | ---------: | ------------------------------------------------------ |
  |          0 | This is a routine task.                                |
  |        1-3 | This is a typical everyday task.                       |
  |        3-5 | This is a difficult, but doable task.                  |
  |        5-7 | This is a hard task, likely requiring some effort.     |
  |        7-9 | This is a heroic task, worthy of tales of adventuring. |
  |        >=9 | This is impossible!                                    |

  As usual, all defaults can be changed in the macro. alt-clicking the macro skips the dialog, using the defaults specified in the macro.

### Changed
- The Translate to Recursion macros now also allow for changes in Edge values.

### Fixed
- Fixed a bug with older Translate to Recursion macros, which deleted all pool values. Old Translate to Recursion macros are still usable, but I encourage anyone to recreate the older ones with the new ones in the compendium.

## [1.27.2] - 2022-01-07
### Fixed
- Fixed a bug preventing quick roll macros to function.

## [1.27.1] - 2022-01-06
### Changed
- The Translate to Recursion macro has been expanded so that stat changes on that recursion can be defined as well.

### Fixed
- Fixed a bug preventing All-in-One rolls from the stat Pools and the All-in-One macro.

## [1.27.0] - 2022-01-05
### Added
- Skills can now be configured so that the roll results are used as the initiative result. It basically does these things, then:
  1. Add all tokens of the actor to the combat tracker (only if a combat is active and only if the actor has a token on the scene).
  2. Make a skill roll, including the regular cost.
  3. Change the initiative value of the tokens to the roll result plus 3 for each easement and minus 3 for each hindrance.
- A new compendium with pre-configured skills for initiative and defense tasks has been added.

### Changed
- NPCs, Vehicles, and Communities now auto-populate the initiative values when adding them to the combat tracker.
- Actor & item sheets now have proper names in the sheet selection dialog.
- Due to the new skills as initiative roll option, PC actors don’t use the bonus to initiative setting anymore. Please migrate any initiative bonus to an initiative skill. Other actors keep this setting.
- Roll buttons are now enabled by default when creating new worlds.
- Shown item descriptions now stay shown even when the sheet is getting re-rendered. Before, all item descriptions were hidden again when one, for example, changed a Pool value or closed an opened the sheet. This is a client side setting, so it does not affect other players or the GM when both are viewing the sheet simultaneously (meaning both can view different item descriptions). This comes at the cost of the nice sliding animation, though.

### Fixed
- The secret setting macro for resetting Drag Ruler defaults has been fixed.
- Fixed a bug in the CSS where ordered lists were displayed as unordered lists in the chat and journal entries.
- When using the Bar Brawl module, resource bars specified in the prototype token now overwrite the system defaults.

## [1.26.3] - 2021-11-21
### Changed
- For abilities sorted as spells the tier (low, mid, or high) can now be specified in the item settings.

### Fixed
- Fixed a bug where holding alt when dragging & dropping items between actors did nothing. [#187](https://github.com/mrkwnzl/cyphersystem-foundryvtt/issues/187)
- Item sheets keep their scroll position when altering values.
- Item macros can be created in Foundry v9 again.
- The roll button respects the difficulty modifier in the item settings.
- Fixed an issue where text was cut off in some dropdown menus.
- Fixed an issue where the marker as counter didn’t count on initiative when no step value is specified.

## [1.26.2] - 2021-11-04
### Added
- You can now enable that the item description of rolled items is always shown with a secret setting.

### Changed
- Changed the way additional Recovery Rolls are handled. It now allows for up to seven one-action rolls, and zero to two ten-minute rolls. **Note:** There were internal changes on how the additional rolls are handled needed. I was only able to test this in a limited capacity. It might be needed that you reset the amount of rolls which are supposed to be available by hand.

### Fixed
- Fixed a bug where you’d get a false warning for copying duplicate items.

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
