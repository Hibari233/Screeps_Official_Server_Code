const emergency_body = [WORK, CARRY, MOVE];
const tiny_body = [WORK, WORK, CARRY, CARRY, MOVE, MOVE];
const small_body = [WORK, WORK , WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE];
const middle_body = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
const large_body = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
var room, source, creep;

module.exports = {
    run: function(roomName, sourceID, creepNum) {
        const creepName = 'creep_' + Game.time;
        let body = autoScale(roomName);
        if(Game.time % 500 == 0 && Game.rooms[roomName].controller.level <= 4){
            console.log('check room ' + roomName + ' drone status');
            let cnt = 0;
            for(let creepN in Game.creeps){
                if(creep.memory.task == 'drone' && creep.room == Game.rooms[roomName]) cnt++;
            }
            console.log(cnt);
            if(cnt == 0) body = smartScale(roomName);
        }
        var curCreepNum = 0;
        for(var name in Game.creeps) {
            creep = Game.creeps[name];
            if(creep.memory.task == 'drone' && creep.memory.sourceID == sourceID){
                curCreepNum ++;
                var source = Game.getObjectById(sourceID);
                creepHarvest(creep, source);
            }
        }
        if(curCreepNum < creepNum) {
            autoSpawnCreep(creepName, roomName, sourceID, body);
        }
    }
}

function smartScale(roomName) {
    let room = Game.rooms[roomName];
    let part = [WORK, CARRY, MOVE];
    let body = [WORK, CARRY, MOVE];
        let parts = 1;
        while(200 * parts <= room.energyAvailable - 200 && body.length + part.length <= 50){
            body = body.concat(part);
            parts ++;
        }
        return body;
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

function creepHarvest(creep, source) {
    // 装满了就结束挖矿
    // 空了就开始挖矿
    if(creep.store.getFreeCapacity() == 0) creep.memory.state = 0;
    if(creep.store.getUsedCapacity() == 0) creep.memory.state = 1;
    
    if(creep.memory.state == 1) {
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    }
    else {
        if(creep.room.storage) transferToStorage(creep);
        else transferToSpawn(creep);
    }
}

function transferToSpawn(creep) {
    var spawn = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_TOWER) && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });
    if(spawn) {
        if(creep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn);
        }
    }
}

function transferToStorage(creep){
    let storage = creep.room.storage;
    if(storage) {
        if(creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(storage);
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

function autoSpawnCreep(creepName, spawnRoomName, sourceID, body) {
    var spawn = getAvaliableSpawn(spawnRoomName);
    if(spawn) {
        spawn.spawnCreep(body, creepName, {memory: {task: 'drone', sourceID: sourceID}});
    }
}

/**
 * Parse a string into a creep body array
 * m: move, w: work, c: carry, a: attack, r: ranged, h: heal, l: claim, t:tough
 * @param str {String} The input string to be parsed in format of
 *      ((\num)?[mwcarhlt])*
 *      for example, the string "a2t4mh" will be parsed into the array
 *      [attack, tough, tough, move, move, move, move, heal]
 * @param arr {string[]} no need to input, used for recursion
 * @return {string[]}
 */
 function parse(str, arr = undefined) {
    const r = /([1-9][0-9]*)?[mwcarhlt]/i;
    if(arr === undefined){
        arr = [];
    }
    let s = str.match(r);
    if(s === null){
        return arr;
    }
    let count = 1;
    if(s[1] !== undefined){
        count = parseInt(s[1]);
    }
    const dict = {m:MOVE, w:WORK, c:CARRY, a:ATTACK, r:RANGED_ATTACK, h:HEAL, l:CLAIM, t:TOUGH};
    let t = dict[s[0][s[0].length - 1].toLowerCase()];
    for(let i = 0; i < count; i++){
        arr.push(t);
    }

    return parse(str.substr(s['index'] + s[0].length), arr);
}