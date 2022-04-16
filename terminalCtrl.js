
const resource_list = ["H","O","U","L","K","Z","X"];
module.exports = {
    run: function(roomName) {
        let room = Game.rooms[roomName];
        if(room.terminal){
            if(room.controller.level < 8) return;
            let terminal = room.terminal;
            if(terminal.store.energy < 20000){
                console.log(roomName + ' is buying energy');
                let orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: RESOURCE_ENERGY});
                for(let i=0; i<orders.length; i++) {
                    let transferEnergyCost = Game.market.calcTransactionCost(terminal.store.energy, roomName, orders[i].roomName);
                    if(orders[i].price <= 4 && transferEnergyCost <= terminal.store.energy) Game.market.deal(orders[i].id, terminal.store.energy, roomName);
                }
            }
            else if(terminal.store[RESOURCE_POWER] < 2000){
                console.log(roomName + ' is buying power');
                let orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: RESOURCE_POWER});
                for(let i=0; i<orders.length; i++) {
                    if(orders[i].price <= 70) Game.market.deal(orders[i].id, 2000, roomName);
                }
            }
            else{
                for(let i in REACTIONS['X']){
                    t3 = REACTIONS['X'][i];
                    if(terminal.store[t3] <= 20000){
                        console.log(roomName + ' is buying ' + t3);
                        let orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: t3});
                        for(let j=0; j<orders.length; j++) {
                            if(orders[j].price <= 30) Game.market.deal(orders[j].id, 10000, roomName);
                        }
                    }
                }
                for(let i in resource_list){
                    resource = resource_list[i];
                    if(terminal.store[resource] < 3000){
                        console.log(roomName + ' is buying ' + resource);
                        let orders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: resource});
                        for(let j=0; j<orders.length; j++) {
                            //console.log(orders[j].id);
                            if(orders[j].price <= 2) Game.market.deal(orders[j].id, 3000, roomName);
                        }
                    }
                }
            }
            
        }
    }
}

