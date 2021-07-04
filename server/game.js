const { GRID_SIZE } = require('./constants');
const { FRAME_RATE } = require('./constants'); //import FRAME rate frome game.js file
const Player = require('./player');


class Game {
  constructor() {
    this.sockets = {};
    this.players = {};
    this.state = {}; 
    this.topplayers = {};
    this.gamerecord = {
      username: "tkok",
      size: 100,
    };
    setInterval(this.update.bind(this), 1000 / FRAME_RATE);
  }


  //this method is trigarred when user push "start game" button and create player instance for the new user
  addPlayer(client, username, usercolor){
    // add "sockets" array [key:client.id, value: client]. client is socket from client. It includes data about socket(e.g. socketid)
    this.sockets[client.id] = client;

    //add "players" array [key: client.id, value: Player_instance_for_the_client]. "players" array has all players' all info (e.g. username, location, length)
    this.players[client.id] = new Player(client.id, username, usercolor);
  }


  update(){

    // Update each player
    Object.keys(this.sockets).forEach(playerID => {
      const player = this.players[playerID];
      player.update(this.state);

      //add or insert updated snakesize topplayers array [key: username, value: snakesize]
      this.topplayers[playerID] = {
        username: player.username,
        size: player.snakesize,
      };
    });

    //Update state. 
    //state.players is used for detecting collision between each players
    this.state.players = this.players;

    //Arrange topplayers objects in decending order
    //topplayers is not array so change to array once and sort and back to object
    //change topplayers object to array
    var topplayers_array = Object.keys(this.topplayers).map((k)=>({ socketid: k, username: this.topplayers[k].username, size: this.topplayers[k].size }));
    //sort array
    topplayers_array.sort((a, b) =>  b.size - a.size);
    //back to object so that it can be removed by using socketid after gameover
    this.topplayers = Object.assign({}, ...topplayers_array.map((item) => ({
      [item.socketid]: {
        username: item.username,
        size: item.size,
      },
    })));

    //update gamerecord status
    if(topplayers_array[0] !== undefined){
      if(topplayers_array[0].size > this.gamerecord.size){
        this.gamerecord.username = topplayers_array[0].username;
        this.gamerecord.size = topplayers_array[0].size;
      };
    //console.log(this.gamerecord.size);
    };
  
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
      var x = Math.floor(getRandomArbitrary(0.2, 0.8) * GRID_SIZE);
      var y = Math.floor(getRandomArbitrary(0.2, 0.8) * GRID_SIZE);

      function getRandomArbitrary(min, max) {
          return Math.random() * (max - min) + min;
      }

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
    delete this.topplayers[socket.id];
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
      top: Object.keys(this.topplayers).map((k)=>({ socketid: k, username: this.topplayers[k].username, size: this.topplayers[k].size })),
      record: this.gamerecord,
    };
  }

}

module.exports = Game


  

    


