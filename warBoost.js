const STATE_FILL = 0;
const STATE_COMPLETE = 1;
const STATE_CLEAR = 3;

const body = [CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE,];


let room, labs, creep;

module.exports = {
    run: function (roomName) {
        room = Game.rooms[roomName];
        const creepName = 'WarBoost_Filler_' + roomName;
        creep = Game.creeps[creepName];
        if (!initMemory(roomName)) return;
        var state = Memory.boost[roomName].state;
        labs = new Array();
        let _id = 0;

        Memory.boost[roomName]['labs'].forEach(labid => {
            labs.push(Game.getObjectById(labid))
            new RoomVisual(roomName).text(_id, labs[_id].pos, {color: 'white', font: 0.5 })//如不需要绘制编号，这句也可以删了
            _id++;
        });
        // STATE_FILL 为填空lab当且仅当lab全空或lab内矿物类型正确
        // STATE_CLEAR 为清空lab
        // STATE_COMPLETE 为所有lab填空完毕并且矿物类型正确
        let isClear = checkLabClear(roomName);
        let isFull = checkLabFull(roomName);
        let isStatus = checkLabStatus(roomName);
        if(Game.time % 3 == 0){
            if(((isStatus == true && isFull == false) || isClear == true)) state = STATE_FILL;
            else if(isStatus == true && isFull == true && isClear == false) state = STATE_COMPLETE;
            else state = STATE_CLEAR;
        }
        
        Memory.boost[roomName].state = state;

        // Run state
        if(state == STATE_FILL){
            if(!creep) {
                autoSpawnCreep(creepName);
            }
            else {
                for(let i = 0; i < labs.length; i ++){
                    let withdrawTarget;
                    let type = Memory.boost[roomName].material[i];
                    let amount = labs[i].store.getCapacity(type);
                    if(labs[i].store[type] < labs[i].store.getCapacity(type)){
                        if(room.storage.store[type]) withdrawTarget = room.storage;
                        else if (room.terminal.store[type]) withdrawTarget = room.terminal;
                        else if(creep.store[type] > 0) withdrawTarget = null;
                        else {
                            if(Game.time % 20 == 0) console.log('Room ' + roomName + ' has no storage or terminal to withdraw ' + type);
                            continue;
                        }
                        if(labs[i].store[type]) amount -= labs[i].store[type];
                        if(creep.store[type] >= amount) withdrawTarget = null;
                        console.log(type);
                        if(amount > 0) {WAT(creep, withdrawTarget, labs[i], type, amount); break;}
                    }
                }
            }
        }

        if(state == STATE_CLEAR) {
            if(!creep) {
                autoSpawnCreep(creepName);
            }
            else {
                for(let i = 0; i < labs.length; i ++) {
                    if(labs[i].mineralType){
                        //console.log(labs[i].mineralType);
                        WAT(creep, labs[i], room.terminal, labs[i].mineralType, 3000);
                    }
                }
                if(isClear == true) WAT(creep, null, room.terminal, null, null);
            }
        }

    }
}

function checkLabFull(roomName) {
    var labs = Memory.boost[roomName]['labs'];
    var allfull = true;
    labs.forEach(lab => {
        if (Game.getObjectById(lab).mineralAmount < Game.getObjectById(lab).mineralCapacity) {
            allfull = false;
        }
    }
    );
    return allfull;
}
function checkLabStatus(roomName) {
    var labs = Memory.boost[roomName]['labs'];
    var typecorrect = true;
    for(let i = 0; i < labs.length; i ++){
        if(labs[i].mineralType != Memory.boost[roomName].material[i] && labs[i].mineralType != undefined){
            typecorrect = false;
        }
    }
    return typecorrect;
}

function checkLabClear(roomName){
    var labs = Memory.boost[roomName]['labs'];
    var allclear = true;
    for(let i = 0; i < labs.length; i ++){
        //console.log(labs[i] + " : " + labs[i].mineralType);
        if(Game.getObjectById(labs[i]).mineralType != undefined){
            allclear = false;
        }
    }
    return allclear;
}

function initMemory(roomName) {
    if (!Memory.boost) {
        Memory.boost = {}
    }
    if (!Memory.boost[roomName]) {
        Memory.boost[roomName] = {}
    }
    if (Memory.boost[roomName].state === undefined) {
        Memory.boost[roomName].state = STATE_FILL
    }
    if (!Memory.boost[roomName].labs || Game.time % 75 == 0) {
        var labs = room.find(FIND_STRUCTURES, {filter: o => (o.structureType == STRUCTURE_LAB) })
        labs.forEach(lab => {
            lab.value = 0;
            labs.forEach(l => {
                if (lab.pos.inRangeTo(l, 2)) {
                    lab.value++;
                }
            });
        });
        labs.sort((a, b) => (b.value - a.value));
        for (var i = 0; i < labs.length; i++) {
            labs[i] = labs[i].id;
        }
        Memory.boost[roomName].labs = labs;
    }
    if(!Memory.boost[roomName].material || Game.time % 75 == 0){
        let material = new Array();
        let idx = 0;
        for(let i in REACTIONS['X']){
            material[idx] = REACTIONS['X'][i];
            idx ++;
        }
        Memory.boost[roomName].material = material;
        //Memory.boost[roomName].material = REACTIONS['X'];
    }
    if (Memory.boost[roomName].labs.length >= 3) {
        return true;
    } else {
        //console.log('ERROR: Room ' + roomName + ' must have more than 3 labs');
        return false;
    }
}

function getAvaliableSpawn(room) {
    for (var spawnname in Game.spawns) {
        var spawn = Game.spawns[spawnname]
        if (spawn.room.name == room && spawn.spawning == null) {
            return spawn
        }
    }
    return null;
}

function autoSpawnCreep(creepName) {
    var spawn = getAvaliableSpawn(room.name)
    if (spawn) {
        spawn.spawnCreep(body, creepName, {memory: {dontheal: true }})
    }
}

function WAT(creep, withdrawTarget, transferTarget, type, amount) {
    //console.log(withdrawTarget + ' ' + transferTarget + ' ' + type + ' ' + amount);
    if (_.sum(creep.store) && creep.store[type] != _.sum(creep.store)) {
        //console.log(type);
        //console.log(creep.store[type]);
        //console.log(creep.store[RESOURCE_CATALYZED_GHODIUM_ALKALIDE])
        creep.moveTo(creep.room.storage)
        if (creep.pos.isNearTo(creep.room.storage)) {
            for (var resourceType in creep.store) {
                if (resourceType != type) {
                    creep.transfer(creep.room.storage, resourceType)
                }
            }
        }
        return;
    }
    amount = Math.min(amount, creep.store.getFreeCapacity(type));
    if (_.sum(creep.store) == 0 && withdrawTarget) {
        amount = Math.min(amount, withdrawTarget.store[type]);
        creep.moveTo(withdrawTarget)
        if (creep.pos.isNearTo(withdrawTarget)) {
            creep.withdraw(withdrawTarget, type, amount)
        }
    } else {
        if (withdrawTarget && creep.store[type] < amount && creep.store.getFreeCapacity(type) > 0 && withdrawTarget.store[type] > 0) {
            amount = Math.min(amount, creep.store.getFreeCapacity(type), withdrawTarget.store[type]);
            creep.moveTo(withdrawTarget)
            if (creep.pos.isNearTo(withdrawTarget)) {
                creep.withdraw(withdrawTarget, type, amount)
            }
        } else {
            creep.moveTo(transferTarget)
            if (creep.pos.isNearTo(transferTarget)) {
                creep.transfer(transferTarget, type)
            }
        }
    }
}