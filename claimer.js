const body = [CLAIM, MOVE];


module.exports = {
    run: function (roomName, spawnRoomName) {
        const creepName = 'claimer_' + roomName;
        var creep = Game.creeps[creepName];
        if (!creep) {
            autoSpawnCreep(creepName, spawnRoomName);
        }
        else {
            if(!creep.pos.inRangeTo(new RoomPosition(25, 25, roomName),23)) creep.moveTo(new RoomPosition(25, 25, roomName));
            else {
                if(creep.room.controller) {
                    creep.signController(creep.room.controller, "🐦 Warning: fully automated murder base 🐦")
                    if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                    }
                }
                var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
                var PC_hostiles = Game.rooms[roomName].find(FIND_HOSTILE_POWER_CREEPS);
                if(hostiles.length != 0 || PC_hostiles.length != 0) {
                    if(!Game.time % 5) console.log('Incoming Enemies in Room: ' + roomName + ' Please Watch Out Room: ' + spawnRoomName);
                }
            }
        }
    }
}

function autoSpawnCreep(creepName, spawnRoomName) {
    var spawn = getAvaliableSpawn(spawnRoomName);
    if (spawn) {
        spawn.spawnCreep(body, creepName, {memory: {role: 'scout' }});
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