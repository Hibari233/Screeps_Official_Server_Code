'use strict';

StructureTower.prototype.run = function(RoomDefense) {
    let target = RoomDefense.getBestTarget();
    if(target) {
        this.attack(target);
        return;
    }
    let healTarget = this.room.find(FIND_MY_CREEPS, {
        filter: (creep) => creep.hits < creep.hitsMax
    })[0];
    if(healTarget) {
        this.heal(healTarget);
        return;
    }
    let emergentRepairTarget = this.room.find(FIND_STRUCTURES, {
        filter: (s) => {
            return (s.structureType == STRUCTURE_WALL && s.hits < 10000) ||
                (s.structureType == STRUCTURE_RAMPART && s.hits < 10000) ||
                (s.structureType == STRUCTURE_ROAD && s.hits < s.hitsMax * 0.6) ||
                (s.structureType == STRUCTURE_CONTAINER && s.hits < s.hitsMax * 0.5);
        }
    });
    let id = _.random(emergentRepairTarget.length - 1);
    if(emergentRepairTarget[id]) {
        this.repair(emergentRepairTarget[id]);
        return;
    }
};

StructureTower.prototype.getTowerPower = function(x, basepower) {
    let pos = x;
    if(!x instanceof RoomPosition){
        pos = x.pos;
    }
    const range = this.pos.getRangeTo(x);
    if(range <= TOWER_OPTIMAL_RANGE){
        return basepower;
    }
    if(range >= TOWER_FALLOFF_RANGE){
        return (1 - TOWER_FALLOFF) * basepower;
    }
    return Math.round((1 - TOWER_FALLOFF * (range - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE)) * basepower);
};