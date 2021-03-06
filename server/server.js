const httpServer = require("http").createServer();

//////////////////change when testing localy //////////////////
const io = require("socket.io")(httpServer, {
  cors: {
    //origin: "http://127.0.0.1:8080",
    origin: "https://stoic-jackson-807da6.netlify.app",
    //origin: "*",
    methods: ["GET", "POST"],
  }
});
//////////////////////////////////////////////////////////


const Game = require('./game'); //import gamestate from game.js file

const game = new Game();

//what server communication with client
io.on('connection', client => {

    //check whether the game is started or not
    if (!Object.keys(game.sockets).length){
      game.state = initGame();
    };

    var client_ip_address = client.request.connection.remoteAddress;
    console.log(client_ip_address);

    //server have to listen client side action
    client.on('keydown', handleKeydown);
    client.on('stickmove', handleStickmove); 
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

    function handleStickmove(xy) {
      //get joystick movement from mobile apps. xy is like (-1, 0)
      const vel = JSON.parse(xy);
      console.log(vel)

      try {
      if (vel) {
        game.state.players[this.id].vel = vel;
      }
      } catch(e) {
        return;
      }
  }

    function handleNewGame(userinfo){
      parsed_userinfo = JSON.parse(userinfo);
      
      game.addPlayer(client, parsed_userinfo.username, parsed_userinfo.usercolor); //add user to players array [key: clientid, value: player()]
      console.log(parsed_userinfo.username);
    }

    //everytime user start game the food state is random
    function initGame(){
      const state = game.createGameState();
      game.randomAllFood(state);
      return state;
    }
      

    function handleRetryGame(userinfo){
      parsed_userinfo = JSON.parse(userinfo);
      //console.log(parsed_userinfo);
      game.addPlayer(client, parsed_userinfo.username, parsed_userinfo.usercolor);
    }

});

io.listen(process.env.PORT || 3000);