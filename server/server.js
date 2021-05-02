const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    //origin: "http://127.0.0.1:8080",
    origin: "https://stoic-jackson-807da6.netlify.app/",
    methods: ["GET", "POST"],
  }
});

const Game = require('./game'); //import gamestate from game.js file

const game = new Game();

//what server communication with client
io.on('connection', client => {
    game.state = initGame();

    //server have to listen client side action
    client.on('keydown', handleKeydown); 
    client.on('newGame', handleNewGame);
    client.on('retryGame', handleRetryGame);

    //we want to access client so we define function inline
    function handleKeydown(keyCode) {
        try {
          keyCode = parseInt(keyCode);
        } catch(e) {
          console.error(e);
          return;
        }
    
        const vel = game.getUpdatedVelocity(keyCode);

        try {
        if (vel) {
          game.state.players[this.id].vel = vel;
        }
        } catch(e) {
          return;
        }
    }

    function handleNewGame(username){
      game.addPlayer(client, username); //add user to players array [key: clientid, value: player()]
      //game.startGameInterval(client, state); //set Interval for updating status
    }

    //everytime user start game the food state is random
    function initGame(){
      const state = game.createGameState();
      game.randomAllFood(state);
      return state;
    }
      

    function handleRetryGame(username){
      game.addPlayer(client, username);
    }

});

io.listen(process.env.PORT || 3000);