'use strict';

class RoomBuilder {
    constructor(room) {
        this.room = room;
    }

    getStoragePos(){
        let sp = this.getLayout().storage[0];
        return new RoomPosition(sp[0], sp[1], this.room.name);
    }

    getLayout(rebuild = false){
        if(!this.room.memory.layout || rebuild){
            this.room.memory.layout = this.buildLayout();
        }
        return this.room.memory.layout;
    }

    buildBuildings(){
        let rcl = this.room.controller.level;
        let layout = this.getLayout();
        let limit = CONTROLLER_STRUCTURES;
        let structures = this.room.find(FIND_STRUCTURES);
        let current = {};
        for(let s of structures){
            if(!current[s.structureType]){
                current[s.structureType] = 1;
            }else{
                current[s.structureType] ++;
            }
        }

        for(let type in layout){
            let target = Math.min(limit[type][rcl] || 0, layout[type].length);
            let moreToBuild = Math.max(0, target - (current[type] || 0));
            let i = 0;
            while(moreToBuild > 0 && i < layout[type].length){
                let pos = new RoomPosition(layout[type][i][0], layout[type][i][1], this.room.name);
                if(this.canBuild(pos, type === STRUCTURE_ROAD)){
                    pos.createConstructionSite(type);
                    moreToBuild --;
                }
                i++;
            }
        }
    }

    canBuild(pos, isRoad){
        let site = pos.lookFor(LOOK_CONSTRUCTION_SITES)[0];
        if(site) return false;
        let buildings;
        if(isRoad){
            buildings = _.filter(pos.lookFor(LOOK_STRUCTURES),
                (s) =>s.structureType !== STRUCTURE_RAMPART);
        }else{
            buildings = _.filter(pos.lookFor(LOOK_STRUCTURES),
                (s) => s.structureType !== STRUCTURE_ROAD && s.structureType !== STRUCTURE_RAMPART);
        }

        return buildings.length === 0;

    }


    /**
     * layout position is in format [x, y]
     */
    buildLayout() {
        let room = this.room;
        let roomName = room.name;
        let layout = {
            spawn: [],
            extension: [],
            extractor: [],
            factory: [],
            lab: [],
            tower: [],
            link: [],
            nuker: [],
            observer: [],
            powerSpawn: [],
            storage: [],
            terminal: [],
            container: [],
            road: []
        };
        const surr = [[0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1]];
        let built = initArr(false);
        let sourceArr = initArr(0);
        let mineralArr = initArr(0);
        let controllerArr = initArr(0);
        let storageArr = initArr(0);
        let sources = this.room.find(FIND_SOURCES);
        let centers = [];
        for (let source of sources) {
            this.getCostArray(sourceArr, source.pos.x, source.pos.y, 3);
        }
        let mineral = this.room.find(FIND_MINERALS)[0];
        layout.extractor.push([mineral.pos.x, mineral.pos.y]);
        this.getCostArray(mineralArr, mineral.pos.x, mineral.pos.y, 2);
        let controller = this.room.controller;
        this.getCostArray(controllerArr, controller.pos.x, controller.pos.y, 4);
        let rt = new Room.Terrain(this.room.name);
        //get array for distance to wall
        let wallArr = initArr(0);
        let frontier = [];
        let explored = initArr(false);
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                if (isOnWallOrEdge(x, y, rt)) {
                    frontier.push([x, y]);
                    explored[x][y] = true;
                }
            }
        }
        while (frontier.length > 0) {
            while (frontier.length > 0) {
                let pos = frontier.shift();
                let x = pos[0];
                let y = pos[1];
                let neighbors = [[x - 1, y - 1], [x - 1, y], [x - 1, y + 1],
                    [x, y - 1], [x, y + 1], [x + 1, y - 1], [x + 1, y], [x + 1, y + 1]];
                for (let p of neighbors) {
                    if (x > 0 && x < 49 && y > 0 && y < 49 && !explored[p[0]][p[1]]) {
                        wallArr[p[0]][p[1]] = (wallArr[x][y] + 10) * 0.75;
                        frontier.push(p);
                        explored[p[0]][p[1]] = 1;
                    }
                }
            }
        }


        // find position for storage
        let matrix = addArrays(sourceArr, multiplyArray(mineralArr, 0.25),
            controllerArr, multiplyArray(wallArr, -1));
        let [x, y] = findMin(matrix, (x, y) => {
            return canPut(x, y, storageCluster, built, this.room, matrix, rt);
        });
        this.getCostArray(storageArr, x, y, 0);
        put(x, y, layout, storageCluster, built);
        const storagePos = new RoomPosition(x, y, this.room.name);

        function connectToStorage(x, y) {
            let position = new RoomPosition(x, y, room.name);
            let path = room.findPath(position, storagePos, {
                ignoreCreeps: true,
                ignoreDestructibleStructures: true,
                ignoreRoads: true,
                swampCost: 1,
                heuristicWeight: 1,
                range: 1,
            });
            for (let p of path) {
                if (!built[p.x][p.y]) {
                    layout[STRUCTURE_ROAD].push([p.x, p.y]);
                    built[p.x][p.y] = true;
                }
            }
        }

        //find position for lab
        matrix = addArrays(mineralArr, multiplyArray(storageArr, 5),
            multiplyArray(sourceArr, 0.01), multiplyArray(controllerArr, 0.01));
        [x, y] = findMin(matrix, (x, y) => {
            return canPut(x, y, labCluster, built, this.room, matrix, rt);
        });
        centers.push([x, y]);
        put(x, y, layout, labCluster, built);

        let towerMatrix = addArrays(multiplyArray(mineralArr, 0.01), storageArr,
            multiplyArray(sourceArr, 0.01), multiplyArray(controllerArr, 0.01));

        function putTowerCluster() {
            [x, y] = findMin(towerMatrix, (x, y) => {
                return canPut(x, y, towerCluster, built, this.room, matrix, rt);
            });
            centers.push([x, y]);
            put(x, y, layout, towerCluster, built);
        }

        let extensionMatrix = addArrays(multiplyArray(mineralArr, 0.01), multiplyArray(storageArr, 4),
            sourceArr, multiplyArray(controllerArr, 0.01));

        function putExtensionCluster() {
            [x, y] = findMin(extensionMatrix, (x, y) => {
                return canPut(x, y, extensionCluster, built, this.room, matrix, rt);
            });
            centers.push([x, y]);
            put(x, y, layout, extensionCluster, built);
        }

        for (let i = 0; i < 6; i++) {
            putTowerCluster.call(this);
            putExtensionCluster.call(this);
        }

        matrix = addArrays(multiplyArray(mineralArr, 0.01), storageArr,
            multiplyArray(sourceArr, 0.01), multiplyArray(controllerArr, 0.01));
        [x, y] = findMin(matrix, (x, y) => {
            return canPut(x, y, observerCluster, built, this.room, matrix, rt);
        });
        centers.push([x, y]);
        put(x, y, layout, observerCluster, built);

        //connect all clusters to center
        for (let p of centers) {
            connectToStorage(...p);
        }


        //place container for controller
        function placeContainer(target) {
            let range = (target instanceof StructureController) ? 3 : 1;
            let path = room.findPath(storagePos, target.pos, {
                ignoreCreeps: true,
                ignoreDestructibleStructures: true,
                ignoreRoads: true,
                swampCost: 1,
                heuristicWeight: 1,
                range: range,
            });
            for (let i = 0; i < path.length - 1; i++) {
                if (!built[path[i].x][path[i].y]) {
                    layout[STRUCTURE_ROAD].push([path[i].x, path[i].y]);
                    built[path[i].x][path[i].y] = true;
                }
            }
            let containerPos = path[path.length - 1];
            layout[STRUCTURE_CONTAINER].push([containerPos.x, containerPos.y]);
            built[containerPos.x][containerPos.y] = true;
            if (!room.memory[target.id]) {
                room.memory[target.id] = {};
            }
            room.memory[target.id].containerPos = serialize(new RoomPosition(containerPos.x, containerPos.y, roomName));
            if (target instanceof Mineral) {
                return;
            }
            let linkBuilt = false;
            for (let d of surr) {
                let x = containerPos.x + d[0];
                let y = containerPos.y + d[1];
                if (!isNearWallOrEdge(x, y, rt) && !built[x][y]) {
                    layout[STRUCTURE_LINK].push([x, y]);
                    room.memory[target.id].linkPos = serialize(new RoomPosition(x, y, roomName));
                    linkBuilt = true;
                    break;
                }
            }
            if(!linkBuilt){
                for (let d of surr) {
                    let x = containerPos.x + d[0];
                    let y = containerPos.y + d[1];
                    if (!isOnWallOrEdge(x, y, rt) && !built[x][y]) {
                        layout[STRUCTURE_LINK].push([x, y]);
                        room.memory[target.id].linkPos = serialize(new RoomPosition(x, y, roomName));
                        linkBuilt = true;
                        break;
                    }
                }
            }
        }

        placeContainer(controller);
        for (let source of sources) {
            placeContainer(source);
        }
        placeContainer(mineral);

        return layout;
    }

    /**
     * if
     * @return {*[]}
     */
    calculateRam() {
        let layout = this.getLayout();
        let protectedPos = [];
        for (let type in layout) {
            if (type === STRUCTURE_ROAD || type === STRUCTURE_EXTRACTOR) continue;
            for (let i of layout[type]) {
                if ((type !== STRUCTURE_CONTAINER && type !== STRUCTURE_LINK) ||
                    type === STRUCTURE_LINK && i[0] === this.getStoragePos().x && i[1] === this.getStoragePos().y - 2)
                    protectedPos.push(i);
            }
        }


        let [roomArr, matrix] = require('mincut').calculate(this.room.name, protectedPos,
            [this.room.controller.pos.x, this.room.controller.pos.y]);

        return [roomArr, matrix];
    }

    getRams(){
        if(!this.room.memory.rams){
            let [rams, matrix] = this.calculateRam();
            this.room.memory.rams = rams;
            this.room.memory.matrix = matrix.serialize();
        }
        return this.room.memory.rams;
    }

    showRams(){
        let rams = this.getRams();
        let rv = new RoomVisual(this.room.name);
        for(let r of rams){
            rv.circle(r.x, r.y, {radius: 0.5, fill: '#ff0000', opacity: 0.4});
        }
    }

    showLayout(){
        let layout = this.getLayout();
        let rv = new RoomVisual(this.room.name);
        for (let r of layout[STRUCTURE_ROAD]) {
            rv.structure(...r, STRUCTURE_ROAD);
        }
        rv.connectRoads();
        for (let type in layout) {
            if (type === STRUCTURE_ROAD) continue;
            for (let i of layout[type]) {
                rv.structure(...i, type);
            }
        }
    }

    /**
     *
     * @return {StructureLab[]}
     */
    findSourceLabs(){
        if(this.room.memory.sourceLabs && this.room.memory.sourceLabs[0] && this.room.memory.sourceLabs[1]){
            let lab0 = deserialize(this.room.memory.sourceLabs[0], StructureLab);
            let lab1 = deserialize(this.room.memory.sourceLabs[1], StructureLab);
            if(lab0 && lab1){return [lab0, lab1];}
        }
        let labPos = this.getLayout().lab;
        let lab0 = _.filter(this.room.lookForAt(LOOK_STRUCTURES, labPos[0][0], labPos[0][1]),
            (s) => s.structureType === STRUCTURE_LAB)[0];
        let lab1 = _.filter(this.room.lookForAt(LOOK_STRUCTURES, labPos[1][0], labPos[1][1]),
            (s) => s.structureType === STRUCTURE_LAB)[0];
        if(lab0 && lab1) {this.room.memory.sourceLabs = [serialize(lab0), serialize(lab1)];}
        return _.filter([lab0, lab1], (s) => s);
    }

    findReactionLabs(){
        let sourceLabs = this.findSourceLabs();
        let labs = this.room.find(FIND_MY_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_LAB
        });
        let reactionLabs = [];
        return _.filter(labs, (l) => {
            return !sourceLabs.includes(l)
        });
    }

    /**
     * @return {StructureLab[]}
     */
    getReactingLabs(){
        return _.filter(this.findReactionLabs(), (s) => {
            return !s.memory.boosting;
        });
    }


    /**
     *
     * @param array: an array of 50 * 50 zeroes or initial values
     * @param x x position for the 0 source
     * @param y y position for the 0 source
     * @param infRange 2 for source/mineral, 0 for storage, 4 for controller
     */
    getCostArray(array, x, y, infRange) {
        let terrain = new Room.Terrain(this.room.name);
        let room = this.room;

        function bfs(initx, inity) {
            let arr = initArr(0);
            let frontier = [[initx, inity]];
            let explored = initArr(false);
            while (frontier.length > 0) {
                let pos = frontier.shift();
                let x = pos[0];
                let y = pos[1];
                let neighbors = [[x - 1, y - 1], [x - 1, y], [x - 1, y + 1],
                    [x, y - 1], [x, y + 1], [x + 1, y - 1], [x + 1, y], [x + 1, y + 1]];
                for (let p of neighbors) {
                    if (!isOnWallOrEdge(...p, terrain) && !explored[p[0]][p[1]]) {
                        arr[p[0]][p[1]] = arr[x][y] + 1;
                        frontier.push(p);
                        explored[p[0]][p[1]] = 1;
                    }
                }
            }
            return arr;
        }

        let initx = x, inity = y;
        let arr = bfs(x, y);
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                let dx = Math.abs(x - initx);
                let dy = Math.abs(y - inity);
                if ((dx <= infRange && dy <= infRange) || arr[x][y] < 1) {
                    array[x][y] += Infinity;
                } else {
                    array[x][y] += arr[x][y] - infRange;
                }
            }
        }
    }
}

const storageCluster = {
    storage: [[0, 0]],
    link: [[0, -2]],
    factory: [[-1, -1]],
    terminal: [[1, -1]],
    spawn: [[-2, 0], [2, 0], [0, 2]],
    nuker: [[-1, 1]],
    powerSpawn: [[1, 1]],
};

const labCluster = {
    lab: [[1, -1], [1, 0], [0, -2], [-1, -1], [0, -1], [-1, 0], [0, 0], [2, 0],
        [0, 1], [1, 1]]
};

const extensionCluster = {
    extension: [[1, -1], [1, 0], [0, -2], [-1, -1], [0, -1], [-1, 0], [0, 0], [2, 0],
        [0, 1], [1, 1]]
};

const towerCluster = {
    tower: [[0, 0]]
};

const observerCluster = {
    observer: [[0, 0]]
};

module.exports = RoomBuilder;

function isNearWallOrEdge(x, y, rt) {
    if (x <= 1 || x >= 48|| y <= 1 || y >= 48) {
        return true
    }
    return rt.get(x - 1, y - 1) === TERRAIN_MASK_WALL ||
        rt.get(x - 1, y) === TERRAIN_MASK_WALL ||
        rt.get(x - 1, y + 1) === TERRAIN_MASK_WALL ||
        rt.get(x, y - 1) === TERRAIN_MASK_WALL ||
        rt.get(x, y) === TERRAIN_MASK_WALL ||
        rt.get(x, y + 1) === TERRAIN_MASK_WALL ||
        rt.get(x + 1, y - 1) === TERRAIN_MASK_WALL ||
        rt.get(x + 1, y) === TERRAIN_MASK_WALL ||
        rt.get(x + 1, y + 1) === TERRAIN_MASK_WALL;
}


function isOnWallOrEdge(x, y, rt) {
    if (x <= 0 || x >= 49 || y <= 0 || y >= 49) {
        return true;
    }
    return rt.get(x, y) === TERRAIN_MASK_WALL;
}

function isNearExit(x, y, room) {
    let range = 5;
    if (x >= range && x <= 50 - range && y >= range && y <= range) {
        return false;
    }
    let exits = room.find(FIND_EXIT);
    for (let exit of exits) {
        let dx = Math.abs(exit.x - x);
        let dy = Math.abs(exit.y - y);
        if (dx < range && dy < range) {
            return true;
        }
    }
    return false;
}

function canPut(x, y, cluster, built, room, costMatrix, rt){
    for(let type in cluster){
        for(let pos of cluster[type]){
            let px = x + pos[0], py = y + pos[1];
            if(isNearWallOrEdge(px, py, rt) || isNearExit(px, py, room) ||
                built[px][py] || costMatrix[px][py] === Infinity){
                return false;
            }
        }
    }
    return true;
}


function put(x, y, layout, cluster, built) {
    let roads = [];
    for (let type in cluster) {
        for (let pos of cluster[type]) {
            let px = x + pos[0], py = y + pos[1];
            layout[type].push([px, py]);
            built[px][py] = true;
            roads = roads.concat([[px - 1, py], [px, py - 1], [px + 1, py], [px, py + 1]]);
        }
    }
    for (let p of roads) {
        if (!built[p[0]][p[1]]) {
            layout[STRUCTURE_ROAD].push(p);
            built[p[0]][p[1]] = true
        }
    }
}

function addArrays(...arrays) {
    let result = initArr(0);
    for (let array of arrays) {
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                result[x][y] += array[x][y];
            }
        }
    }
    return result;
}

function multiplyArray(array, constant) {
    let result = initArr(0);
    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
            result[x][y] += array[x][y] * constant;
        }
    }
    return result;
}

function findMin(matrix, condition) {
    let minValue = Infinity;
    let minX = -1;
    let minY = -1;
    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
            if (matrix[x][y] < minValue && condition(x, y)) {
                minX = x;
                minY = y;
                minValue = matrix[x][y];
            }
        }
    }
    return [minX, minY];
}


const visual = {
    container:'📁',
    extension: '⭐',
    extractor: '⭕',
    factory: '🏭',
    lab: '💡',
    link: '📞',
    nuker: '☢',
    observer: '👀',
    powerSpawn: '🍅',
    road: '·',
    spawn: '💛',
    storage: '⛽',
    terminal: '🎮',
    tower: '🏹'
};

 
function initArr(content) {
    let arr = new Array(50);
    for (let i = 0; i < 50; i++) {
        arr[i] = new Array(50).fill(content);
    }
    return arr;
}
