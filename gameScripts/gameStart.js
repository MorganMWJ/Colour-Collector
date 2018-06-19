var canvas;
var ctx;
var frameCount;
var interval;
var gameWindow;

//mouse control variables
var mouseX;
var mouseY;
var mouseNotCurrentlyOverPlayer;

//key control variables
var alternateControl;
var currentKeys = [];

//game states
var started;
var gameOver;
var paused;
var musicMuted;

//game difficulty object (holds values dependant on difficulty)
var difficulty;

//game music
var music;

//game items to be drawn
var player;
var menu;
var points = [];
var pointsAvailable;
var goals = [];
var arena;
var background;


function start(){
    canvas = document.getElementById("ctx");
    ctx = canvas.getContext("2d");
    gameWindow = {
        width : canvas.width - 200,
        height : canvas.height,
        x : 0,
        y : 0
    };

    window.addEventListener('mousemove', function (e) {
        //used to get mouse position on canvas not on screen
        var rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        alternateControl = false;
    });

    window.addEventListener('mousedown', function (e) {
        //only listen for mouse clicks if not started
        if(!started) {
            //used to get mouse position on canvas not on screen
            var rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            if ((mouseX > 0 && mouseX < 700) && (mouseY > 0 && mouseY < 700)) {
                started = true;
                if (!musicMuted) {
                    music.play();
                }
            }
        }
    });


    window.addEventListener('keydown', function (e) {
        //esc - pause
        if(e.keyCode == 27){
            togglePause();
        }
        //m - music
        if(e.keyCode == 77){
            toggleMusic();
        }
        //r - restart
        if(e.keyCode == 82){
            restart();
        }
        //1 - easy difficulty
        if(e.keyCode == 49){
            if(!started || confirm("Changing difficulty requires the game to restart at level one, to prevent you cheating your score. Change Difficulty?")) setEasyDifficulty();
        }
        //2 - medium difficulty
        if(e.keyCode == 50){
            if(!started || confirm("Changing difficulty requires the game to restart at level one, to prevent you cheating your score. Change Difficulty?")) setMediumDifficulty();
        }
        //3 - hard difficulty
        if(e.keyCode == 51){
            if(!started || confirm("Changing difficulty requires the game to restart at level one, to prevent you cheating your score. Change Difficulty?")) setHardDifficulty();
        }
        //directional keys
        if(e.keyCode == 38 || e.keyCode == 40 || e.keyCode == 37 || e.keyCode == 39){
            //prevents scrolling from arrow keys
            e.preventDefault();

            currentKeys[e.keyCode] = true;
            alternateControl = true;
        }

    });

    window.addEventListener('keyup', function (e) {
        currentKeys[e.keyCode] = (e.type == "keydown");
        if(e.keyCode == 38 || e.keyCode == 40){
            player.icon.speedY = 0;
        }
        if(e.keyCode == 37 || e.keyCode == 39){
            player.icon.speedX = 0;
        }
    });

    //start background music
    music = new Sound("sounds/gameTune.wav", 0.2);

    //set to loop
    music.sound.addEventListener('ended', function() {
        this.play();
    }, false);

    //set up background objects
    goals.push(new Goal(80,0,0,"yellow","blue",5));
    goals.push(new Goal(80,0,700,"yellow","blue",5));
    goals.push(new Goal(80,700,0,"yellow","blue",5));
    goals.push(new Goal(80,700,700,"yellow","blue",5));

    menu = new Menu(200,700,"#CDC5BF",700,0,"black","black",5);
    arena = new Circle(250,350,350,"red","#003300",10);
    background =  new image(gameWindow.width, gameWindow.height, "images/diamond.jpg", 0, 0, "background");

    //set up player object with starting variables
    player = new Player();

    //game not over at start
    gameOver = false;

    //game hasnt started until the screen is clicked
    started = false;

    //game starts on medium
    setMediumDifficulty();

    //number of points to collect starts at zero
    pointsAvailable = 0;

    //start frame counting from 0
    frameCount = 0;

    //set main interval function
    interval = setInterval(gameUpdate,20);
    
}