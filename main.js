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
const labCtrl = require('labCtrl');
require('optimize');
const transporter = require('transporter');
const attacker1 = require('attacker1');
const attacker2 = require('attacker2');
const room = require('room');
const claimer = require('claimer');
const remoteBuilder = require('remoteBuilder');
const defenceBuilder = require('defenceBuilder');
require('source.prototype');

module.exports.loop = function () {
    if(Game.cpu.bucket > 9000) Game.cpu.generatePixel();
    for(const name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name]
        }
    }
    //CostMatrix.run('W37S51');
    
    const amountToBuy = 3000, maxTransferEnergyCost = 0xffffffff;
    const orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: RESOURCE_POWER});

    for(let i=0; i<orders.length; i++) {
        if(orders[i].price <= 70) Game.market.deal(orders[i].id, amountToBuy, "W37S51");
    }
    

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
        //labCtrl.run('W37S51', 'XUH2O', 5000);
        //warBoost.run('W37S51');
    } catch(e) {
        console.log(e.stack);
    }
    attacker1.run('t1', 'FRIENDLY_COMMUNICATE', 'W37S51', 0);
    defenceBuilder.run('W37S51', 'W37S51', 5, 10000000);
    //attacker2.run('t1', 'SECTOR_CLEAN', 'W37S51');
    //otp.run('W37S52', 'W37S51', 1);
    ob = Game.getObjectById('621cd822ffd8a15ec440e49f');
    ob.observeRoom('W32S49');
    transporter.run('61fa55f45ef26bacdd7ed8f5', '620292b284f90ee0941068ea', 'tranferEnergyToZf', 'W36S51', 'W37S51', 0, 'X');
    transporter.run('620292b284f90ee0941068ea', '5f561042b21b240adf05c22f', 'getEnergy', 'W37S54', 'W37S51', 0, 'ALL');
    transporter.run('620292b284f90ee0941068ea', '5f569fc16eb3cc4c476755de', 'getEnergy2', 'W37S58', 'W37S51', 0, 'ALL');
    transporter.run('620292b284f90ee0941068ea', '5b42950c735ab765b39a418f', 'THANK_YOU', 'W32S49', 'W37S51', 0, 'EXCEPT_ENERGY');
    transporter.run('621cd64d6d47665288bd7420', '621286782029df1bec215ec8', 'FillPowerSpawn', 'W37S51', 'W37S51', 1, RESOURCE_POWER, 100);
    transporter.run('620292b284f90ee0941068ea', '621286782029df1bec215ec8', 'TransferEnergyToStorage', 'W37S51', 'W37S51', 1, RESOURCE_ENERGY, 40);
    Game.getObjectById('621cd64d6d47665288bd7420').processPower();
    //transporter.run('621ce16edb77d4087939baf9', '621286782029df1bec215ec8', 'FillNuker', 'W37S51', 'W37S51', 1, RESOURCE_ENERGY);
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
    room.run('W37S51');
    room.run('W31S49');
    room.run('W36S53');
    remoteBuilder.run('W36S53', 'W37S51');
    remoteBuilder.run('W31S49', 'W37S51');

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