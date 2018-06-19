
//stop interval and draw end game pop up
function endGame(){
    clearInterval(interval);
    //stop music
    music.stop();
    //play game over sound
    var sound = new Sound("sounds/gameOver.m4a",1);
    sound.play();
    //build items to draw to canvas
    var title = new Text(gameWindow.x+20,gameWindow.y+60,"Game Over",-1,"black",60);
    var subTitle = new Text(gameWindow.x+40,gameWindow.y+120,"Press 'R' to restart!",-1,"black",50);

    //draw items
    ctx.fillStyle = menu.background.color;
    ctx.fillRect(gameWindow.x,gameWindow.y,500,150);

    ctx.strokeStyle = menu.borderColor;
    ctx.lineWidth   = menu.borderWidth;
    ctx.strokeRect(gameWindow.x,gameWindow.y,500,150);

    title.paint();
    subTitle.paint();
}

function restart(){
    //reset player values
    player = new Player();
    //reset available points
    pointsAvailable = 0;

    if(paused){
        togglePause();
    }
    else if(gameOver){
        interval = setInterval(gameUpdate,20);
    }
    gameOver=false;
    started = false;
}

function setEasyDifficulty(){
    if(gameOver){
        return;
    }
    if(paused){
        togglePause();
    }
    menu.difficultyText.text = "Easy";

    difficulty = {
        text : "Easy",
        //size of goals
        goalRadius : 120,
        //a factor in the occurrence of points after level 7
        pointOccurrence : 2,
        //extra lives have chance to occur every 1 level
        lifeOccurrence : 1,
        //chance extra lives spawn when they are supposed to occur
        lifeChance : 0.75,
        //obstacles occur every 10000 levels - because obstacles are not used in easy difficulty
        obstacleOccurrence : 10000,
        //obstacles start after level 10000 - because obstacles are not used in easy difficulty
        obstacleStart : 10000
    };

    //change the goal radius now
    for(var i=0; i<goals.length; i++){
        goals[i].icon.radius = difficulty.goalRadius;
    }
    restart();
}

function setMediumDifficulty(){
    if(gameOver){
        return;
    }
    if(paused){
        togglePause();
    }
    menu.difficultyText.text = "Medium";

    difficulty = {
        text : "Medium",
        //size of goals
        goalRadius : 80,
        //a factor in the occurrence of points after level 7
        pointOccurrence : 3,
        //extra lives have chance to occur every 2 levels
        lifeOccurrence : 2,
        //chance extra lives spawn when they are supposed to occur
        lifeChance : 0.75,
        //obstacles occur every 2 levels (after obstacle start)
        obstacleOccurrence : 2,
        //obstacles start on level 6
        obstacleStart : 6
    };

    //change the goal radius now
    for(var i=0; i<goals.length; i++){
        goals[i].icon.radius = difficulty.goalRadius;
    }
    restart();
}

function setHardDifficulty(){
    if(gameOver){
        return;
    }
    if(paused){
        togglePause();
    }
    menu.difficultyText.text = "Hard";

    difficulty = {
        text : "Hard",
        //size of goals
        goalRadius : 80,
        //a factor in the occurrence of points after level 7
        pointOccurrence : 4,
        //extra lives have chance to occur every 4 levels
        lifeOccurrence : 4,
        //chance extra lives spawn when they are supposed to occur
        lifeChance : 0.75,
        //obstacles occur every 1 level (after obstacle start)
        obstacleOccurrence : 1,
        //obstacles start on level 3
        obstacleStart : 3
    };

    //change the goal radius now
    for(var i=0; i<goals.length; i++){
        goals[i].icon.radius = difficulty.goalRadius;
    }
    restart();
}

//pause game by stopping repeated update function
function togglePause(){
    if(gameOver || !started){
        return;
    }
    if(paused){
        paused = false;

        //say mouse is outside arena to prevent 'teleportation' bug
        mouseX = -100;
        mouseY = -100;

        if(!musicMuted){
            music.play()
        }
        interval = setInterval(gameUpdate,20)
    }else{
        paused = true;
        music.stop();
        canvas.style.cursor = "default";

        //paint a pause box on top left to show user game is paused
        drawPausePopup();

        menu.paint();
        clearInterval(interval);
    }
}

//paint a pause box on top left to show user game is paused
function drawPausePopup(){
    ctx.fillStyle = menu.background.color;
    ctx.fillRect(gameWindow.x,gameWindow.y,200,70);

    ctx.strokeStyle = menu.borderColor;
    ctx.lineWidth   = menu.borderWidth;
    ctx.strokeRect(gameWindow.x,gameWindow.y,200,70);

    var pauseText = new Text(gameWindow.x+20,gameWindow.y+50,"Paused",-1,"black",50);
    pauseText.paint();
}

//paint a pause box on top left to show user game is paused
function drawStartScreenPopup() {
    ctx.fillStyle = menu.background.color;
    ctx.fillRect(100, 100, gameWindow.width - 200, gameWindow.height - 200);

    ctx.strokeStyle = menu.borderColor;
    ctx.lineWidth = menu.borderWidth;
    ctx.strokeRect(100, 100, gameWindow.width - 200, gameWindow.height - 200);

    var startText = new Text(120, 170, "Click to play...", -1, "black", 50);
    var hint = new Text(110, 570, "Note: 1,2,3 keys to switch between difficulties!", -1, "black", 20);
    if (typeof(Storage !== "undefined")) {
        var eScore = new Text(150, 270, "High Score, Easy:   ", localStorage.highScoreEasy, "black", 30);
        var mScore = new Text(150, 320, "High Score, Medium: ", localStorage.highScoreMedium, "black", 30);
        var hScore = new Text(150, 370, "High Score, Hard:   ", localStorage.highScoreHard, "black", 30);

        eScore.paint();
        mScore.paint();
        hScore.paint();
    }
    hint.paint();
    startText.paint();
}

//toggle the game background music
function toggleMusic(){
    //dont have control over music when paused or game over
    if(gameOver || paused || !started){
        return;
    }
    if(musicMuted){
        musicMuted = false;
        music.play();
    }
    else{
        musicMuted = true;
        music.stop();
    }
    menu.paint();
}

//returns true if circle object is inside arena
function insideArena(x,y,radius){
    //if distance between two centers is less than arena radius - player radius, return true
    var distance = distanceBetween(arena.x,arena.y,x,y);
    return distance < (arena.radius - radius);
}

//returns the distance between two points
function distanceBetween(x1,y1,x2,y2){
    return Math.sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)));
}

//return true if two circles collide
function circleCollision(circle1,circle2){
    return distanceBetween(circle1.x,circle1.y,circle2.x,circle2.y) <= (circle1.radius + circle2.radius);
}

//!! This function was taken from the W3Schools Game Tutorial!!
//sees if frameCount is a multiple of a required interval
//this function allows for thing to happen every n frames
function everyInterval(n) {
    return (frameCount / n) % 1 == 0;
}

//returns true if a point is out side of the 700*700 game window
function outOfGameWindow(x,y){
    return (x > gameWindow.x + gameWindow.width || x < gameWindow.x)  ||  (y > gameWindow.y + gameWindow.height || y < gameWindow.y);
}

//way to calculate how many points per level
function newPoints(level){
    if(level < 6){
        return level;
    }
    else{
        return level + (level%difficulty.pointOccurrence);
    }
}

//tests if a single point collides with any of the others
function pointToPointCollision(pointToTest,pointList){
    for(var i = 0; i<pointList.length; i++){
        if(circleCollision(pointToTest.icon,pointList[i].icon)){
            return true;
        }
    }
    return false;
}