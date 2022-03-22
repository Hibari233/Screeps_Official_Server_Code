/**
 * Transport goods from one to another
 * 
 * @param str 
 * @param arr
 * @param 
 */
module.exports = {
    run: function(transferTarget, withdrawTarget, taskName, roomName, spawnRoomName, creepNum, type, tickLimit) {
        const creepName = 'creep_transporter_' + taskName + ' ' + Game.time;
        const body = autoScale(spawnRoomName);
        var curCreepNum = 0;
        for(var name in Game.creeps) {
            creep = Game.creeps[name];
            if(creep.memory.task == taskName){
                curCreepNum ++;
                creepTransport(creep, transferTarget, withdrawTarget, roomName, type, tickLimit);
            }
        }
        if(curCreepNum < creepNum) {
            autoSpawnCreep(creepName, spawnRoomName, taskName, body);
        }
    }
}

function autoScale(roomName) {
    let room = Game.rooms[roomName];
    let part = [CARRY, CARRY, MOVE];
    let body = [CARRY, CARRY, MOVE];
    let parts = 1;
    while(150 * parts <= room.energyCapacityAvailable - 150 && body.length + part.length <= 50){
        body = body.concat(part);
        parts ++;
    }
    return body;
}

function creepTransport(creep, transferTarget, withdrawTarget, roomName, type, tickLimit) {
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
            console.log('CANNOT FIND TARGET OR HAVE NO VISUAL ON TARGET');
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

function getAvaliableSpawn(room) {
    for (var spawnname in Game.spawns) {
        var spawn = Game.spawns[spawnname];
        if (spawn.room.name == room && spawn.spawning == null) {
            return spawn;
        }
    }
    return null;
}

function autoSpawnCreep(creepName, spawnRoomName, taskName, body) {
    var spawn = getAvaliableSpawn(spawnRoomName);
    if(spawn) {
        spawn.spawnCreep(body, creepName, {memory: {task: taskName}});
    }
}