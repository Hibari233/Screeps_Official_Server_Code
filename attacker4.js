let cache={}; // 用小队队长的id做队伍的id?

const squadMoveCache=3; // 跨房需保证该设置>=2

module.exports = {
    run: function(flagName, flagStandbyName, flagAttackName, taskName, roomName, status) {
        const creepCommanderName = 'creep_attacker_leader_' + taskName;
        const creepPilotName = 'creep_attacker_pilot_' + taskName;
        const creepSpecialistName = 'creep_attacker_specialist_' + taskName;
        const creepEngineerName = 'creep_attacker_engineer_' + taskName;
        const body = parse('12t5r10m23h');
        //const body = parse('1t1r5m1h');
        let creepCommander = Game.creeps[creepCommanderName];
        let creepPilot = Game.creeps[creepPilotName];
        let creepSpecialist = Game.creeps[creepSpecialistName];
        let creepEngineer = Game.creeps[creepEngineerName];

        if(creepCommander && creepPilot && creepSpecialist && creepEngineer){
            //console.log(checkCreepAllBoosted(creepCommander));
            if(checkCreepAllBoosted(creepCommander) == false) {autoBoost(creepCommander); return;}
            if(checkCreepAllBoosted(creepPilot) == false) {autoBoost(creepPilot); return;}
            if(checkCreepAllBoosted(creepSpecialist) == false) {autoBoost(creepSpecialist); return;}
            if(checkCreepAllBoosted(creepEngineer) == false) {autoBoost(creepEngineer); return;}
            if(!cache[creepCommander.id]) cache[creepCommander.id]={}
            if(cache[creepCommander.id].path===undefined) cache[creepCommander.id].path=[];
            if(!creepCommander.memory.standby) creepStandby(creepCommander, creepPilot, creepSpecialist, creepEngineer, flagStandbyName);
            else creepAttack(creepCommander, creepPilot, creepSpecialist, creepEngineer, flagName, flagAttackName);
        }
        else{
            if(!creepCommander){
                autoSpawnCreep(creepCommanderName, roomName, body);
            }
            if(!creepPilot){
                autoSpawnCreep(creepPilotName, roomName, body);
            }
            if(!creepSpecialist){
                autoSpawnCreep(creepSpecialistName, roomName, body);
            }
            if(!creepEngineer){
                autoSpawnCreep(creepEngineerName, roomName, body);
            }
        }
    }
}

function creepMove([creepCommander, creepPilot, creepSpecialist, creepEngineer]){
    cache[creepCommander.id].path.forEach((it)=>{
        creepCommander.room.visual.circle(it, {fill: 'green', radius: 0.18, stroke: 'white'});
    })
    let pos = cache[creepCommander.id].path[0];
    let dir = creepCommander.pos.getDirectionTo(pos);
    if(creepCommander.fatigue == 0 && creepPilot.fatigue == 0 && creepSpecialist.fatigue == 0 && creepEngineer.fatigue == 0){
        // console.log(JSON.stringify(cache[creepCommander.id].path)); // debug
        creepCommander.move(dir);
        creepPilot.move(dir);
        creepSpecialist.move(dir);
        creepEngineer.move(dir);
        cache[creepCommander.id].path.splice(0,1);
    }
}

/*
 * 先去空闲位置，再整队
 */

function creepStandby(creepCommander, creepPilot, creepSpecialist, creepEngineer, flagName){
    creepCommander.say("STANDBY");
    let flag = Game.flags[flagName];
    if(flag == undefined){ console.log("ERR: flag " + flagName + " not found"); return; }
    creepCommander.heal(creepCommander);
    creepPilot.heal(creepPilot);
    creepSpecialist.heal(creepSpecialist);
    creepEngineer.heal(creepEngineer);
    creepCommander.rangedMassAttack();
    creepPilot.rangedMassAttack();
    creepSpecialist.rangedMassAttack();
    creepEngineer.rangedMassAttack();
    if(!creepCommander.pos.isEqualTo(flag)) creepCommander.moveTo(flag);
    else creepCommander.memory.ready=true;
    if(!creepPilot.memory.ready && !creepPilot.pos.isNearTo(flag)) creepPilot.moveTo(flag,{range:1});
    else creepPilot.memory.ready=true;
    if(!creepSpecialist.memory.ready && !creepSpecialist.pos.isNearTo(flag)) creepSpecialist.moveTo(flag,{range:1});
    else creepSpecialist.memory.ready=true;
    if(!creepEngineer.memory.ready && !creepEngineer.pos.isNearTo(flag)) creepEngineer.moveTo(flag,{range:1});
    else creepEngineer.memory.ready=true;
    
    if(creepCommander.pos.isEqualTo(flag)){
        if(checkPos(creepCommander, creepPilot, creepSpecialist, creepEngineer)) // 整队
            creepCommander.memory.standby = true; // 整好了
    }

}

function creepAttack(creepCommander, creepPilot, creepSpecialist, creepEngineer, flagName, flagAttackName){
    if(!creepCommander.pos.isNearBorder && !checkPos(creepCommander, creepPilot, creepSpecialist, creepEngineer)){
        console.log('WARNING: Team scattered');
        return;
    }
    let flag = Game.flags[flagName];
    if(flag == undefined){ console.log("ERR: flag " + flagName + " not found"); return; }
    creepHeal(creepCommander, creepPilot, creepSpecialist, creepEngineer);
    let attackFlag = Game.flags[flagAttackName];
    if(creepCommander.pos.inRangeTo(attackFlag, 3)){
        let targets = creepCommander.room.lookForAt(LOOK_STRUCTURES, attackFlag);
        if(targets.length > 0){
            creepCommander.rangedAttack(targets[0]);
            creepPilot.rangedAttack(targets[0]);
            creepSpecialist.rangedAttack(targets[0]);
            creepEngineer.rangedAttack(targets[0]);
        }
    }else{
        creepCommander.rangedMassAttack();
        creepPilot.rangedMassAttack();
        creepSpecialist.rangedMassAttack();
        creepEngineer.rangedMassAttack();
    }
    if(cache[creepCommander.id].path.length && !creepCommander.pos.isNearBorder){ // 如果有已经寻好的路，就按照路走
        creepMove(arguments);
    } else{ // 四人队寻路
        let goals = [{pos:Game.flags[flagName].pos,range:1}];
        let ret = PathFinder.search(creepCommander.pos, goals,
            {
                plainCost: 1,
                swampCost: 5,
                roomCallback: function (roomName) {
                    let room = Game.rooms[roomName];
                    if (!room) return;
                    let costs = new PathFinder.CostMatrix;
                    let terrain = new Room.Terrain(roomName);
                    for (let i = 0; i < 50; i++) {
                        for (let j = 0; j < 50; j++) {
                            if (terrain.get(i, j) == TERRAIN_MASK_WALL) {
                                costs.set(i, j, 0xff);
                                costs.set(i - 1, j, 0xff);
                                costs.set(i, j - 1, 0xff);
                                costs.set(i - 1, j - 1, 0xff);
                            }
                        }
                    }

                    room.find(FIND_EXIT).forEach(function (exit) {
                        costs.set(exit.x, exit.y, 50);
                    });

                    for (let x = 0; x < 50; x++) {
                        for (let y = 0; y < 50; y++) {
                            if(costs.get(x, y)) room.visual.text(costs.get(x, y), x, y, { color: 'white', font: 0.5});
                        }
                    }
                    
                    room.find(FIND_STRUCTURES).forEach(function (struct) {
                        if (struct.structureType === STRUCTURE_ROAD) {
                            costs.set(struct.pos.x, struct.pos.y, 1);
                        } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                            (struct.structureType !== STRUCTURE_RAMPART ||
                                !struct.my)) {
                            costs.set(struct.pos.x, struct.pos.y, 0xff);
                            costs.set(struct.pos.x, struct.pos.y, 0xff);
                            costs.set(struct.pos.x - 1, struct.pos.y, 0xff);
                            costs.set(struct.pos.x, struct.pos.y - 1, 0xff);
                            costs.set(struct.pos.x - 1, struct.pos.y - 1, 0xff);
                        } else {
                            costs.set(struct.pos.x, struct.pos.y, 0xff);
                            costs.set(struct.pos.x, struct.pos.y, 0xff);
                            costs.set(struct.pos.x - 1, struct.pos.y, 0xff);
                            costs.set(struct.pos.x, struct.pos.y - 1, 0xff);
                            costs.set(struct.pos.x - 1, struct.pos.y - 1, 0xff);
                        }
                    });

                    room.find(FIND_CREEPS).forEach(function (creep) {
                        if(creep.name != creepCommander.name
                            && creep.name != creepPilot.name
                            && creep.name != creepSpecialist.name
                            && creep.name != creepEngineer.name
                        ) // 小队成员以外的所有creep设为不可行走，防止解体
                            costs.set(creep.pos.x, creep.pos.y, 0xff);
                    });
                    
                    for(let i = 0; i < 50; i ++){
                        for(let j = 0; j < 50; j ++){
                            new RoomVisual(roomName).text(costs.get(i, j), i, j, {color: '#ffffff'});
                        }
                    }
                    
                    
                    return costs;
                },
            }
        );
        
        cache[creepCommander.id].path=ret.path.slice(0,squadMoveCache-1);
        creepMove(arguments);
    }

}

function checkPos(creepCommander, creepPilot, creepSpecialist, creepEngineer){
    if(creepCommander && creepPilot && creepSpecialist && creepEngineer){
        if(creepCommander.room.name == creepPilot.room.name
            && creepCommander.room.name == creepSpecialist.room.name
            && creepCommander.room.name == creepEngineer.room.name
        ){
            creepPilot.moveTo(creepCommander.pos.x + 1, creepCommander.pos.y);
            creepSpecialist.moveTo(creepCommander.pos.x + 1, creepCommander.pos.y + 1);
            creepEngineer.moveTo(creepCommander.pos.x, creepCommander.pos.y + 1);
            if(creepPilot.pos.x == creepCommander.pos.x + 1 && creepPilot.pos.y == creepCommander.pos.y
                && creepSpecialist.pos.x == creepCommander.pos.x + 1 && creepSpecialist.pos.y == creepCommander.pos.y + 1
                && creepEngineer.pos.x == creepCommander.pos.x && creepEngineer.pos.y == creepCommander.pos.y + 1
            ){
                return true;
            }
        }
    }
    return false;
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

function getCreepHealBody(creep){
    let cnt = 0;
    for(let i in creep.body){
        if(creep.body[i].type == HEAL){
            cnt ++;
        }
    }
    return cnt;
}
function creepHeal(creepCommander, creepPilot, creepSpecialist, creepEngineer){
    callHeal(creepCommander, creepCommander, creepPilot, creepSpecialist, creepEngineer);
    callHeal(creepPilot, creepCommander, creepPilot, creepSpecialist, creepEngineer);
    callHeal(creepSpecialist, creepCommander, creepPilot, creepSpecialist, creepEngineer);
    callHeal(creepEngineer, creepCommander, creepPilot, creepSpecialist, creepEngineer);
    /*
    if(creepCommander.hits < creepCommander.hitsMax) creepCommander.heal(creepCommander);
    else creepCommander.heal(findHealTarget(creepCommander, creepPilot, creepSpecialist, creepEngineer));
    if(creepPilot.hits < creepPilot.hitsMax) creepPilot.heal(creepPilot);
    else creepPilot.heal(findHealTarget(creepPilot, creepCommander, creepSpecialist, creepEngineer));
    if(creepSpecialist.hits < creepSpecialist.hitsMax) creepSpecialist.heal(creepSpecialist);
    else creepSpecialist.heal(findHealTarget(creepSpecialist, creepCommander, creepPilot, creepEngineer));
    if(creepEngineer.hits < creepEngineer.hitsMax) creepEngineer.heal(creepEngineer);
    else creepEngineer.heal(findHealTarget(creepEngineer, creepCommander, creepPilot, creepSpecialist));
    */
}

function callHeal(callCreep, creepCommander, creepPilot, creepSpecialist, creepEngineer){
    callCreep.heal(callCreep);
    if(callCreep.hits < callCreep.hitsMax && getCreepHealBody(callCreep) * 12 * 3 <= callCreep.hitsMax - callCreep.hits){
        let callNum = (callCreep.hitsMax - (callCreep.hits + (getCreepHealBody(callCreep) * 12 * 3)) )/ getCreepHealBody(callCreep);
        if(callNum == 1){
            if((creepCommander.hits + getCreepHealBody(creepCommander) * 12 * 3) >= creepCommander.hitsMax){
                creepCommander.heal(callCreep);
                return;
            }
            if((creepPilot.hits + getCreepHealBody(creepPilot) * 12 * 3) >= creepPilot.hitsMax){
                creepPilot.heal(callCreep);
                return;
            }
            if((creepSpecialist.hits + getCreepHealBody(creepSpecialist) * 12 * 3) >= creepSpecialist.hitsMax){
                creepSpecialist.heal(callCreep);
                return;
            }
            if((creepEngineer.hits + getCreepHealBody(creepEngineer) * 12 * 3) >= creepEngineer.hitsMax){
                creepEngineer.heal(callCreep);
                return;
            }
        }
        else if(callNum == 2){
            let curCallNum = 0;
            if((creepCommander.hits + getCreepHealBody(creepCommander) * 12 * 3) >= creepCommander.hitsMax && curCallNum < callNum){
                creepCommander.heal(callCreep);
                curCallNum ++;
            }
            if((creepPilot.hits + getCreepHealBody(creepPilot) * 12 * 3) >= creepPilot.hitsMax && curCallNum < callNum){
                creepPilot.heal(callCreep);
                curCallNum ++;
            }
            if((creepSpecialist.hits + getCreepHealBody(creepSpecialist) * 12 * 3) >= creepSpecialist.hitsMax && curCallNum < callNum){
                creepSpecialist.heal(callCreep);
                curCallNum ++;
            }
            if((creepEngineer.hits + getCreepHealBody(creepEngineer) * 12 * 3) >= creepEngineer.hitsMax && curCallNum < callNum){
                creepEngineer.heal(callCreep);
                curCallNum ++;
            }
        }
        else{
            if((creepCommander.hits + getCreepHealBody(creepCommander) * 12 * 3) >= creepCommander.hitsMax && curCallNum < callNum){
                creepCommander.heal(callCreep);
            }
            if((creepPilot.hits + getCreepHealBody(creepPilot) * 12 * 3) >= creepPilot.hitsMax && curCallNum < callNum){
                creepPilot.heal(callCreep);
            }
            if((creepSpecialist.hits + getCreepHealBody(creepSpecialist) * 12 * 3) >= creepSpecialist.hitsMax && curCallNum < callNum){
                creepSpecialist.heal(callCreep);
            }
            if((creepEngineer.hits + getCreepHealBody(creepEngineer) * 12 * 3) >= creepEngineer.hitsMax && curCallNum < callNum){
                creepEngineer.heal(callCreep);
            }
        }
    }
}

function findHealTarget(creepCommander, creepPilot, creepSpecialist, creepEngineer){
    if(creepCommander.hits < creepPilot.hits && creepCommander.hits < creepSpecialist.hits && creepCommander.hits < creepEngineer.hits){
        return creepCommander;
    }
    if(creepPilot.hits < creepCommander.hits && creepPilot.hits < creepSpecialist.hits && creepPilot.hits < creepEngineer.hits){
        return creepPilot;
    }
    if(creepSpecialist.hits < creepCommander.hits && creepSpecialist.hits < creepPilot.hits && creepSpecialist.hits < creepEngineer.hits){
        return creepSpecialist;
    }
    if(creepEngineer.hits < creepCommander.hits && creepEngineer.hits < creepPilot.hits && creepEngineer.hits < creepSpecialist.hits){
        return creepEngineer;
    }
    return null;
}
