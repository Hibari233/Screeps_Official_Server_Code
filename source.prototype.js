let cache={};
Source.prototype.getAvaliablePosition = function() {
    if(cache[this.id]) return cache[this.id];
    let pos = this.pos;
    let x = pos.x;
    let y = pos.y;
    let room = this.room;
    let count = 0;
    const terrain = new Room.Terrain(room.name);
    for(let i = x - 1; i <= x + 1; i ++){
        for(let j = y - 1; j <= y + 1; j ++){
            if(i == x && j == y) continue;
            if(terrain.get(i, j) != TERRAIN_MASK_WALL){
                count ++;
            }
        }
    }
    cache[this.id]=count;
    return count;
}