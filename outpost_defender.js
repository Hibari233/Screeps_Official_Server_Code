//const body_against_hostiles = [RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL];
//const body_against_cores = [ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
const body = [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE];


module.exports = {
    run: function (roomName, spawnRoomName, creepNum) {
        const creepName = 'cleaner_' + Game.time;
        let curCreepNum = 0;
        for(let name in Game.creeps){
            creep = Game.creeps[name];
            if(creep.memory.task == 'cleaner' && creep.memory.room == roomName){
                curCreepNum ++;
                if(!creep.pos.inRangeTo(new RoomPosition(25, 25, roomName),24)) creep.moveTo(new RoomPosition(25, 25, roomName));
                else clean(creep);
            }
        }
        if(curCreepNum < creepNum) {
            autoSpawnCreep(creepName, spawnRoomName, roomName, body);
        }
    }
}

function clean(creep){
    if(!Game.time % 5) console.log(creep.name + ' is cleaning Room_' + creep.room.name);
    let hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
    let structures = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
                structure.structureType == STRUCTURE_SPAWN ||
                structure.structureType == STRUCTURE_TOWER ||
                structure.structureType == STRUCTURE_STORAGE ||
                structure.structureType == STRUCTURE_TERMINAL ||
                structure.structureType == STRUCTURE_LINK);
        }
    });
    let sites = creep.room.find(FIND_CONSTRUCTION_SITES);
    let targets = structures.concat(hostiles);
    targets = targets.concat(sites);
    if(targets.length > 0) {
        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        creep.rangedMassAttack();
        /*
        if(creep.rangedAttack(targets[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
        */
    }
}

function autoSpawnCreep(creepName, spawnRoomName, roomName, body) {
    var spawn = getAvaliableSpawn(spawnRoomName);
    if (spawn) {
        spawn.spawnCreep(body, creepName, {memory: {task: 'cleaner', room: roomName}});
    }
}

function getAvaliableSpawn(room) {
    for (var spawnname in Game.spawns) {
        var spawn = Game.spawns[spawnname];
        if (spawn.room.name == room && spawn.spawning == null) {
            return spawn;
        }
    }
    return null;
}