module.exports = {
    run: function(roomName) {
        let costs = new PathFinder.CostMatrix;
        
        const terrain = new Room.Terrain(roomName);
        
        for (let i = 0; i < 50; i ++) {
            for(let j = 0; j < 50; j ++){
                if(terrain.get(i, j) == TERRAIN_MASK_WALL){
                    costs.set(i, j, 0xff);
                    costs.set(i + 1, j, 0xff);
                    costs.set(i - 1, j, 0xff);
                    costs.set(i, j + 1, 0xff);
                    costs.set(i, j - 1, 0xff);
                    costs.set(i + 1, j + 1, 0xff);
                    costs.set(i - 1, j + 1, 0xff);
                    costs.set(i + 1, j - 1, 0xff);
                    costs.set(i - 1, j - 1, 0xff);
                }
            }
        }
        for(let i = 0; i < 50; i ++){
            for(let j = 0; j < 50; j ++){
                new RoomVisual(roomName).text(costs.get(i, j), i, j, {color: '#ffffff'});
            }
        }
        
    }
}