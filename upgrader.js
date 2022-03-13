const tiny_body = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
const small_body = [WORK, WORK ,WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
const middle_body = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
const guntong_body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE];

module.exports = {
    run: function(roomName, creepNum) {
        const creepName = 'creep_' + Game.time;
        const body = autoScale(roomName);
        const controller = Game.rooms[roomName].controller;
        var curCreepNum = 0;
        for(var name in Game.creeps) {
            creep = Game.creeps[name];
            if(creep.memory.task == 'upgrader' && creep.memory.room == roomName){
                curCreepNum ++;
                creepControl(creep, controller);
            }
        }
        if(curCreepNum < creepNum) {
            autoSpawnCreep(creepName, roomName, roomName, body);
        }
    }
}

function rollScale(roomName) {
    let room = Game.rooms[roomName];
    if(room.controller.level == 8 && room.controller.ticksToDowngrade <= 100000) return [WORK, CARRY, MOVE];
    if(room.controller.level == 8) return [];
    let body = [WORK, CARRY, MOVE];
    let part = [WORK];
        let parts = 1;
        while(100 * parts <= room.energyCapacityAvailable - 100 - 100 && body.length + part.length <= 50){
            body = body.concat(part);
            parts ++;
        }
        return body;
}


function autoScale(roomName) {
    let room = Game.rooms[roomName];
    if(room.controller.level == 8 && room.controller.ticksToDowngrade <= 100000) return [WORK, CARRY, MOVE];
    if(room.controller.level == 8) return [];
    let part = [WORK, CARRY, MOVE];
    let body = [WORK, CARRY, MOVE];
        let parts = 1;
        while(200 * parts <= room.energyCapacityAvailable - 200 && body.length + part.length <= 50){
            body = body.concat(part);
            parts ++;
        }
        return body;
}

function creepControl(creep, controller) {
    var stateControl = 1;
    if(creep.store.getUsedCapacity() == 0) stateControl = 0;
    if(stateControl == 1) {
        if(creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(controller, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
    else {
        if(creep.room.terminal && creep.room.terminal.store.energy > 10000) withdrawFromTerminal(creep);
        else if(creep.room.storage && creep.room.storage.store.energy > 1000) withdrawFromStorage(creep);
        else withdrawFromSpawn(creep);
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


function withdrawFromStorage(creep){
    let storage = creep.room.storage;
    if(storage.store.energy <= 10000) return;
    if(storage) {
        if(creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(storage);
        }
    }
}

function withdrawFromTerminal(creep){
    let terminal = creep.room.terminal;
    let controller = creep.room.controller;
    //if(terminal.store.energy <= 10000) return;
    if(terminal) {
        creep.upgradeController(controller);
        if(creep.withdraw(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(terminal);
        }
    }
}

function transferToContainer(creep) {
    var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_CONTAINER
    });
    if(container) {
        if(creep.transfer(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container);
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
        spawn.spawnCreep(body, creepName, {memory: {task: 'upgrader', room: roomName}});
    }
}