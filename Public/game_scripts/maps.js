const Maps = function (ctx, ipt_map) {

    function getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }

    const objKey = {
        "-2": "box",
        "-1": "bound",
        "0": "ground",
        "1": "solid",
        "2": "fragile",
        "3": "bomb",
        "4": "speedBoost",
        "5": "extraRange",
        "6": "extraLife",
        "7": "extraBomb"
    }

    // initializing map size
    const objL = 50;
    const mapWidth = ipt_map[0].length;
    const mapHeight = ipt_map.length;

    // The map contains multiple layers for batter visualizeion

    // plain ground only (Lowest level)
    let groundLayer = [];

    // Used for explosion effect only (middle level)
    let explosionLayer = [];

    // Used to record how many explosion occuring on that grid
    let explosionCount = [];

    // Used to display walls, bombs, and buff (Highest level)
    let objs = [];

    // Used to store the object boundary box for object collision
    let objsBox = [];

    // Initializing all the layers
    for (let i = 0; i < ipt_map.length; i++) {
        let row_obj = [];
        let row_objBox = [];
        let row_groundLayer = [];
        let row_explosionLayer = [];
        let row_explosionCount = [];

        for (let j = 0; j < ipt_map[0].length; j++) {
            row_groundLayer.push(Wall(ctx, j * objL + objL / 2, i * objL + objL / 2, type = objKey[0]));

            if (ipt_map[i][j] != 0) {
                row_obj.push(Wall(ctx, j * objL + objL / 2, i * objL + objL / 2, type = objKey[ipt_map[i][j]]));
                row_objBox.push(BoundingBox(ctx, i * objL, j * objL, i * objL + objL, j * objL + objL));
            } else {
                row_obj.push(null);
                row_objBox.push(null);
            }

            row_explosionLayer.push(null);
            row_explosionCount.push(0);
        }
        objs.push(row_obj);
        objsBox.push(row_objBox);
        groundLayer.push(row_groundLayer);
        explosionLayer.push(row_explosionLayer);
        explosionCount.push(row_explosionCount);
    }

    const draw = function () {
        // draw all the layers of map
        for (let i = 0; i < mapHeight; i++) {
            for (let j = 0; j < mapWidth; j++) {
                groundLayer[i][j].draw();
            }
        }
        for (let i = 0; i < mapHeight; i++) {
            for (let j = 0; j < mapWidth; j++) {
                // console.log(i, j)
                if (!(explosionLayer[i][j] === null))
                    explosionLayer[i][j].draw();
            }
        }
        for (let i = 0; i < mapHeight; i++) {
            for (let j = 0; j < mapWidth; j++) {
                // console.log(i, j)
                if (!(objs[i][j] === null))
                    objs[i][j].draw();
            }
        }
    }


    const getObjBox = function () {
        return objsBox;
    }

    const isCollision = function (x, y, ignoreBlock) {
        let collied = false;
        for (let i = 0; i < mapHeight; i++) {
            for (let j = 0; j < mapWidth; j++) {
                if (objs[i][j] === null || objsBox[i][j] === null) {
                    continue;
                }
                // allow to ignore certain block of collision
                // it used to prevent the player being stuck at the bomb he just places
                let skip = false;
                for (let p = 0; p < ignoreBlock.length; p++) {
                    if (ignoreBlock[p][0] == j && ignoreBlock[p][1] == i) {
                        skip = true;
                        continue;
                    }
                }
                if (skip)
                    continue;

                // ignore ground
                if (objs[i][j].getType() == objKey[0])
                    continue;

                collied = collied || objsBox[i][j].isPointInBox(x, y);
            }
        }
        return collied;
    }

    const getMapSize = function () {
        return { w: mapWidth, h: mapHeight, pix: objL };
    }

    // get object at i, j
    // *Note, the id was an experimental variables, now is useless 
    const getObj = function (i, j) {
        if (i < 0 || i >= mapHeight)
            return { id: null, obj: null };
        if (j < 0 || j >= mapWidth)
            return { id: null, obj: null };
        return { id: null, obj: objs[i][j] };
    }

    // place a object on the layer

    // iIndex: the i index of the layer
    // jIndex: the j index of the layer
    // ipt_tpye: the object type you want
    // layer: the layer you want to put
    // hvBox: Need to create boundary box for it?
    const setObj = function (iIndex, jIndex, ipt_type, layer = "objs", hvBox = false, randomNubmer = 0) {
        // handle out of range
        if (iIndex < 0 || iIndex >= mapHeight)
            return;
        if (jIndex < 0 || jIndex >= mapWidth)
            return;

        // choose layer
        switch (layer) {
            case "objs":
                layer = objs;
                break;
            case "ground":
                layer = groundLayer;
                break;
            case "explosion":
                layer = explosionLayer;
                break;
            default:
                layer = objs;
                console.log("Default Layer")
                break;
        }

        // choose obj type
        let obj;
        switch (ipt_type) {
            case "ground":
                obj = Wall(ctx, jIndex * objL + objL / 2, iIndex * objL + objL / 2, type = ipt_type);
                break;
            case "bomb":
                obj = Bomb(ctx, jIndex * objL + objL / 2, iIndex * objL + objL / 2);
                break;
            case "explosion":
                obj = Explosion(ctx, jIndex * objL + objL / 2, iIndex * objL + objL / 2);
                break;
            case "buff":
                obj = Buff(ctx, jIndex * objL + objL / 2, iIndex * objL + objL / 2, type = "random", randomNubmer);
        }
        // place the object at the layer
        layer[iIndex][jIndex] = obj;

        // create boundary box
        if (hvBox) {
            objsBox[iIndex][jIndex] = BoundingBox(ctx, iIndex * objL, jIndex * objL, iIndex * objL + objL, jIndex * objL + objL)
        }
    }

    // clear object at certain layer
    // it allow some exception (mostly bombs and buff)
    const clearObj = function (iIndex, jIndex, layer = "objs", exception = []) {
        if (iIndex < 0 || iIndex >= mapHeight)
            return;
        if (jIndex < 0 || jIndex >= mapWidth)
            return;
        // console.log(exception);
        switch (layer) {
            case "objs":
                layer = objs;
                break;
            case "ground":
                layer = groundLayer;
                break;
            case "explosion":
                layer = explosionLayer;
                break;
            case "objsBox":
                layer = objsBox;
                break;
            default:
                layer = objs;
                console.log("Default clearObj")
                break;
        }
        if (layer[iIndex][jIndex] === null)
            return;
        for (let p = 0; p < exception.length; p++) {
            if (layer[iIndex][jIndex].getType() == exception[p])
                return;
        }

        layer[iIndex][jIndex] = null;
    }

    // update layers
    const update = function (time) {
        for (let i = 0; i < mapHeight; i++) {
            for (let j = 0; j < mapWidth; j++) {
                if (!(objs[i][j] === null))
                    if (objs[i][j].getType() == "bomb") {
                        objs[i][j].update(time);
                    }
                if (!(explosionLayer[i][j] === null))
                    if (explosionLayer[i][j].getType() == "explosion") {
                        explosionLayer[i][j].update(time);
                    }
            }
        }
    }

    const getExplosionCount = function (i, j) {
        if (i < 0 || i >= mapHeight)
            return -1;
        if (j < 0 || j >= mapWidth)
            return -1;
        return explosionCount[i][j];
    }

    const setExplosionCount = function (i, j, count) {
        if (i < 0 || i >= mapHeight)
            return;
        if (j < 0 || j >= mapWidth)
            return;
        explosionCount[i][j] = count;
    }

    const addExplosionCount = function (i, j) {
        if (i < 0 || i >= mapHeight)
            return;
        if (j < 0 || j >= mapWidth)
            return;
        explosionCount[i][j]++;
    }

    const subExplosionCount = function (i, j, count) {
        if (i < 0 || i >= mapHeight)
            return;
        if (j < 0 || j >= mapWidth)
            return;
        explosionCount[i][j]--;
    }

    // check i, j have buff or not
    // return buff type
    const haveBuff = function (i, j) {
        if (!(objs[i][j] === null)) {
            isBuff = false;
            objType = objs[i][j].getType()
            isBuff = isBuff || objType == objKey[4];
            isBuff = isBuff || objType == objKey[5];
            isBuff = isBuff || objType == objKey[6];
            isBuff = isBuff || objType == objKey[7];
            if (isBuff) {
                clearObj(i, j, layer = "objs");
                return objType;
            }
        }
        return false;
    }

    return {
        draw: draw,
        getObjBox: getObjBox,
        isCollision: isCollision,
        getMapSize: getMapSize,
        update: update,
        setObj: setObj,
        getObj: getObj,
        clearObj: clearObj,
        getExplosionCount: getExplosionCount,
        setExplosionCount: setExplosionCount,
        addExplosionCount: addExplosionCount,
        subExplosionCount: subExplosionCount,
        getExplisionMap: explosionCount,
        haveBuff: haveBuff
    };
};
