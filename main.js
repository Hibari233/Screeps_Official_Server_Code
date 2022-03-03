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
//require('optimize');

module.exports.loop = function () {
    Game.cpu.generatePixel();
    for(const name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name]
        }
    }
    //CostMatrix.run('W37S51');
    

    let rd = new roomDefense(Game.rooms['W37S51']);
    const towers = Game.rooms['W37S51'].find(FIND_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_TOWER
    });
    for(let tower of towers) {
        try{
            tower.run(rd);
        } catch(e) {
            console.log(e.stack);
        }
    }

    try{
        warBoost.run('W37S51');
    } catch(e) {
        console.log(e.stack);
    }
    
    //scout.run('W38S48', 'W37S51');
    /*
    scout.run('W33S52', 'W37S51');
    otp.run('W33S52', 'W37S51', 1);
    scout.run('W33S49', 'W37S51');
    otp.run('W33S49', 'W37S51', 1);
    scout.run('W33S52', 'W37S51');
    otp.run('W33S52', 'W37S51');
    scout.run('W36S49', 'W37S51');
    
    otp.run('W36S49', 'W37S51', 1);
    */
    
    drone.run('W37S51', '59bbc43b2052a716c3ce7980', 1);
    drone.run('W37S51', '59bbc43b2052a716c3ce7982', 1);
    control.run('W37S51', 1);
    builder.run('W37S51');
    manager.run('W37S51');
    

    /*
    Creep.prototype.isHealthy = function() {
        if(this.ticksToLive <= 10) return false;
        else return true;
    }

    Creep.prototype.isFull = function() {
        if(this.store.getUsedCapacity() == this.store.getCapacity()) return true;
        else return false;
    }

    Spawn.prototype.work = function() {}
    Spawn.prototype.addTask = function(taskName) {}
    Spawn.prototype.mainSpawn = function(taskName) {}
    */
}