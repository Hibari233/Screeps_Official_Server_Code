const emergency_body = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];
const small_body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
const large_body = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
var creep;

module.exports = {
    run: function(roomName) {
        const creepName = 'creep_' + roomName + "war_energy_manager";
        autoScale(roomName);
        const creep = Game.creeps[creepName];
        if(creep){
            creepManage(creep);
        }
        else{
            autoSpawnCreep(creepName, roomName, autoScale(roomName));
        }
    }
}

function autoScale(roomName) {
    let room = Game.rooms[roomName];
    let part = [CARRY, CARRY, MOVE];
    let body = [CARRY, CARRY, MOVE];
    let parts = 1;
    while(150 * parts <= room.energyAvailable - 150 && body.length + part.length <= 50){
        body = body.concat(part);
        parts ++;
    }
    return body;
}

function creepManage(creep){
    if(creep.store.getFreeCapacity() == 0) creep.memory.state = 1;
    if(creep.store.getUsedCapacity() == 0) creep.memory.state = 0;
    
    if(creep.memory.state == 1) {
        fillInfrastructures(creep);
    }
    else {
        if(creep.room.storage && creep.room.storage.store.energy > 0) withdrawFromStorage(creep);
        else if(creep.room.terminal && creep.room.terminal.store.energy > 10000) withdrawFromTerminal(creep);
    }
}

function fillInfrastructures(creep) {
    let infrastructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_LAB && structure.store.getUsedCapacity(RESOURCE_ENERGY) <= 1000) ;
        }
    });
    if(creep.transfer(infrastructure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(infrastructure);
    }
}

function withdrawFromSpawn(creep) {
    var spawn = getAvaliableSpawn(creep.room.name);
    if(spawn) {
        if(creep.withdraw(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn);
        }
    }
}

function withdrawFromTerminal(creep){
    let terminal = creep.room.terminal;
    if(terminal) {
        if(creep.withdraw(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(terminal);
        }
    }
}

function withdrawFromStorage(creep){
    let storage = creep.room.storage;
    if(storage) {
        if(creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(storage);
        }
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

function autoSpawnCreep(creepName, spawnRoomName, body) {
    var spawn = getAvaliableSpawn(spawnRoomName);
    if(spawn) {
        spawn.spawnCreep(body, creepName, {memory: {task: 'manager', roomName: spawnRoomName}});
    }
}
