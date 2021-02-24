const { GRID_SIZE } = require('./constants');
const { FRAME_RATE } = require('./constants'); //import FRAME rate frome game.js file
const Player = require('./player');


class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.state = {}; 
    setInterval(this.update.bind(this), 1000 / FRAME_RATE);
  }


  //this method is trigarred when user push "start game" button and create player instance for the new user
  addPlayer(client, username){
    // add "sockets" array [key:client.id, value: client]. client is socket from client. It includes data about socket(e.g. socketid)
    this.sockets[client.id] = client;

    //add "players" array [key: client.id, value: Player_instance_for_the_client]. "players" array has all players' all info (e.g. username, location, length)
    this.players[client.id] = new Player(client.id, username);
  }


  update(){

    // Update each player
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
      player.update(this.state);
    });

    //Update state. 
    //state.players is used for detecting collision between each players
    this.state.players = this.players;
  
    // Check if any players are dead and if alive send player status to each player 
    Object.keys(this.sockets).forEach(playerID => {
      const socket = this.sockets[playerID];
      const player = this.players[playerID];
      
      //if the player is alive send 'gameOver' event and update to the player
      if (player.live == 1) {
        socket.emit('gameState', this.createUpdate(player));
      };

      //if the player is dead send 'gameOver' event and update to the player
      if (player.live == 0) {
        socket.emit('gameOver', this.createUpdate(player));
        this.removePlayer(socket);
      };
    });
  }


  //this method is only for initial food state
  randomAllFood(state) {
    //randomize every food
    for(let food of state.food){
      food = randomEachFood(state); //fill in food.x and food.y with random value but it should not on players body
    }

    //set each food position
    function randomEachFood(state){
      var x = Math.floor(Math.random() * GRID_SIZE);
      var y = Math.floor(Math.random() * GRID_SIZE);

      //check if the food is on snake body, and if it is on, randomize food again
      for (let clientid of Object.keys(state.players)){ //for each player's
      var player = state.players[clientid]
        for (let cell of player.snake) { //for each cell 
          if (cell.x === x && cell.y === y) { //if the food is on snake
            return randomEachFood(state); //randomize again
          }
        }
      }
      return {x, y};
    }
  }

  removePlayer(socket) {
    delete this.sockets[socket.id];
    delete this.players[socket.id];
  }

  //this method define the how much velocity server update after the arrow key pushed
  getUpdatedVelocity(keyCode) {
      switch (keyCode) {
        case 37: { // left
          return { x: -1, y: 0 };
        }
        case 38: { // down
          return { x: 0, y: -1 };
        }
        case 39: { // right
          return { x: 1, y: 0 };
        }
        case 40: { // up
          return { x: 0, y: 1 };
        }
      }
  }

  createGameState(){
    return {
        players: this.players,
        food: [
            {x : 7, y : 7},
            {x : 10, y : 10},
            {x : 15, y : 15},
            {x : 19, y : 26},
            {x : 19, y : 18},
        ],
        gridsize: GRID_SIZE,
    };
  }

  createUpdate(player) {
    const OtherPlayers = Object.values(this.players).filter(
      p => p !== player,
    );

    return {
      me: player.serializeForUpdate(),
      others: OtherPlayers.map(p => p.serializeForUpdate()),
      food: this.state.food,
      gridsize: GRID_SIZE,
    };
  }

  
/*
  //this method send updated players status to client. Heart beat for this game.
  startGameInterval(client, state){
    const intervalID = setInterval(() => {
        const winner = this.gameLoop(state);

        if (!winner){
            client.emit('gameState', state); //if client doesn't win or lose, server send client state in Frame_Rate interval
        } else {
            client.emit('gameOver', state);
            delete this.players[client.id];
            clearInterval(intervalID); // no longer send game state to client because he is gameover
        }
    }, 1000 / FRAME_RATE);
  }
*/

/*
  //this method define the movement and live status of snake
  gameLoop(state){
    if (!state){
          return;
    }
      
    //update each player status 
    for (let clientid of Object.keys(state.players)){
      var player = state.players[clientid]
      player.pos.x += player.vel.x;
      player.pos.y += player.vel.y;

      if (player.pos.x < 0 || player.pos.x > GRID_SIZE || player.pos.y < 0 || player.pos.y > GRID_SIZE){
          return 2; //player one is lost
      }

      //when snake eat food the length increase by one
      var i = 0 //i is the index number of food in state.food
      for(let food of state.food){
          if (food.x === player.pos.x && food.y === player.pos.y) {
              player.snake.push({ ...player.pos });
              player.pos.x += player.vel.x;
              player.pos.y += player.vel.y;
              player.snakesize += 1; //count the legth of the snake
              this.randomFood(state, i); //send i to identify which food should be randmize
          }
          i = i + 1 //add index number
      }

      //lose if player hit his own body
      if (player.vel.x || player.vel.y) {
          for (let cell of player.snake) {
            if (cell.x === player.pos.x && cell.y === player.pos.y) {
              return 2; //the player is lose
            }
          }
      
          player.snake.push({ ...player.pos });
          player.snake.shift();
      }
    }

  }
*/

}

module.exports = Game


  

    


