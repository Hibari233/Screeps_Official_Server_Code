
module.exports = {
    run: function(flagName, taskName, roomName, status) {
        const creepName = 'creep_attacker_' + taskName;
        const body = parse('12t5r10m23h');
        let creep = Game.creeps[creepName];
        if(creep){
            creepAttack(creep, flagName);
        }
        else{
            if(status) autoSpawnCreep(creepName, roomName, body);
        }
    }
}

function creepAttack(creep, flagName) {
    creep.heal(creep);
    let flag = Game.flags[flagName];
    if(flag == undefined){
        console.log('CANNOT FIND FLAG ' + flagName);
        return;
    }
    if(flag.color == COLOR_ORANGE) autoBoostCreep(creep);
    if(flag.room != creep.room) creep.moveTo(flag, {visualizePathStyle: {stroke: '#f6b352', opacity: .5}});
    else{
        let target = creep.room.lookForAt(LOOK_STRUCTURES, flag);
        let hostile_creep = creep.room.lookForAt(LOOK_CREEPS, flag);
        target = target.concat(hostile_creep);
        if(target[0]){
            if(creep.rangedAttack(target[0]) == ERR_NOT_IN_RANGE){
                creep.moveTo(target[0], {visualizePathStyle: {stroke: '#f6b352', opacity: .5}});
                creep.rangedMassAttack();
            }
        }
        else{
            creep.moveTo(flag, {visualizePathStyle: {stroke: '#f6b352', opacity: .5}});
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