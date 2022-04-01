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
const defend = require('defend');
const attacker4 = require('attacker4');
const attacker42w2h = require('attacker42w2h');
const terminalCtrl = require('terminalCtrl');

module.exports.loop = function () {
    if(Game.cpu.bucket > 9000) Game.cpu.generatePixel();
    for(const name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name]
        }
    }
    //CostMatrix.run('W37S51');
    /*
    const amountToBuy = 3000, maxTransferEnergyCost = 0xffffffff;
    const orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: RESOURCE_POWER});

    for(let i=0; i<orders.length; i++) {
        if(orders[i].price <= 70) Game.market.deal(orders[i].id, amountToBuy, "W37S51");
    }
    */
    

    try{
        //labCtrl.run('W37S51', 'XZHO2', 5000);
        //terminalCtrl.run('W31S49');
        terminalCtrl.run('W37S51');
        warBoost.run('W37S51');
        defend.run();
    } catch(e) {
        console.log(e.stack);
    }
    //attacker42w2h.run('t2', 't1', 't3', 'ASOUL-Ava', 'W37S51', 0);
    //attacker4.run('attackpos', 'standby', 'attacktarget', 'ASOUL-Diana', 'W37S51', 0);
    //attacker1.run('g1', 'SECTOR_SECURE', 'W37S51', 1);
    //defenceBuilder.run('W37S51', 'W37S51', 0, 10000000);
    //attacker2.run('s1', 'SECTOR_CLEAN', 'W37S51');
    //otp.run('W37S52', 'W37S51', 1);
    transporter.run(Game.rooms['W31S49'].storage.id, Game.rooms['W31S49'].terminal.id, 'transferEnergyToStorageW31S49', 'W31S49', 'W31S49', 1, RESOURCE_ENERGY, 50);
    transporter.run(Game.rooms['W36S53'].storage.id, Game.rooms['W36S53'].terminal.id, 'transferEnergyToStorageW36S53', 'W36S53', 'W36S53', 1, RESOURCE_ENERGY, 50);

    if(Game.rooms['W37S51'].terminal.store.energy >= 1000) transporter.run(Game.rooms['W36S53'].storage.id, Game.rooms['W37S51'].storage.id, 'transferEnergyToSlave2', 'W36S53', 'W37S51', 0, RESOURCE_ENERGY, 500);    
    transporter.run('61fa55f45ef26bacdd7ed8f5', '620292b284f90ee0941068ea', 'tranferEnergyToZf', 'W36S51', 'W37S51', 0, 'X');
    transporter.run('620292b284f90ee0941068ea', '5f561042b21b240adf05c22f', 'getEnergy', 'W37S54', 'W37S51', 0, 'ALL');
    transporter.run('620292b284f90ee0941068ea', '5f569fc16eb3cc4c476755de', 'getEnergy2', 'W37S58', 'W37S51', 0, 'ALL');
    transporter.run('620292b284f90ee0941068ea', '5b42950c735ab765b39a418f', 'THANK_YOU', 'W32S49', 'W37S51', 0, 'EXCEPT_ENERGY');
    transporter.run(Game.rooms['W37S51'].storage.id, Game.rooms['W37S51'].terminal.id, 'transferW37S51', 'W37S51', 'W37S51', 0, 'ALL', 50);
    //transporter.run('621cd64d6d47665288bd7420', Game.rooms['W37S51'].terminal.id, 'FillPowerSpawn', 'W37S51', 'W37S51', 1, RESOURCE_POWER, 100);
    //transporter.run('620292b284f90ee0941068ea', '623580d60c756c1699fbf2d9', 'TransferT3ToZf', 'W37S51', 'W37S51', 1, RESOURCE_ENERGY, 100);
    //transporter.run('622cf203d76086b5edb4f3fb', '5b42950c735ab765b39a418f', 'TransferEnergyToStorage2', 'W32S49', 'W31S49', 5, RESOURCE_ENERGY, 300);
    Game.getObjectById('621cd64d6d47665288bd7420').processPower();
    
    //scout.run('W31S58', 'W36S53');
    //transporter.run('621ce16edb77d4087939baf9', '620292b284f90ee0941068ea', 'FillNuker', 'W37S51', 'W37S51', 1, RESOURCE_GHODIUM);
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
    //remoteBuilder.run('W36S53', 'W37S51');
    //remoteBuilder.run('W31S49', 'W37S51');

    /*
    Creep.prototype.isHealthy = function() {
        if(this.ticksToLive <= 10) return false;
        else return true;
    }

    Creep.prototype.isFull = function() {
        if(this.store.getUsedCapacity() == this.store.getCapacity()) return true;
        else return false;
    }

    Creep.prototype.isAllBoosted = function() {
        for(let i in this.body) {
            if(this.body[i].boost == undefined) return false;
        }
        return true;
    }

    Spawn.prototype.work = function() {}
    Spawn.prototype.addTask = function(taskName) {}
    Spawn.prototype.mainSpawn = function(taskName) {}
    */
}