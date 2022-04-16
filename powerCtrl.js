
module.exports = {
    run:function(roomName){
        var room = Game.rooms[roomName]
        if(room.controller.level < 8) return;
        var powerSpawn = room.find(FIND_STRUCTURES,{filter:o=>(o.structureType == STRUCTURE_POWER_SPAWN)})
        if(powerSpawn.length)powerSpawn = powerSpawn[0];
        else return
        if(powerSpawn.store[RESOURCE_POWER]){
            powerSpawn.processPower()
        }
        powerUsd(roomName,powerSpawn)
        //powerObserve(roomName)
        //var powerBank = Memory.powerBank;
        /*
        if(powerBank){
            //harvestPower(powerBank,roomName)
        }
        */
    }
}

function powerUsd(roomName,powerSpawn){
    var creepName = 'powerFiller_'+roomName
    const room = Game.rooms[roomName]
    var creep = Game.creeps[creepName]
    var withdrawTarget = havePower(room)
    if(withdrawTarget){
        if(creep){
            if(creep.ticksToLive < 40){
                creep.transfer(withdrawTarget, RESOURCE_POWER);
                creep.moveTo(withdrawTarget);
                if(creep.store.getUsedCapacity() == 0) creep.suicide();
                return;
            }
            if(creep.store[RESOURCE_POWER] == 0){
                if(creep.pos.isNearTo(withdrawTarget)){
                    creep.withdraw(withdrawTarget,RESOURCE_POWER)
                }else{
                    creep.moveTo(withdrawTarget,{range:1})
                }
            }else{
                if(creep.pos.isNearTo(powerSpawn)){
                    if(powerSpawn.store[RESOURCE_POWER] <= 50){
                        creep.transfer(powerSpawn,RESOURCE_POWER)
                    }
                }else{
                    creep.moveTo(powerSpawn,{range:1})
                }
            }
            
        }else{
            var spawn = getAvaliableSpawn(roomName)
            if(spawn && room.storage.store.energy >= 100000) spawn.spawnCreep([CARRY,MOVE],creepName)
        }
    }
}

function havePower(room){
    const storage = room.storage;
    const terminal = room.terminal;
    const creep = Game.creeps['powerTMP_'+room.name]
    if(terminal && terminal.store[RESOURCE_POWER] > 0){
        return terminal
    }
    if(storage && storage.store[RESOURCE_POWER] > 0){
        return storage
    }
    if(creep && creep.store.power > 0){
        return creep
    }
}
function getAvaliableSpawn(roomName){
    for (var spawnname in Game.spawns){
        var spawn = Game.spawns[spawnname]
        if(spawn.room.name == roomName && spawn.spawning == null){
            return spawn
        }
    }
    return null;
}