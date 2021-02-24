const { GRID_SIZE } = require('./constants');


class Player {
    constructor(id, username) {
        this.id = id;
        this.username = username;
        this.pos = {
            x: 3,
            y: 10,
        };
        this.vel = {
            x: 1,
            y: 0,
        };
        this.snake =  [
            {x: 1, y: 10},
            {x: 2, y: 10},
            {x: 3, y: 10},
        ];
        this.snakesize = 3;
        this.live = 1;
    }


    update(state) {
        var player = this
        player.pos.x += player.vel.x;
        player.pos.y += player.vel.y;

        if (player.pos.x < 0 || player.pos.x > GRID_SIZE || player.pos.y < 0 || player.pos.y > GRID_SIZE){
            player.live = 0; //player one is lost
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
        
        /*
        //lose if player hit his own body
        if (player.vel.x || player.vel.y) {
            for (let cell of player.snake) {
                if (cell.x === player.pos.x && cell.y === player.pos.y) {
                    player.live = 0; //the player is lose
                }
            }
    
            player.snake.push({ ...player.pos });
            player.snake.shift();
        }
        */

        
        //lose if player hit other players body
        if (player.vel.x || player.vel.y) {
            for (let clientid of Object.keys(state.players)){ //for each player's
                if (clientid !== player.id){ //if the client id is not the players
                    var eachplayer = state.players[clientid] 
                    for (let cell of eachplayer.snake) { //for each cell 
                        if (cell.x === player.pos.x && cell.y === player.pos.y) { 
                            player.live = 0; //the player is lose
                        }
                    }
                } else { 
                }
            }
    
            player.snake.push({ ...player.pos });
            player.snake.shift();
        }
    }

    //this method define the movement of a food eaten by snake
    randomFood(state, i) {
        //randomly replace a food around canvas when snake eat one of food
        state.food[i].x = Math.floor(Math.random() * GRID_SIZE);
        state.food[i].y = Math.floor(Math.random() * GRID_SIZE);
    
        //not to make sure food shown above snake
        for (let clientid of Object.keys(state.players)){ //for each player's
            var player = state.players[clientid]
            for (let cell of player.snake) { //for each cell 
                if (cell.x === state.food[i].x && cell.y === state.food[i].y) {
                    return this.randomFood(state, i);
                }
            }
        }
    }


    serializeForUpdate() {
        return {
          id: this.id,
          pos: this.pos,
          vel: this.vel,
          snake: this.snake,
          snakesize: this.snakesize,
        };
    }
}  
  
module.exports = Player;
