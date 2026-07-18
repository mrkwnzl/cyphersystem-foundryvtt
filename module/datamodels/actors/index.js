import {PCData} from './pc.js';
import {NPCData} from './npc.js';
import {CompanionData} from './companion.js'
import {CommunityData} from './community.js'
import {VehicleData} from './vehicle.js'
import {MarkerData} from './marker.js'

export function initActorModels() {
  CONFIG.Actor.dataModels = {
    pc: PCData,
    npc: NPCData,
    companion: CompanionData,
    community: CommunityData,
    vehicle: VehicleData,
    marker: MarkerData,
  }
}