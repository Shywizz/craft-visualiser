# Craft Tree Visualizer

### Show all your Minecraft recipes in browser!

When playing complex minecraft modpacks, sometimes its hard to find how much ressources you need before
you can craft complex endgame items

<s>I have never used Vue js before, this is as new to me as it is to you.</s>

![CraftTree screenshot](https://i.imgur.com/pqedJiw.png)

![CraftTree screenshot](https://i.imgur.com/RHDqm0Y.png)

## Getting Started
:warning:**UNDER REWORK**  :warning:
## Informations

What can you see:
- All the items used in saved recipes
- How many of each items are **used**.
- How hard of each item is to **craft**.
- Links between ingredients and results.



## Installation

> ❗ Since this project in actively developed (well, not anymore)
Run **A compatible minecraft version** with the following mods:

|Mod name|Version range|
|--------|-------------|
|[Just Enough Calculation](https://www.curseforge.com/minecraft/mc-mods/just-enough-calculation)|\[`1.12.2` - `1.19.4`\] 
OR|
|Mod name|Version range|
|--------|-------------| |`recipes` [CraftTweaker](https://www.curseforge.com/minecraft/mc-mods/crafttweaker)|\[`1.7.10` - `1.19.4`\]
|`recipes` [CraftTweaker](https://www.curseforge.com/minecraft/mc-mods/crafttweaker)|\[`1.7.10` - `1.19.2`\]
|<`dump` [Icon Exporter](https://www.curseforge.com/minecraft/mc-mods/iconexporter)|\[`1.12.2` - `1.19.2` \]
|`dump` [Isometric Renders](https://www.curseforge.com/minecraft/mc-mods/isometric-renders)|[`1.16.5` - `1.19.4`]                                                   |![isometric-renders-img](https://media.forgecdn.net/avatars/thumbnails/396/251/64/64/637595596561421548.png)|



1. Run **A compatible minecraft version** with the following mods:
    * [Just Enough Calculation](https://www.curseforge.com/minecraft/mc-mods/just-enough-calculation) 
    * [CraftTweaker](https://www.curseforge.com/minecraft/mc-mods/crafttweaker)
    * [Icon Exporter](https://www.curseforge.com/minecraft/mc-mods/iconexporter)
2. Create some recipes ingame with **Crafting Calculator**
    * Export recipes. They appear in `.minecraft/config/JustEnoughCalculation/data/groups.json`
    * Open [this missing file](resources/node_parser.js) and set path variable `GROUPS_PATH` to this file
3. Create list of **OreDictionary** entries:
    * In game run the command `/ct oredict`
    * Open `[.minecraft]/crafttweaker.log`
    * Scroll to end of file and save all lines that start with `Ore entries for [...]` to [the nonexistent ressource folder](resources/rawData/crafttweaker.log)
4. Create a **Spritesheet** with all icons
    * In game run command `/iconexporter export` (works only in single player)
    * Download and run [Texture Packer](https://www.codeandweb.com/texturepacker). It can be used for free.
    * Drag and drop folder `[MC_FOLDER]/icon-exports-x32` in program, adjust `Max Size` and chose `Framework` to `JSON (Array)`
    * Publish Spritesheet. Put `json` to [resources/rawData/sheet/Spritesheet.json](resources/rawData/sheet/Spritesheet.json) and `.png` to [resources/Spritesheet.png](resources/Spritesheet.png)
5. Run `node_parser.js` with **Node.js**. This would update [parsedData.json](resources/parsedData.json) and [groups.json](resources/groups.json)

**Hint:**
You dont need to do steps `3` and `4` if you play [Enigmatica 2: Expert](https://www.curseforge.com/minecraft/modpacks/enigmatica2expert), because icons and OreDict entries are basicly same as predefined in repo.

<details>
<summary>Recipe making recomendations</summary>

* Use most **common** ingredients. For example better to craft pistons from copper plates
      <img src="https://i.imgur.com/Cezj7Vo.png" width=300>
* Adds variants with better yields of recipes, avaliable in the **progression** tab.

For example, wood planks should be proccessed in machines with a x6 yield instead of x2, and metal plates should be made from 1 ingot, not 2
  <img src="https://i.imgur.com/TAwwU24.png" width=300>
* Move press molds and other not actually comsumed items to **catalysts** section
  <img src="https://i.imgur.com/lLBtFah.png" width=300>
* It would be cool if you add additional **catalysts** that actualy used in recipe. For example pedestals or energy for charged draconium
  <img src="https://i.imgur.com/T2ykYBP.png" width=300>
* Use **Placeholders** when recipes require more slots than avaliable. TreeVisualizer will automatically replace all placeholders with the required ing
  <img src="https://i.imgur.com/TRafahV.png" width=300>
* Some recipes have no other inputs except time. Make Placeholder for **Ticks**. Also output can be chanced
  <img src="https://i.imgur.com/dsI8jwA.png" width=300>
</details>

---------------
Powered by:

* Vue
* [Data-Driven Documents](https://d3js.org/)

