/*Much of my learning was from W3Schools Game Tutorial web pages
 therefore the basis for the way I have structured these classes has come from there.
*/


function Player(){
    this.icon = new Circle(20, arena.x, arena.y, "green", "#003300", 3);
    this.score = 0;
    this.lives = 3;
    this.level = 0;

    //specific new position method for player, used while alternate controls are active
    this.newPos = function(){
        if(insideArena(this.icon.x+this.icon.speedX,this.icon.y+this.icon.speedY,this.icon.radius)) {
            this.icon.newPos();
        }
    }
}

function Point(radius,x,y,color,borderColor,borderWidth){
    this.icon = new Circle(radius,x,y,color,borderColor,borderWidth);
    this.collected = false;
    this.removed = false;

    //returns true if this point is an extra life
    this.isExtraLife = function(){
        return this.icon.color==Point.extraLifeColor && this.icon.borderColor==Point.extraLifeBorderColor;
    };

    //returns true if this point is an obstacle
    this.isObstacle = function(){
        return this.icon.color==Point.obstacleColor && this.icon.borderColor==Point.obstacleBorderColor;
    };

    this.removeFromPlay = function(){
        //move to out of bounds location and stop moving
        this.icon.x = 800;
        this.icon.y = 350;
        this.icon.speedX = 0;
        this.icon.speedY = 0;

        this.removed = true;
    };

}
Point.normalRadius = 7;
Point.normalBorder = 1;
Point.normalColor = "yellow";
Point.extraLifeRadius = 15;
Point.extraLifeBorder = 4;
Point.extraLifeColor = "#00E5EE";
Point.extraLifeBorderColor = "#CC00FF";
Point.obstacleRadius = 15;
Point.obstacleBorder = 4;
Point.obstacleColor = "#660000";
Point.obstacleBorderColor = "black";
Point.lifeSound = new Sound("sounds/extraLife.m4a", 1);
Point.scoreSound = new Sound("sounds/score.m4a", 1);
Point.touchSound = new Sound("sounds/touch.m4a", 1);
Point.missSound = new Sound("sounds/miss.m4a", 0.5);

function Goal(radius,x,y,color,borderColor,borderWidth){
    this.icon = new Circle(radius,x,y,color,borderColor,borderWidth);
    this.frameOfLastHit = 0;
    this.lightTime = 25; //frames (each frame is 20ms - 25*20ms = 0.5 seconds)
    this.currentPoint;

    this.resetColor = function() {
        if((frameCount - this.frameOfLastHit) == this.lightTime){
            //turn this goal back to yellow
            this.icon.color = "yellow";
            //and remove point from area to prevent double score errors
            this.currentPoint.removeFromPlay();
        }
    }
}

function Menu(width,height,backgroundColor,x,y,textColor,borderColour,borderWidth){
    this.borderColour = borderColour;
    this.borderWidth = borderWidth;
    //objects that make up my menu
    this.background = new Rectangle(width,height,backgroundColor,x,y);
    this.titleLine1 = new Text(this.background.x+20,this.background.y+50,"Colour",-1,textColor, 40);
    this.titleLine2 = new Text(this.background.x+30,this.background.y+80,"Collector ",-1,textColor, 40);
    this.levelText = new Text(this.background.x+20,this.background.y+175,"Level:  ",0,textColor, 30);
    this.scoreText = new Text(this.background.x+20,this.background.y+250,"Score: ",0,textColor, 30);
    this.lifeText = new Text(this.background.x+20,this.background.y+325,"Lives:  ",3,textColor, 30);
    this.difficulty = new Text(this.background.x+20,this.background.y+400,"Difficulty:",-1,textColor, 30);
    this.difficultyText = new Text(this.background.x+40,this.background.y+430,"Medium",-1,textColor, 30);//always start on medium difficulty
    this.highScoreText = new Text(this.background.x+20,this.background.y+500,"Personal",-1,textColor, 30);
    this.highScoreText2 = new Text(this.background.x+40,this.background.y+530,"Best: ",-1,textColor, 30);
    this.highScore = new Text(this.background.x+40,this.background.y+570,"",10000,textColor, 30);
    this.muteImage = new image(50,50,"images/mute.png",this.background.x+120,this.background.y+this.background.height-70,"icon");
    this.unmuteImage = new image(50,50,"images/unmute.png",this.background.x+120,this.background.y+this.background.height-70,"icon");
    this.playImage = new image(50,50,"images/play.png",this.background.x+20,this.background.y+this.background.height-70,"icon");
    this.pauseImage = new image(50,50,"images/pause.png",this.background.x+20,this.background.y+this.background.height-70,"icon");

    this.paint = function(){
        this.background.paint();

        //paint the side border on
        ctx.beginPath();
        ctx.moveTo(this.background.x, this.background.y);
        ctx.lineTo(this.background.x, this.background.height);
        ctx.lineWidth = this.borderWidth;
        ctx.strokeStyle = this.borderColour;
        ctx.stroke();

        //update the varibale values
        this.levelText.numValue = player.level;
        this.scoreText.numValue = player.score;
        this.lifeText.numValue = player.lives;

        //high score through local storage
        if (typeof(Storage) !== "undefined") {
            //retreve high score from local storage if possible
            if(difficulty.text=="Easy") this.highScore.numValue = localStorage.highScoreEasy;
            if(difficulty.text=="Medium") this.highScore.numValue = localStorage.highScoreMedium;
            if(difficulty.text=="Hard") this.highScore.numValue = localStorage.highScoreHard;
        } else {
            this.highScore.numValue = -1;//no number
            this.highScore.text = "No Local Storage";
        }

        //draw everything on the canvas
        this.titleLine1.paint();
        this.titleLine2.paint();
        this.levelText.paint();
        this.scoreText.paint();
        this.lifeText.paint();
        this.highScoreText.paint();
        this.highScoreText2.paint();
        this.highScore.paint();
        this.difficulty.paint();
        this.difficultyText.paint();
        if(paused){
            this.pauseImage.paint();
        }
        else{
            this.playImage.paint();
        }
        if(musicMuted){
            this.muteImage.paint();
        }
        else{
            this.unmuteImage.paint();
        }
    }
}

//!!This object was taken from W3Schools game tutorial!!
// with the exception of my own addition of the volume variable
function Sound(src, volume) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.volume = volume;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function(){
        this.sound.play();
    };
    this.stop = function(){
        this.sound.pause();
    };
}

function Text(x,y,text,numValue,color,size){
    this.x = x;
    this.y = y;
    this.text = text;
    this.numValue = numValue;
    this.color = color;
    this.size = size.toString() + "px Arial";

    this.paint = function(){
        ctx.font = this.size;
        ctx.fillStyle = this.color;
        //if there is no variable number value to append
        if(this.numValue == -1) {
            ctx.fillText(this.text, this.x, this.y);
        }
        else{
            ctx.fillText(this.text + this.numValue, this.x, this.y);
        }
    };
}

function Circle(radius, x, y, color, borderColor, borderWidth) {
    //object constructor upon first time construction
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.speedX = 0;
    this.speedY = 0;
    this.color = color;
    this.borderColor = borderColor;
    this.borderWidth = borderWidth;

    this.paint = function() {
        //paints this object with it's new values
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.lineWidth = this.borderWidth;
        ctx.strokeStyle = this.borderColor;
        ctx.stroke();
    };

    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
    };
}

//!! This object was taken from W3Schools Game Tutorial!!
function Rectangle(width, height, color, x, y) {
    //object constructor upon first time construction
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.color = color;

    this.paint = function() {
        //sets the canvas paint colour to the colour it needs to draw
        ctx.fillStyle = this.color;
        //paints this object with it's new values
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };

}

function image(width, height, src, x, y, imageType) {
    this.imageType = imageType;
    this.image = new Image();
    this.image.src = src;

    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;

    this.paint = function() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        if (this.imageType == "background") {
            //draw twice for background so it can scroll
            ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
        }
    };

    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.imageType == "background") {
            //if the background goes too far too the left
            if (this.x == -(this.width)) {
                //reset it so that it starts scrolling again
                this.x = 0;
            }
        }
    };
}