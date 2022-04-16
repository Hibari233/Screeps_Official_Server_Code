const emergency_body = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];
const small_body = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
const large_body = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
var creep;

module.exports = {
    run: function(roomName) {
        const creepName = 'creep_' + roomName + "_manager";
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
    let centerLink = creep.room.find(FIND_STRUCTURES, {
        filter: (s) => {
            return s.structureType == STRUCTURE_LINK && s.pos.inRangeTo(creep.room.storage.pos, 2);
        }
    });
    if(centerLink[0] && centerLink[0].store.energy > 0) creepTransport(creep, creep.room.storage.id, centerLink[0].id, RESOURCE_ENERGY, 0);
    else fillInfrastructures(creep);
}

function transferToStorage(creep){
    let storage = creep.room.storage;
    if(storage) {
        if(creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(storage);
        }
    }
}

function fillInfrastructures(creep) {
    if(creep.store.energy > 0) {
        let infrastructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (((structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
                        (structure.structureType == STRUCTURE_TOWER && structure.store.getUsedCapacity(RESOURCE_ENERGY) <= 500) ||
                        (structure.structureType == STRUCTURE_TERMINAL && structure.store.getUsedCapacity(RESOURCE_ENERGY) <= 10000) ||
                        (structure.structureType == STRUCTURE_LAB && structure.store.getUsedCapacity(RESOURCE_ENERGY) <= 1000) || 
                        (structure.structureType == STRUCTURE_POWER_SPAWN && structure.store.getUsedCapacity(RESOURCE_ENERGY) <= 3000)) ;
            }
        });
        if(creep.transfer(infrastructure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(infrastructure);
        }
    }
    else {
        if(creep.room.storage && creep.room.storage.store.energy > 0) withdrawFromStorage(creep);
        else if(creep.room.terminal && creep.room.terminal.store.energy > 10000) withdrawFromTerminal(creep);
    }
}

function creepTransport(creep, transferTarget, withdrawTarget, type, tickLimit) {
    var state = 1;
    if(creep.store.getUsedCapacity() == 0) state = 0;
    if(creep.ticksToLive < tickLimit && creep.store.getUsedCapacity() == 0) creep.suicide();
    if(state == 1) {
        let target = Game.getObjectById(transferTarget);
        if(target == undefined){
            //console.log('CANNOT FIND TARGET OR HAVE NO VISUAL ON TARGET');
            return;
        }
        if(target) {
            if(type == 'ALL') {
                for(var name of RESOURCES_ALL) {
                    if(creep.store.getUsedCapacity(name) > 0) {
                        if(target.store.getFreeCapacity(name) == 0 || creep.ticksToLive <= tickLimit) target = Game.getObjectById(withdrawTarget);
                        if(creep.transfer(target, name) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#f6b352', opacity: .5}});
                        }
                    }
                }
            }
            else if(type == 'EXCEPT_ENERGY') {
                for(var name of RESOURCES_ALL) {
                    if(name == RESOURCE_ENERGY) continue;
                    if(target.store.getFreeCapacity(name) == 0 || creep.ticksToLive <= tickLimit) target = Game.getObjectById(withdrawTarget);
                    if(creep.store.getUsedCapacity(name) > 0) {
                        if(creep.transfer(target, name) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#f6b352', opacity: .5}});
                        }
                    }
                }
            }
            else{
                if(target.store.getFreeCapacity(type) == 0 || creep.ticksToLive <= tickLimit) target = Game.getObjectById(withdrawTarget);
                if(creep.transfer(target, type) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
    else {
        let target = Game.getObjectById(withdrawTarget);
        let ttarget = Game.getObjectById(transferTarget);
        if(target == undefined){
            console.log(creep.name + ': CANNOT FIND TARGET OR HAVE NO VISUAL ON TARGET');
            return;
        }
        if(type == 'ALL') {
            for(var name of RESOURCES_ALL) {
                if(target.store.getUsedCapacity(name) > 0) {
                    if(ttarget.store.getFreeCapacity(name) == 0 || creep.ticksToLive <= tickLimit) return;
                    if(creep.withdraw(target, name) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#f6b352', opacity: .5}});
                    }
                }
            }
        }
        else if(type == 'EXCEPT_ENERGY') {
            for(var name of RESOURCES_ALL) {
                if(name == RESOURCE_ENERGY) continue;
                if(ttarget.store.getFreeCapacity(name) == 0 || creep.ticksToLive <= tickLimit) return;
                if(target.store.getUsedCapacity(name) > 0) {
                    if(creep.withdraw(target, name) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#f6b352', opacity: .5}});
                    }
                }
            }
        }
        else{
            if(target) {
                if(ttarget.store.getFreeCapacity(type) == 0 || creep.ticksToLive <= tickLimit) return;
                if(creep.withdraw(target, type) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
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
