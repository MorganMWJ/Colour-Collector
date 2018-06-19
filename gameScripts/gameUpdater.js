function gameUpdate() {
    if (started) {

        if (player.lives == 0) {
            endGame();
            gameOver = true;
            return;
        }


        if (difficulty.text == "Easy" && (localStorage.getItem("highScoreEasy") === null || player.score > localStorage.highScoreEasy)) {
            localStorage.highScoreEasy = player.score;
        }
        else if (difficulty.text == "Medium" && (localStorage.getItem("highScoreMedium") === null || player.score > localStorage.highScoreMedium)) {
            localStorage.highScoreMedium = player.score;
        }
        else if (difficulty.text == "Hard" && (localStorage.getItem("highScoreHard") === null || player.score > localStorage.highScoreHard)) {
            localStorage.highScoreHard = player.score;
        }


        //clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        //increment the frame count
        frameCount += 1;

        //if player is using mouse
        if (!alternateControl) {
            //only move player if inside arena and over player
            if (insideArena(mouseX, mouseY, player.icon.radius)) {
                if (mouseNotCurrentlyOverPlayer) {
                    //if it out side of the arena then it has to be ontop of the player to move again
                    if (distanceBetween(player.icon.x, player.icon.y, mouseX, mouseY) < player.icon.radius * 1.5) {
                        //turn cursor off when in arena
                        canvas.style.cursor = "none";
                        mouseNotCurrentlyOverPlayer = false;

                        //find speed of player (speed = difference between  points/frame)
                        player.icon.speedX = mouseX - player.icon.x;
                        player.icon.speedY = mouseY - player.icon.y;

                        //update player co-ordinates
                        player.icon.x = mouseX;
                        player.icon.y = mouseY;
                    }
                }
                else {
                    //turn cursor off when in arena
                    canvas.style.cursor = "none";

                    //find speed of player (speed = difference between  points/frame)
                    player.icon.speedX = mouseX - player.icon.x;
                    player.icon.speedY = mouseY - player.icon.y;

                    //update player co-ordinates
                    player.icon.x = mouseX;
                    player.icon.y = mouseY;
                }
            }
            else {
                //turn cursor on when out side arena
                canvas.style.cursor = "default";
                mouseNotCurrentlyOverPlayer = true;
            }
        }
        else {//if player is using keys
            //every 0.1 seconds the player can accelerate via the keys
            if (everyInterval(5)) {
                //allows player to be slowed every interval if no keys are pressed
                if (currentKeys[40])player.icon.speedY += 2;
                if (currentKeys[38])player.icon.speedY -= 2;
                if (currentKeys[37])player.icon.speedX -= 2;
                if (currentKeys[39])player.icon.speedX += 2;
            }
            player.newPos();
            canvas.style.cursor = "default";
            mouseNotCurrentlyOverPlayer = true;
        }

        //update background
        background.speedX = -2;
        background.newPos();

        //update points and level when no points remain in this level
        if (pointsAvailable == 0) {
            //level up
            player.level += 1;
            //spawn new objects for the new level
            spawnPoints();
        }

        //changes because of point collisions
        evaluateCollisions();

        //paint game objects
        background.paint();

        //set global alpha for arena transparency
        ctx.globalAlpha = 0.5;
        arena.paint();
        ctx.globalAlpha = 1;

        for (i = 0; i < points.length; i++) {
            points[i].icon.newPos();
            points[i].icon.paint();
        }
        for (i = 0; i < goals.length; i++) {
            goals[i].resetColor();
            goals[i].icon.paint();
        }
        menu.paint();
        player.icon.paint();
    }

    else{
        canvas.style.cursor = "default";
        background.paint();
        menu.paint();
        //paint on click here to start text
        drawStartScreenPopup();
        music.stop();
    }
}


//code for spawning points,extralives and obstacles depending on level
function spawnPoints(){
    pointsAvailable = newPoints(player.level);
    //empty old points from array
    points = [];
    //add the points to the game in random locations of the arena
    var spawnLife = false;
    for(var i = 0; i<pointsAvailable; i++){
        //default point color
        var color = Point.normalColor;
        var bColor = Point.normalColor;
        //default point size
        var pointRadius = Point.normalRadius;
        var pointBorder = Point.normalBorder;
        /*if level is multiple of 'lifeOccurance'(dependant on difficulty)
         and no life has spawned this level,chance to spawn extra(dependant on difficulty) life instead of point*/
        if(player.level%difficulty.lifeOccurrence==0 && Math.random()<=difficulty.lifeChance && !spawnLife){
            //life point color and size
            color = Point.extraLifeColor;
            bColor = Point.extraLifeBorderColor;
            pointRadius = Point.obstacleRadius;
            pointBorder = Point.obstacleBorder;
        }
        //picks a random co-ord out of the game window
        var randX = Math.floor(Math.random() * gameWindow.width);
        var randY = Math.floor(Math.random() * gameWindow.height);
        //only add the point to the game if it is inside the arena
        if(insideArena(randX,randY,(pointRadius+pointBorder))){
            var newPoint = new Point(pointRadius,randX,randY, color, bColor, pointBorder);
            //only add this point if not spawning into another point or the player
            if(!pointToPointCollision(newPoint,points) && !circleCollision(newPoint.icon,player.icon)) {
                //only say a life has been spawned after it has passed all above spawning tests
                if(newPoint.isExtraLife()){
                    spawnLife = true;
                }
                points.push(newPoint);
            }
            else{
                i--;
            }
        }
        else{
            i--;
        }
    }

    //spawn obstacle points
    if(player.level>=difficulty.obstacleStart && player.level%difficulty.obstacleOccurrence==0){
        var incorrectObstacleSpawn = true;
        while(incorrectObstacleSpawn){
            //picks a random co-ord inside area
            var randX = Math.floor(Math.random() * gameWindow.width);
            var randY = Math.floor(Math.random() * gameWindow.height);
            //create new obstacle
            var newObstacle = new Point(Point.obstacleRadius,randX,randY, Point.obstacleColor, Point.obstacleBorderColor, Point.obstacleBorder);
            if(insideArena(randX,randY,(Point.obstacleRadius+Point.obstacleBorder)) && !pointToPointCollision(newObstacle,points) && !circleCollision(newObstacle.icon,player.icon)){
                //only add this obstacle if inside arena and not spawning into another point or the player
                points.push(newObstacle);
                incorrectObstacleSpawn = false;
            }
        }
    }
}

//code to react to any collisions between game objects
function evaluateCollisions(){
    for(i = 0; i<points.length; i++){
        //only process points that have not been removed from the round
        if(points[i].removed == false) {
            //if player collides with point
            if (circleCollision(player.icon, points[i].icon)) {
                //if the point is an extra life point
                if(points[i].isExtraLife()){
                    //set point as collected
                    points[i].collected = true;
                    //remove the point
                    points[i].removeFromPlay();
                    //decrement the amount of available points
                    pointsAvailable--;
                    //add the extra life
                    player.lives++;
                    //play extra life sound
                    Point.lifeSound.play();
                }
                else if(points[i].isObstacle()){
                    //set point as collected
                    points[i].collected = true;
                    //remove the point
                    points[i].removeFromPlay();
                    //minus a life
                    player.lives--;
                    //play bad sound sound
                    if(player.lives>0) Point.missSound.play();
                }
                else {
                    //move the obstacle away from the player along the same angle that the player was moving upon collision
                    points[i].icon.speedX = player.icon.speedX;
                    points[i].icon.speedY = player.icon.speedY;
                    //play sound
                    Point.touchSound.play();
                }
            }

            //if point collides with any of the 4 goals
            for (var g = 0; g < goals.length; g++) {
                if (circleCollision(points[i].icon, goals[g].icon) && points[i].collected == false) {
                    //holds the current point so it can remove from play when off the screen
                    goals[g].currentPoint = points[i];

                    //add 100 to player score
                    player.score += 100;
                    //set that point as collected
                    points[i].collected = true;
                    //play score sound
                    Point.scoreSound.play();
                    //decrement the amount of available points
                    pointsAvailable--;
                    //flash that goal as green
                    goals[g].frameOfLastHit = frameCount;
                    goals[g].icon.color = "green";
                }
            }

            //if point has not been collected and is out of view area
            if (!points[i].collected && outOfGameWindow(points[i].icon.x, points[i].icon.y)) {
                //player loses life
                player.lives--;
                //decrement the amount of available points
                pointsAvailable--;
                //play bad sound (but not over end game sound)
                if(player.lives>0) Point.missSound.play();
                //remove point from play
                points[i].removeFromPlay();
            }
        }
    }
}