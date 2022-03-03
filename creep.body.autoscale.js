const basic_body = [WORK,CARRY,MOVE];

function autoscale(roomName) {
    const room = Game.rooms[roomName];
    var multiplier = room.energyCapacityAvailable / 200;
    var body = String.concat(body, basic_body);
    for(var i = 0; i < multiplier; i++) {
        body = String.concat(body, basic_body);
    }
    return body;
}