// Specify all the buff type
const buffList = ["speedBoost", "extraRange", "extraLife", "extraBomb"];

const Buff = function (ctx, x, y, type = "") {
    const itemSequences = {
        speedBoost: { x: 15, y: 576, width: 128, height: 128, count: 1, timing: 200, loop: false },
        extraBomb: { x: 15, y: 12, width: 128, height: 128, count: 1, timing: 200, loop: false },
        extraLife: { x: 15, y: 294, width: 128, height: 128, count: 1, timing: 200, loop: false },
        extraRange: { x: 15, y: 152, width: 128, height: 128, count: 1, timing: 200, loop: false },
    };

    const sprite = Sprite(ctx, x, y);

    // randome choose buff
    if (type == "random")
        type = buffList[Math.floor(Math.random() * buffList.length)];

    const objType = type
    console.log(type);
    switch (type) {
        case 'speedBoost':
            buffType = itemSequences.speedBoost;
            break;
        case 'extraRange':
            buffType = itemSequences.extraRange;
            break;
        case 'extraLife':
            buffType = itemSequences.extraLife;
            break;
        case 'extraBomb':
            buffType = itemSequences.extraBomb;
            break;
        default:
            console.log("default buff");
            buffType = itemSequences.extraRange;
    }

    sprite.setSequence(buffType)
        .setScale(0.3)
        .setShadowScale({ x: 0, y: 0 })
        .useSheet("Assets/items.png");



    const getType = function () {
        return objType;
    }

    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getBoundingBox: sprite.getBoundingBox,
        draw: sprite.draw,
        update: sprite.update,
        getType: getType
    };
};
