const Bombs = function (ctx, players) {
    // buffList is a const list from buff.js
    // used to prevent the bomb to destory certain object
    const exception = buffList.concat(["bomb"]);

    // record the player has placed how many bomb
    let bombCount = {}
    for (let i = 0; i < players.length; i++) {
        let datum = players[i].PID;
        bombCount[datum] = 0;
    }

    // record bomb hit report
    // Example
    // hitRecords[0][0] = bomb from who
    // hitRecords[0][1] = bomb hit who
    // hitRecords[0][2] = bomb hit at i
    // hitRecords[0][3] = bomb hit at j
    let hitRecords = []

    function addRecord(place, hit, i, j) {
        let hitRecord = [];
        hitRecord.push(place);
        hitRecord.push(hit);
        hitRecord.push(i);
        hitRecord.push(j);

        hitRecords.push(hitRecord);
    }

    // control buff drop rate
    const dropItem = function () {
        var chance = Math.random();
        if (chance < 1)
            return true;
        else
            return false;
    }


    const placeBomb = function (player, randomNubmer) {
        // check avaliable bomb
        if (player.stat.numBombs <= 0)
            return;

        // get player current i, j index
        let i = player.getIJ().i;
        let j = player.getIJ().j;

        //check the obj type on the map i, j
        obj = ctx.getObj(i, j).obj;

        // Player could only place bomb at ground
        if (!(obj === null))
            if (obj.getType() != "ground")
                return;

        // update stat
        bombCount[player.PID]++;
        player.stat.numBombs--;

        // place bomb
        ctx.setObj(i, j, "bomb", layer = "objs", hvBox = true);
        const bombTime = setTimeout(bombExplosion, 2000);

        function bombExplosion() {
            // rememove bomb obj and its boundary box
            ctx.clearObj(i, j, layer = "objs")
            ctx.clearObj(i, j, layer = "objsBox")

            createExplosion("down");
            createExplosion("up");
            createExplosion("left");
            createExplosion("right");
            createExplosion("mid");
            player.stat.numBombs++;
        }

        function createExplosion(dir) {
            let q = 0;
            let r = 0;
            switch (dir) {
                case "down":
                    q = 1;
                    r = 0;
                    break;
                case "up":
                    q = -1;
                    r = 0;
                    break;
                case "left":
                    q = 0;
                    r = -1;
                    break;
                case "right":
                    q = 0;
                    r = 1;
                    break;
                case "mid":
                    // create explision sprites
                    ctx.setObj(i, j, "explosion", layer = "explosion");
                    ctx.addExplosionCount(i, j);

                    // check hit
                    for (const play of players) {
                        if (play.getIJ().i == i && play.getIJ().j == j) {
                            play.reduceLife(play.PID);
                            console.log(play.PID);
                            addRecord(player.PID, play.PID, play.getIJ().i, play.getIJ().j)
                            // console.log("P", player.PID, "hit P", play.PID, "at", play.getIJ().i, play.getIJ().j);
                        }
                    }

            }

            let p = 1;
            if (dir != "mid") {
                while (p <= player.stat.range) {
                    let stop = false;
                    objType = null

                    // stop the explision at bound and solid block
                    if (!(ctx.getObj(i + q * p, j + r * p).obj === null)) {
                        objType = ctx.getObj(i + q * p, j + r * p).obj.getType()
                        if (objType == "bound" || objType == "solid") {
                            p--;
                            break;
                        }
                    }

                    // destory and stop at fragile block
                    if (objType == "fragile") {
                        stop = true;
                    }

                    // clear things on objs layer with exception
                    ctx.clearObj(i + q * p, j + r * p, layer = "objs", exception);

                    // handle drop item
                    if (stop && dropItem()) {
                        ctx.clearObj(i + q * p, j + r * p, layer = "objsBox")
                        ctx.setObj(i + q * p, j + r * p, "buff", layer = "objs", hvBox = false, randomNubmer);
                    }

                    // prevent buggy overlapping animation
                    ctx.setObj(i + q * p, j + r * p, "explosion", layer = "explosion");
                    ctx.addExplosionCount(i + q * p, j + r * p);

                    //check player hit
                    for (const play of players) {
                        if (play.getIJ().i == (i + q * p) && play.getIJ().j == (j + r * p)) {
                            play.reduceLife(play.PID);
                            addRecord(player.PID, play.PID, play.getIJ().i, play.getIJ().j)
                            // console.log("P", player.PID, "hit P", play.PID, "at", play.getIJ().i, play.getIJ().j);
                        }
                    }
                    if (stop || p >= player.stat.range)
                        break;
                    p++
                }
            }
            // Remove "p" explosion animation at the "dir" direction
            const explosionTime = setTimeout(removeExplosion, 700, dir, p)
        }

        function removeExplosion(dir, range) {
            let q = 0;
            let r = 0;
            switch (dir) {
                case "down":
                    q = 1;
                    r = 0;
                    break;
                case "up":
                    q = -1;
                    r = 0;
                    break;
                case "left":
                    q = 0;
                    r = -1;
                    break;
                case "right":
                    q = 0;
                    r = 1;
                    break;
                case "mid":
                    ctx.subExplosionCount(i, j);
                    if (ctx.getExplosionCount(i, j) <= 0)
                        ctx.clearObj(i, j, layer = "explosion");
                    return;
            }
            // console.log(range);
            for (let p = 1; p <= range; p++) {
                if (!(ctx.getObj(i + q * p, j + r * p).obj === null)) {
                    objType = ctx.getObj(i + q * p, j + r * p).obj.getType();
                    if (objType == "bound" || objType == "solid")
                        break;
                }
                ctx.subExplosionCount(i + q * p, j + r * p);
                if (ctx.getExplosionCount(i + q * p, j + r * p) <= 0)
                    ctx.clearObj(i + q * p, j + r * p, layer = "explosion");
            }

        }
    }
    return {
        placeBomb: placeBomb
    };
};
