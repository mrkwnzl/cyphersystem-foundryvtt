import {AbilityData} from './ability.js';
import {AmmoData} from './ammo.js';
import {ArmorData} from './armor.js';
import {ArtifactData} from './artifact.js';
import {AttackData} from './attack.js';
import {CypherData} from './cypher.js';
import {EquipmentData} from './equipment.js';
import {LastingDamageData} from './lasting-damage.js';
import {MaterialData} from './material.js';
import {OddityData} from './oddity.js';
import {PowerShiftData} from './power-shift.js';
import {RecursionData} from './recursion.js';
import {SkillData} from './skill.js';
import {TagData} from './tag.js';

export function initItemModels() {
  CONFIG.Item.dataModels = {
    ability: AbilityData,
    ammo: AmmoData,
    armor: ArmorData,
    artifact: ArtifactData,
    attack: AttackData,
    cypher: CypherData,
    equipment: EquipmentData,
    ["lasting-damage"]: LastingDamageData,
    material: MaterialData,
    oddity: OddityData,
    ["power-shift"]: PowerShiftData,
    recursion: RecursionData,
    skill: SkillData,
    tag: TagData,
  }
}