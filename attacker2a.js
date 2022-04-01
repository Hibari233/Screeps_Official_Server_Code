
module.exports = {
    run: function(flagName, taskName, roomName) {
        const workerName = 'creep_attacker_squad_' + taskName;
        const healerName = 'creep_attacker_squad_h_' + taskName;
        const worker_body = parse('12t28a10m');
        const healer_body = parse('12t28h10m');
        let worker = Game.creeps[workerName];
        let healer = Game.creeps[healerName];
        if(worker && healer){
            if(checkCreepAllBoosted(worker) == false) {autoBoost(worker); return;}
            if(checkCreepAllBoosted(healer) == false) {autoBoost(healer); return;}
            creepAttack(worker, healer, flagName);
        }
        else{
            if(!worker) autoSpawnCreep(workerName, roomName, worker_body);
            if(!healer) autoSpawnCreep(healerName, roomName, healer_body);
        }
    }
}

function creepAttack(worker, healer, flagName) {
    if(worker.hits < healer.hits) healer.heal(worker);
    else healer.heal(healer);
    let flag = Game.flags[flagName];
    if(flag == undefined){
        console.log('CANNOT FIND FLAG ' + flagName);
        return;
    }
    if(flag.color == COLOR_ORANGE){
        autoBoostCreep(worker);
        autoBoostCreep(healer);
    }
    if(flag.room != worker.room){
        if(worker.pos.getRangeTo(healer) == Infinity){
            healer.moveTo(flag, {visualizePathStyle: {stroke: '#f6b352', opacity: .5}, bypassHostileCreeps: false});
        }
        if(worker.pos.inRangeTo(healer, 1) == true && worker.fatigue == 0) {
            healer.moveTo(flag, {visualizePathStyle: {stroke: '#f6b352', opacity: .5}, bypassHostileCreeps: false});
        }
        worker.moveTo(healer, {visualizePathStyle: {stroke: '#f6b352', opacity: .5}});
    }
    else{
        let target = worker.room.lookForAt(LOOK_STRUCTURES, flag);
        let hostile_creep = creep.room.find(FIND_HOSTILE_CREEPS);
        target = target.concat(hostile_creep);
        if(target[0]){
            if(worker.attacker(target[0]) == ERR_NOT_IN_RANGE) {
                if(healer.pos.inRangeTo(worker, 1) == true && healer.fatigue == 0) {
                    worker.moveTo(flag, {visualizePathStyle: {stroke: '#f6b352', opacity: .5}, bypassHostileCreeps: false});
                }
                healer.moveTo(worker, {visualizePathStyle: {stroke: '#f6b352', opacity: .5}, bypassHostileCreeps: false});
            }
        }
        else{
            if(worker.pos.getRangeTo(healer) == Infinity){
                healer.moveTo(flag, {visualizePathStyle: {stroke: '#f6b352', opacity: .5}, bypassHostileCreeps: false});
            }
            if(worker.pos.inRangeTo(healer, 1) == true && worker.fatigue == 0) {
                healer.moveTo(flag, {visualizePathStyle: {stroke: '#f6b352', opacity: .5}, bypassHostileCreeps: false});
            }
            worker.moveTo(healer, {visualizePathStyle: {stroke: '#f6b352', opacity: .5}});
        }
    }
}

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
        spawn.spawnCreep(body, creepName);
    }
}

function autoBoostCreep(creep) {
    console.log('Boosting creep ' + creep.name);
    var labs = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_LAB;
        }
    });
    for (var lab in labs) {
        labs[lab].boostCreep(creep);
    }
}

function autoBoost(creep){
    if(creep.memory.boost == undefined) creep.memory.boost = 0;
    var labs = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_LAB;
        }
    });
    if(creep.memory.boost == 10) creep.memory.boost = 0;
    if(labs && creep){
        if(checkCreepAllBoosted(creep) == false) creep.moveTo(labs[creep.memory.boost]);
        if(creep.pos.isNearTo(labs[creep.memory.boost].pos) == true) {
            labs[creep.memory.boost].boostCreep(creep);
            creep.memory.boost++;
        }
    }
}

function checkCreepAllBoosted(creep){
    for(let i in creep.body){
        if(creep.body[i].boost == undefined){
            return false;
        }
    }
    return true;
}