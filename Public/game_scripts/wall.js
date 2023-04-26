const Wall = function (ctx, x, y, type = "") {


    const wallSequences = {
        //boundary
        bound: { x: 96, y: 64, width: 16, height: 16, count: 1, timing: 200, loop: false },
        //unbreakable wall
        solid: { x: 0, y: 32, width: 16, height: 16, count: 1, timing: 200, loop: false },
        //breakable wall
        fragile: { x: 32, y: 256, width: 16, height: 16, count: 1, timing: 200, loop: false },
        //ground
        ground: { x: 32, y: 240, width: 16, height: 16, count: 1, timing: 200, loop: false },
    };


    const sprite = Sprite(ctx, x, y);
    const objType = type
    switch (type) {
        case 'bound':
            wallType = wallSequences.bound;
            break;
        case 'solid':
            wallType = wallSequences.solid;
            break;
        case 'fragile':
            wallType = wallSequences.fragile;
            break;
        case 'ground':
            wallType = wallSequences.ground;
            break;

        default:
            wallType = wallSequences.ground;
    }
    sprite.setSequence(wallType)
        .setScale(3.125)
        .setShadowScale({ x: 0, y: 0 })
        .useSheet("assets/textures.png");

    //pick a random property from an object
    const randomProperty = function (obj) {
        var keys = Object.keys(obj);
        return obj[keys[keys.length * Math.random() << 0]];
    };

    //30% drop a item when the wall is destroyed
    const dropItem = function () {
        var chance = Math.random();
        if (chance < 0.3)
            return true;
        else
            return false;
    }


    //wall on destroy
    const onDestroy = function () {
        if (dropItem()) {
            sprite.setSequence(randomProperty(itemSequences))
                .setScale(0.3)
                .setShadowScale({ x: 0, y: 0 })
                .useSheet("assets/items.png");
            return true;
        }
        // if return false, the main program should be delete this object
        return false;
    }

    const getType = function () {
        return objType;
    }

    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: sprite.update,
        onDestroy: onDestroy,
        getType: getType
    };
};
