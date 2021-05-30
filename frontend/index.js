const BG_COLOR = '#231f20'
//randomly choose snake color from snake_color_array
const snake_color_array = ['#1E90FF', '#c2c2c2', '#EE0000', '#CC66FF', '#00DD00'];
const MY_SNAKE_COLOR = snake_color_array[Math.floor(Math.random() * snake_color_array.length)]
//const OTHER_SNAKE_COLOR = '#c2c2c2'
const FOOD_COLOR = '#e66916'


//////////////////change when testing localy //////////////////
//const socket = io('http://localhost:3000'); //url connect to in local
const socket = io('https://young-waters-66974.herokuapp.com/');  //url connect to heroku server
//////////////////////////////////////////////////////////

socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);

const gameScreen = document.getElementById('gameScreen');
const gameSnakeSizeDisplay = document.getElementById('gameSnakeSizeDisplay');
const gameSnakeNameDisplay = document.getElementById('gameSnakeNameDisplay');
const gameSnakefinalSizeDisplay = document.getElementById('gameSnakefinalSizeDisplay');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const retryScreen = document.getElementById('retryScreen');
const retryGameBtn = document.getElementById('retryGameButton');
const usernameInput = document.getElementById('username-input');
const reusernameInput = document.getElementById('reusername-input');
const leaderbord1user = document.getElementById('Number1user');
const leaderbord2user = document.getElementById('Number2user');
const leaderbord3user = document.getElementById('Number3user');
const leaderbord1score = document.getElementById('Number1score');
const leaderbord2score= document.getElementById('Number2score');
const leaderbord3score = document.getElementById('Number3score');
const gameRecorduser = document.getElementById('gameRecordUser');
const gameRecordSize = document.getElementById('gameRecordSize');

newGameBtn.addEventListener('click', newGame); //user's click initiate the function newGame
retryGameBtn.addEventListener('click', retryGame); //when user click retry button 

function newGame(){
  socket.emit('newGame', JSON.stringify({
    "username" : usernameInput.value,
    "usercolor" : MY_SNAKE_COLOR
  }));
  init();
}

function retryGame(){
  socket.emit('retryGame', JSON.stringify({
    "username" : reusernameInput.value,
    "usercolor" : MY_SNAKE_COLOR
  }));
  init();
}


let canvas, ctx;  
  
function init(){
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";
    retryScreen.style.display = "none";

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600; //canvas size

    ctx.fillStyle = BG_COLOR; //back ground color
    ctx.fillRect(0, 0, canvas.width, canvas.height); //where the color is filled : from (x, y) = (0, 0) width 800 height 800 

    document.addEventListener('keydown', keydown); //listen the key code 
}

function keydown(e){
    /*
    console.log(e.keyCode);
    */
    socket.emit('keydown', e.keyCode);
}


function paintGame(state){
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height); //fill back ground clour again because the init() is just the initial status not continuous 

    // get each state_list from gameState
    const food = state.food; 
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize; 

    //fill the food color. the food is only one cell.
    paintFood(food, size, FOOD_COLOR);

    //paint me
    paintPlayer(state.me, size, state.me.color)

    //paint all others
    for (let key of Object.keys(state.others)){
      //fill the player(snake) color. the snake color depends on the number of cell.
      paintPlayer(state.others[key], size, state.others[key].color); 
    }
    
    //show snakesize under the canvas
    gameSnakeSizeDisplay.innerText = state.me.snakesize; 
    gameSnakeNameDisplay.innerText = state.me.name; 

    //show leaderbord 
    //get key array of topplayers
    topkeyarray = Object.keys(state.top);
    leaderbord1user.innerText = state.top[topkeyarray[0]].username;
    leaderbord1score.innerText = state.top[topkeyarray[0]].size;

    if(topkeyarray[1] !== undefined){
      leaderbord2score.innerText = state.top[topkeyarray[1]].size;
      leaderbord2user.innerText = state.top[topkeyarray[1]].username;
    }else{
      leaderbord2score.innerText = null;
      leaderbord2user.innerText = null;
    };

    if(topkeyarray[2] !== undefined){
      leaderbord3score.innerText = state.top[topkeyarray[2]].size;
      leaderbord3user.innerText = state.top[topkeyarray[2]].username;
    }else{
      leaderbord3score.innerText = null;
      leaderbord3user.innerText = null;
    };

    gameRecorduser.innerText = state.record.username;
    gameRecordSize.innerText = state.record.size;    

}

//paint each food 
function paintFood(foodState, size, color){

  ctx.fillStyle = color;
  for (let food of foodState){
    ctx.fillRect(food.x * size, food.y * size, size, size);
  }
}

//paint each player
function paintPlayer(playerState, size, color){
    const snake = playerState.snake;

    ctx.fillStyle = color;
    for (let cellid of Object.keys(snake)){
        ctx.fillRect(snake[cellid].x * size, snake[cellid].y * size, size, size);
    }
}

/*
paintGame(gameState);
*/

function handleGameState(gameState){
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(gameState){
  initialScreen.style.display = "none";
  gameScreen.style.display = "none";
  retryScreen.style.display = "block";

  gameSnakefinalSizeDisplay.innerText = gameState.me.snakesize

  //alert("GAME OVER !! Your length was " + snak
}

