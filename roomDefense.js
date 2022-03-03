class RoomDefense{
    constructor(room){
        this.room = room;
    }

    getBestTarget(){
        if(this.bestTarget){
            return this.bestTarget;
        }
        let hostiles = this.room.find(FIND_HOSTILE_CREEPS);
        let towers = this.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_TOWER;
            }
        });
        let maxAttack = -Infinity;
        let maxCreep = undefined;
        for(let creep of hostiles){
            let attack = 0;
            for(let tower of towers){
                attack += tower.getTowerPower(creep, TOWER_POWER_ATTACK);
            }
            if(attack > maxAttack){
                maxCreep = creep;
                maxAttack = attack;
            }
        }
        this.bestTarget = maxCreep;
        return maxCreep;
    }
}

module.exports = RoomDefense;