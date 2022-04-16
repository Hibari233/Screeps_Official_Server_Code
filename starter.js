var room, source, creep;
module.exports = {
    run: function(roomName, taskName, sourceid) {
        let body = autoScale(roomName);
        const creepName = roomName + '_starter_' + taskName;
        let creep = Game.creeps[creepName];
        if(creep) {
            creepRun(creep, sourceid);
        }
        else{
            autoSpawnCreep(creepName, roomName, taskName, body);
        }
    }
}

function autoScale(roomName) {
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

function creepRun(creep, sourceid){
    if(creep.store.getFreeCapacity() == 0) creep.memory.state = 0;
    if(creep.store.getUsedCapacity() == 0) creep.memory.state = 1;
    if(creep.pos.inRangeTo(Game.getObjectById(sourceid).pos, 1)) creep.memory.dontPullMe = true;
    else creep.memory.dontPullMe = false;
    if(creep.memory.state == 1){
        let source = Game.getObjectById(sourceid);
        if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
    }
    else{
        let targets = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });

        let sites = creep.room.find(FIND_CONSTRUCTION_SITES);

        if(targets.length > 0) {
            if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
        }
        else if(sites.length > 0){
            if(creep.build(sites[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sites[0]);
            }
        }
        else{
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
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