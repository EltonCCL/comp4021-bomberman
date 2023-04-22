// This function defines the bomb module.
// - `ctx` - A canvas context for drawing
// - `x` - The initial x position of the bomb
// - `y` - The initial y position of the bomb
const Bomb = function (ctx, x, y) {
    const sequences = {
        default: { x: 8, y: 0, width: 28, height: 35, count: 5, timing: 400, loop: true },
    };
    // This is the sprite object of the bomb created from the Sprite module.
    const sprite = Sprite(ctx, x, y);

    // The sprite object is configured for the bomb sprite here.
    sprite.setSequence(sequences.default)
        .setScale(1.3)
        .setShadowScale({ x: 0.75, y: 0.2 })
        .useSheet("Assets/bomb.png");
        sprite.setSequence(sequences.default)
    // This is the birth time of the bomb for finding its age.
    let birthTime = performance.now();


    // ***This could be used for counting the explode time
    // This function gets the age (in millisecond) of the bomb.
    // - `now` - The current timestamp
    const getAge = function (now) {
        return now - birthTime;
    };

    // ***This should be useless
    // This function randomizes the bomb colour and position.
    // - `area` - The area that the bomb should be located in.
    const randomize = function (area) {
        birthTime = performance.now();
        const { x, y } = area.randomPoint();
        sprite.setXY(x, y);
    };

    const getType = function(){
        return "bomb";
    }
    const update = function (time){
        sprite.update(time);
        // console.log("Updating");
    }
    
    // The methods are returned as an object here.
    return {
        getXY: sprite.getXY,
        setXY: sprite.setXY,
        getAge: getAge,
        getBoundingBox: sprite.getBoundingBox,
        randomize: randomize,
        draw: sprite.draw,
        // update: sprite.update,
        getType: getType,
        update: update,
        bombTime: 2000
    };
};
