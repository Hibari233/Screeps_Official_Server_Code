const tiny_body = [WORK, CARRY, MOVE];
const small_body = [WORK, WORK ,WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
const middle_body = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];

module.exports = {
    run: function(roomName) {
        const creepName = 'creep_' + Game.time;
        const body = middle_body;
        var curCreepNum = 0;
        var creepNum = 0;
        var len = Game.rooms[roomName].find(FIND_CONSTRUCTION_SITES).length
        if(len > 0) {
            creepNum = 1;
        }
        if(len > 10) {
            creepNum = 3;
        }
        if(creepNum == 0) return;
        for(var name in Game.creeps){
            creep = Game.creeps[name];
            if(creep.memory.task == 'builder' && creep.memory.room == roomName) {
                curCreepNum ++;
                creepBuild(creep);
            }
        }
        if(curCreepNum < creepNum) {
            autoSpawnCreep(creepName, roomName, roomName, autoScale(roomName));
        }
    } 
}

function autoScale(roomName) {
    let room = Game.rooms[roomName];
    let part = [WORK, CARRY, MOVE];
    let body = [WORK, CARRY, MOVE];
    let parts = 1;
    while(200 * parts <= room.energyCapacityAvailable - 200 && body.length + part.length <= 50){
        body = body.concat(part);
        parts ++;
    }
    return body;
}

function creepBuild(creep) {
    if(creep.store.getFreeCapacity() == 0) creep.memory.state = 1;
    if(creep.store.getUsedCapacity() == 0) creep.memory.state = 0;
    
    if(creep.memory.state == 1) {
        const target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
        if(creep.build(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
    else{
        if(creep.room.terminal) withdrawFromTerminal(creep);
        else if(creep.room.storage) withdrawFromStorage(creep);
        else withdrawFromSpawn(creep);
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

function withdrawFromSpawn(creep) {
    var spawn = getAvaliableSpawn(creep.room.name);
    if(spawn && spawn.store[RESOURCE_ENERGY] > 150) {
        if(creep.withdraw(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn);
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

function autoSpawnCreep(creepName, spawnRoomName, roomName, body) {
    var spawn = getAvaliableSpawn(spawnRoomName);
    if(spawn) {
        spawn.spawnCreep(body, creepName, {memory: {task: 'builder', room: roomName}});
    }
}