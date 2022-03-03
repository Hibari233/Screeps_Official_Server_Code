const body = [MOVE];


module.exports = {
    run: function (roomName, spawnRoomName) {
        const creepName = 'scout_' + roomName;
        var creep = Game.creeps[creepName];
        if (!creep) {
            autoSpawnCreep(creepName, spawnRoomName);
        }
        else {
            if(!creep.pos.inRangeTo(new RoomPosition(25, 25, roomName),20)) creep.moveTo(new RoomPosition(25, 25, roomName));
            else {
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