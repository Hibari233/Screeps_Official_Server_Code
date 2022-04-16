
module.exports = {
    run: function(roomName) {
        let room = Game.rooms[roomName];
        if(room.controller.level >= 6 && room.storage){
            let sourceLinks = new Array();
            let sources = Game.rooms[roomName].find(FIND_SOURCES);
            let sourcesNum = sources.length;
            for(let i in sources){
                let link = sources[i].pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_LINK
                });
                if(link && link.pos.inRangeTo(sources[i].pos, 2)) sourceLinks.push(link);
            }
            let centerLink = room.find(FIND_STRUCTURES, {
                filter: (s) => {
                    return s.structureType == STRUCTURE_LINK && s.pos.inRangeTo(room.storage.pos, 2);
                }
            });
            if(centerLink[0] && centerLink[0].store.energy < centerLink[0].energyCapacity){
                for(let i = 0; i < sourcesNum; i ++) {
                    if(sourceLinks[i]){
                        if(sourceLinks[i] && sourceLinks[i].store.energy == 800) sourceLinks[i].transferEnergy(centerLink[0]);
                        //console.log('transfering energy from ' + sourceLinks[i] + ' to ' + centerLink[0]);
                    }
                }
            }
        }
    }
}

