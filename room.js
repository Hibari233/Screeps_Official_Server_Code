var drone = require('drone');
var control = require('upgrader');
var builder = require('builder');
var manager = require('manager');
const roomDefense = require('roomDefense');
const CostMatrix = require('CostMatrix');
const scout = require('scout');
const otp = require('outpost_defender');
const rb = require('Room.builder');
require('tower.prototype');
const warBoost = require('warBoost');
require('optimize');
const transporter = require('transporter');
require('source.prototype');

module.exports = {
    run: function(roomName) {
        const room = Game.rooms[roomName];
        let rd = new roomDefense(Game.rooms[roomName]);
        const towers = Game.rooms[roomName].find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_TOWER
        });
        for(let tower of towers) {
            try{
                tower.run(rd);
            } catch(e) {
                console.log(e.stack);
            }
        }
        let droneNum, controlNum;
        let level = Game.rooms[roomName].controller.level;
        if(level <= 4) droneNum = 2, controlNum = 5;
        if(level >= 4 && level <= 6 && room.storage) droneNum = 2, controlNum = 3;
        if(level >= 4 && level <= 6 && room.storage && room.terminal) droneNum = 1, controlNum = 3;
        if(level >= 7) droneNum = 1, controlNum = 3;
        if(level == 8) droneNum = 1, controlNum = 1;
        let sources = Game.rooms[roomName].find(FIND_SOURCES);
        for(let i in sources){
            let num = 0;
            if(level <= 4) num = sources[i].getAvaliablePosition() * droneNum;
            else num = droneNum;
            drone.run(roomName, sources[i].id, num);
        }
        control.run(roomName, controlNum);
        builder.run(roomName);
        if(level >= 4 && room.storage) manager.run(roomName);
    }
}

