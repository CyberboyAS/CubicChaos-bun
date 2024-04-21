const keys = require('./config/keys.js');

/*
//Setting up DB
const mongoose = require('mongoose');
mongoose.connect(keys.mongoURI, {useNewUrlParser: true, useUnifiedTopology: true});

//DB Models
require('./model/Player.js');
require('./model/Game.js');
*/

var sockets = {};//On fait un dictionary, je pense que c'est plus adapté
var socketNextId = 0;//Sera aussi l'id du joueur

var gameNextId = 0;
var games = [];
var players = [];

var buttons = [];



/*
const WebSocket = require('ws');
const wss = new WebSocket.Server({port: 8089},()=>{
    console.log('server started');
});
*/

const path = require('path');
const express = require('express');
const app = express();
const ws = require('ws');

app.use(express.static(__dirname + "/../client/"));
//console.log(__dirname);

app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,"/../client/index.html"));
});

const server = app.listen(8090);
const wss = new ws.Server({ server });


wss.on('listening',()=>{
    console.log('server is listening on port 8090');
});


wss.on('connection',function connection(ws){
    
    //THis script is called immediately when the connection with the client is made
    console.log('a player has connected!');
    sockets[socketNextId] = ws;
    const ownClientId = socketNextId;
    let ownGameId = "";
    socketNextId++;
    console.log("UPDATED SOCKETS:");
    console.log(sockets);
    /*
    ws.on('open',()=>{
        console.log('a player has connected!');
        sockets[socketNextId] = ws;
        socketNextId++;
        console.log(sockets);
    });
    */

    ws.on('message',(data)=>{
        //console.log(`data received ${data}`);
        //console.log("data received "+data);
        //console.log(players);

        let isJson = true;
        try{
            var jsonData = JSON.parse(data);
        }
        catch (err){
            console.error(err);
            isJson = false;
        }

        if(isJson){
            //console.log("OUI: Le message reçu par le client est un JSON");
            
            
            if(jsonData.wsTitle == "findOrCreateGame"){
                console.log("Client asks to find or create a game (and be part of it)...");
                console.log(games);
                //Variable to know if there is an available game
                let aux = false;
                let attributedCharacter = "1";
                let shouldGameStart = false;


                //Search available game

                console.log("- Entering forEach function -");
                games.forEach((game) => {
                    console.log(game.id);

                    if(game.levelId == jsonData.levelId){
                        if(("idPlayer1" in game) && ("idPlayer2" in game) && ("idPlayer3" in game)){
                            console.log("Game already full");
                        }else{

                            console.log("Adding player to game");

                            if(!("idPlayer1" in game)){
                                game.idPlayer1 = ownClientId;
                                ownGameId = game.id;
                                //attributedCharacter = "1"; // inutile?
                            }else if(!("idPlayer2" in game)){
                                game.idPlayer2 = ownClientId;
                                ownGameId = game.id;
                                attributedCharacter = "2";
                            }else if(!("idPlayer3" in game)){
                                game.idPlayer3 = ownClientId;
                                ownGameId = game.id;
                                attributedCharacter = "3";
                            }

                            aux = true;

                            console.log("Est-ce que le lobby est complet ?");
                            if(("idPlayer1" in game) && ("idPlayer2" in game) && ("idPlayer3" in game)){
                                console.log("OUI");
                                for(const [key, socket] of Object.entries(sockets)){
                                    if((key==game.idPlayer1) || (key==game.idPlayer2) || (key==game.idPlayer3)){
                                        
                                        console.log(`Sending startLevel to socket[${key}]`);

                                        let jsonResponse = {};
                                        jsonResponse.wsTitle = "startLevel";
                                        jsonResponse.levelId = game.levelId;

                                        socket.send(JSON.stringify(jsonResponse));
                                        //console.log(JSON.stringify(jsonResponse));
                                    }
                                }
                            }else{
                                console.log("NON");
                            }

                            console.log("about to return...");
                            return;
                            console.log("you shouldn't see this message.");

                        }
                    }
                });
                console.log("- End forEach function -");

                /*
                console.log("- Entering every function -");
                games.every((game)=>{
                    console.log(game.id);
                    if(game.levelId == jsonData.levelId){
                        //Passer au prochain élément si on ne peut rien tirer de cette game
                        if(("idPlayer1" in game) && ("idPlayer2" in game) && ("idPlayer3" in game)){
                            console.log("TRUC");
                            console.log("TRUC");
                            console.log("TRUC");
                            console.log("TRUC");
                            console.log("TRUC");
                            console.log("TRUC");
                            console.log("TRUC");
                            console.log("TRUC");
                            console.log("TRUC");
                            console.log("TRUC");
                            console.log("TRUC");
                            console.log("TRUC");
                            console.log("TRUC");
                            console.log("TRUC");
                            console.log("TRUC");
                            console.log("TRUC");
                            console.log("TRUC");
                            return false;
                        }
                        
                        console.log("-TurC");
                        console.log("-TurC");
                        console.log("-TurC");
                        console.log("-TurC");
                        console.log("-TurC");
                        console.log("-TurC");
                        console.log("-TurC");
                        console.log("-TurC");

                        if(!("idPlayer1" in game)){
                            game.idPlayer1 = ownClientId;
                            aux = true;
                            ownGameId = game.id;
                            //attributedCharacter = "1";//inutile?
                            //return false;
                        }else if(!("idPlayer2" in game)){
                            game.idPlayer2 = ownClientId;
                            aux = true;
                            ownGameId = game.id;
                            attributedCharacter = "2";
                            //return false;
                        }else if(!("idPlayer3" in game)){
                            game.idPlayer3 = ownClientId;
                            aux = true;
                            ownGameId = game.id;
                            attributedCharacter = "3";
                            //return false;
                        }

                        
                        aux = true;

                        //Ensuite, si la game est complète, on multicast
                        console.log("Est-ce que le lobby est complet ?");
                        if(("idPlayer1" in game) && ("idPlayer2" in game) && ("idPlayer3" in game)){
                            console.log("OUI");
                            shouldGameStart = true;
                            //J'ai mis cette variable pour déplacer ce code si nécessaire
                            
                            //if(shouldGameStart){    
                            //sockets.forEach((key,socket) => {
                            for(const [key, socket] of Object.entries(sockets)){
                                if((key==game.idPlayer1) || (key==game.idPlayer2) || (key==game.idPlayer3)){
                                    
                                    console.log("yes");

                                    let jsonResponse = {};
                                    jsonResponse.wsTitle = "startLevel";
                                    //jsonResponse.ownPlayerId = key;
                                    //jsonResponse.ownGameId = ownGameId;
                                    //jsonResponse.attributedCharacter = attributedCharacter;
                                    jsonResponse.levelId = game.levelId;

                                    socket.send(JSON.stringify(jsonResponse));

                                    //console.log(JSON.stringify(jsonResponse));
                                }
                            }
                            //});
                            //}
                        }else{
                            console.log("NON");
                        }
                        return false;
                    }
                    return true;
                });
                */
                
                console.log(games);
                //If there was no available game
                if(aux == false){
                    //Create a game
                    var newGame = {
                        id: gameNextId,
                        levelId: jsonData.levelId,
                        arrivalsToGo: 3,
                        stars: 0,
                        idPlayer1: ownClientId//Add the player to that game
                    };

                    if(jsonData.levelId=="1"){

                        //On peut créer les plateformes mouvantes ici
                        var button0 = {
                            buttonName: "Button0",
                            gameId: gameNextId,
                            activated: false
                        };
                        buttons.push(button0);
                        var button1 = {
                            buttonName: "Button1",
                            gameId: gameNextId,
                            activated: false
                        };
                        buttons.push(button1);
                        var button2 = {
                            buttonName: "Button2",
                            gameId: gameNextId,
                            activated: false
                        };
                        buttons.push(button2);
                        var button3 = {
                            buttonName: "Button3",
                            gameId: gameNextId,
                            activated: false
                        };
                        buttons.push(button3);
                        
                    }

                    ownGameId = newGame.id;
                    gameNextId+=1;
                    games.push(newGame);
                }
                
                var newPlayer = {};
                //Create a player
                if((jsonData.levelId=="1")||(jsonData.levelId=="2")||(jsonData.levelId=="3")){
                    
                    newPlayer = {
                        id: ownClientId,
                        posX: 37,
                        posY: "-2.61",
                        characterVelocity: "0.0",
                        flipX: false,
                        isJumping: false,
                        isCrushed: false,
                        crushedNot: false,
                        arrived: false//dans le client, si (data.arrived==true) { alpha=0 ou z=-100 en gros }
                    };

                }else{

                    newPlayer = {
                        id: ownClientId,
                        posX: 0,
                        posY: 0,
                        characterVelocity: "0.0",
                        flipX: false,
                        isJumping: false,
                        isCrushed: false,
                        crushedNot: false,
                        arrived: false//dans le client, si (data.arrived==true) { alpha=0 ou z=-100 en gros }
                    };

                }
                players.push(newPlayer);

                console.log(games);

                
                let jsonResponse = {};
                jsonResponse.wsTitle = "attributedGame";
                jsonResponse.ownPlayerId = ownClientId;
                jsonResponse.ownGameId = ownGameId;
                jsonResponse.attributedCharacter = attributedCharacter;
                ws.send(JSON.stringify(jsonResponse));
                
                //On enverra ces données quand les joueurs le demanderont au start du level
                console.log(players);

                console.log("ownClientId = "+ownClientId);
                console.log("ownGameId = "+ownGameId);
                
                /*
                games.forEach((game)=>{
                    if(!("idPlayer1" in game)){
                        game.idPlayer1 = ownClientId;
                    }else if(!("idPlayer2" in game)){
                        game.idPlayer2 = ownClientId;
                    }else if(!("idPlayer3" in game)){
                        game.idPlayer3 = ownClientId;
                    }
                });
                */
            }else if(jsonData.wsTitle == "selfPlayerPos"){
                //console.log("Player position received...");
                //Traiter la data (transfert vers BD)
                
                games.forEach((game)=>{
                    //console.log("All games : ", games);
                    //Traiter seulement les joueurs de la même partie
                    if(game.id==ownGameId){//Remplacer par la requête MongoDB adéquate
                        //console.log(`Correct game[${game.id}] in loop`);
                        //console.log(game);
                        
                        players.forEach((player)=>{
                            //console.log(`Player[${player.id}] in loop`);
                            //console.log(player);
                            //console.log(players);
                            //console.log(player.id);
                            //console.log(jsonData.selfPlayerId);
                            if(player.id==ownClientId){
                                //console.log(`Player[${player.id}] found`);
                                /*
                                console.log(`player.posX : ${player.posX}`);
                                console.log(`player.posY : ${player.posY}`);
                                console.log(`jsonData.posX : ${jsonData.posX}`);
                                console.log(`jsonData.posY : ${jsonData.posY}`);
                                */
                                player.posX=jsonData.posX;
                                player.posY=jsonData.posY;
                                player.characterVelocity=jsonData.characterVelocity;
                                player.flipX=jsonData.flipX;
                                player.isJumping=jsonData.isJumping;
                                /*
                                player.isCrushed=jsonData.isCrushed;
                                player.crushedNot=jsonData.crushedNot;
                                */
                                //console.log("posX and posY acknowledged...");
                            }else if((player.id==game.idPlayer1) || (player.id==game.idPlayer2) || (player.id==game.idPlayer3)){
                                //console.log("Other player...");
                                //console.log("Preparing data to be sent to client...");
                                

                                let jsonResponse = JSON.parse(JSON.stringify(player));
                                jsonResponse.wsTitle = "otherPlayerPos";
                                let attributedCharacter = "1";
                                if(game.idPlayer1==player.id){
                                    //attributedCharacter = "1";//inutile?
                                }else if(game.idPlayer2==player.id){
                                    attributedCharacter = "2";
                                }else if(game.idPlayer3==player.id){
                                    attributedCharacter = "3";
                                }
                                jsonResponse.attributedCharacter = attributedCharacter;
                                /*
                                let attributedCharacter = "1";
                                if(game.idPlayer1==ownClientId){
                                    //attributedCharacter = "1";//inutile?
                                }else if(game.idPlayer2==ownClientId){
                                    attributedCharacter = "2";
                                }else if(game.idPlayer3==ownClientId){
                                    attributedCharacter = "3";
                                }e
                                jsonResponse.attributedCharacter = attributedCharacter;
                                */
                                //Very important pour que le client comprenne
                                
                                
                                /*
                                console.log("- JsonResponse -");
                                console.log(`Sending to player/socket[ ${ownClientId} ] the response :`);
                                console.log(jsonResponse);
                                */
                                
                                //ws.send(toString(jsonResponse));
                                ws.send(JSON.stringify(jsonResponse));
                                //console.log("Sent data from player{id: "+player.id+"}");
                                //console.log(jsonResponse);
                            }
                        });
                    }
                });
                /*
                console.log("Player position received...");
                //Traiter la data (transfert vers BD)
                players.forEach((player)=>{
                    //console.log(player);
                    games.forEach((game)=>{
                        //Traiter seulement les joueurs de la même partie
                        if(game.id==jsonData.selfGameId){//Remplacer par la requête MongoDB adéquate
                            console.log(game);
                            if(player.id==jsonData.selfPlayerId){
                                //console.log("Player found");
                                player.posX=jsonData.posX;
                                player.posY=jsonData.posY;
                                //console.log("posX and posY acknowledged...");
                            }else{
                                //console.log("Other player...");
                                //console.log("Preparing data to be sent to client...");
                                let jsonResponse = player;
                                jsonResponse.wsTitle = "otherPlayerPos";
                                jsonResponse.attributedCharacter = attributedCharacter;
                                //Very important pour que le client comprenne
                                //console.log(jsonResponse);
                                //ws.send(toString(jsonResponse));
                                ws.send(JSON.stringify(jsonResponse));
                                //console.log("Sent data from player{id: "+player.id+"}");
                            }
                        }
                    });
                });
                */
                //console.log("Player position updated.");
                //console.log("Data sent to client.");
                //console.log("OPERATION SUCCESSFUL");

            }else if(jsonData.wsTitle == "gotKey"){
                
                console.log("> player go key in game "+ownGameId);
                
                games.forEach((game) => {
                    if(game.id==ownGameId){
                        game.stars = 1;
                    }
                });

            }else if(jsonData.wsTitle == "playerArrived"){
                
                console.log("> playerArrived");
                
                for(let i=0;i<players.length;i++){
                    if(players[i].id==jsonData.selfPlayerId){
                        players[i].arrived = true;
                        break;//pour la perf
                    }
                }

                //Trouver la bonne game
                for(let i=0;i<games.length;i++){
                    if(games[i].id==jsonData.selfGameId){
                        //La bonne game
                        
                        games[i].arrivalsToGo -= 1;
                        console.log(games[i].arrivalsToGo);
                        
                        
                        console.log("Est-ce que la game doit se terminer ?");
                        if(games[i].arrivalsToGo<=0){

                            
                            console.log("Let's end the game");

                            //MULTICAST --> endGame
                            //Le serveur détecte si la game est terminée ou non
                            
                            //Cela va déclencher Destroy(WSManager)
                            

                            for(const [key, value] of Object.entries(sockets)){
                                //Les clients concernés
                                if((games[i].idPlayer1==key) || (games[i].idPlayer2==key) || (games[i].idPlayer3==key)){
                                    let jsonResponse = {};
                                    jsonResponse.wsTitle = "endGame";
                                    jsonResponse.stars = games[i].stars;
                                    /*
                                    let attributedCharacter = "1";
                                    if(games[i].idPlayer2==key){
                                        attributedCharacter = "2";
                                    }
                                    if(games[i].idPlayer3==key){
                                        attributedCharacter = "3";
                                    }
                                    */
                                    //Ce que ce message provoque :
                                    //WS_Client gameobject est bien supprimé
                                    // (retirer leur socket se fera automatiquement)
                                    value.send(JSON.stringify(jsonResponse));
                                }
                            }
                        }else{
                            //On dit au client qui vient de arrive à la door que la partie n'est pas terminée
                            //mais qu'il est bien caché et qu'il peut ressortir avec pressanykey
                            let jsonResponse = {};
                            jsonResponse.wsTitle = "arrivedButNotEndGame";
                            ws.send(JSON.stringify(jsonResponse));//Réponse au client concerné seulement
                        }

                        break;

                    }
                }

            }else if(jsonData.wsTitle == "playerNotArrived"){

                console.log("> playerNotArrived");

                for(let i=0;i<players.length;i++){
                    if(players[i].id==jsonData.selfPlayerId){
                        players[i].arrived = false;
                        break;//encore pour la perf
                    }
                }

                //Trouver la bonne game
                for(let i=0;i<games.length;i++){
                    if(games[i].id==jsonData.selfGameId){
                        //La bonne game
                        
                        games[i].arrivalsToGo += 1;
                        console.log(games[i].arrivalsToGo);

                        break;

                    }
                }

            }/*else if(jsonData.wsTitle == "endGame"){
                //Si le client a détecté que game.arrivalsToGo<=0
                
            }*/else if(jsonData.wsTitle == "activateButton"){

                //console.log("activateButton ["+jsonData.buttonName+"]");
                for(let i=0;i<buttons.length;i++){
                    if(buttons[i].gameId==jsonData.selfGameId){
                        //console.log("activation du bouton dans la liste");
                        buttons[i].activated = true;

                        for(let j=0;j<games.length;j++){
                            if(games[j].id==jsonData.selfGameId){
                                //La bonne game
                                
                                //console.log("la game du bouton");
                                for(const [key, value] of Object.entries(sockets)){
                                    //console.log("socket => "+key);
                                    //console.log(games[j].idPlayer1);
                                    if((key==games[j].idPlayer1) || (key==games[j].idPlayer2) || (key==games[j].idPlayer3)){
                                        
                                        //console.log("une websocket concernée : "+key);

                                        //actualisation : il faut le MultiCast ! (y compris au joueur qui envoie l'info)
                                        let jsonResponse = {};
                                        jsonResponse.wsTitle = "updateButton";
                                        jsonResponse.buttonName = jsonData.buttonName;
                                        jsonResponse.activated = buttons[i].activated;
                                        console.log(jsonData);
                                        console.log(jsonResponse);
                                        /*
                                        if(buttons[i].buttonName=="Button0"){
                                            jsonResponse.isMoving = buttons[i].activated;
                                        }else{
                                            jsonResponse.isPlayerOnButton = buttons[i].activated;
                                        }
                                        */
                                        value.send(JSON.stringify(jsonResponse));
                                    }
                                }

                                break;
                            }
                        }

                        break;//pour la perf
                    }
                }

            }else if(jsonData.wsTitle == "deactivateButton"){

                for(let i=0;i<buttons.length;i++){
                    if(buttons[i].gameId==jsonData.selfGameId){
                        
                        buttons[i].activated = false;

                        for(let j=0;j<games.length;j++){
                            if(games[j].id==jsonData.selfGameId){
                                //La bonne game
                                
                                for(const [key, value] of Object.entries(sockets)){
                                    
                                    if((key==games[j].idPlayer1) || (key==games[j].idPlayer2) || (key==games[j].idPlayer3)){
                                        
                                        let jsonResponse = {};
                                        jsonResponse.wsTitle = "updateButton";
                                        jsonResponse.buttonName = jsonData.buttonName;
                                        jsonResponse.activated = buttons[i].activated;
                                        console.log(jsonData);
                                        console.log(jsonResponse);
                                        value.send(JSON.stringify(jsonResponse));

                                    }
                                }

                                break;
                            }
                        }

                        break;//pour la perf
                    }
                }

            }else if(jsonData.wsTitle == "audioRequest"){

                console.log(jsonData);

                for(let j=0;j<games.length;j++){
                    if(games[j].id==ownGameId){

                        for(const [key, value] of Object.entries(sockets)){
                            if((key==games[j].idPlayer1) || (key==games[j].idPlayer2) || (key==games[j].idPlayer3)){

                                let jsonResponse = {};
                                jsonResponse.wsTitle = "audioRequest";
                                jsonResponse.function = jsonData.function;
                                if("name" in jsonData){
                                    jsonResponse.name = jsonData.name;
                                }
                                if("checkPlaying" in jsonData){
                                    jsonResponse.checkPlaying = jsonData.checkPlaying;
                                }
                                if("volume" in jsonData){
                                    jsonResponse.volume = jsonData.volume;
                                }
                                if("smooth" in jsonData){
                                    jsonResponse.smooth = jsonData.smooth;
                                }

                                //console.log(jsonResponse);
                                value.send(JSON.stringify(jsonResponse));

                            }
                        }
                        break;
                    }
                }
            }

        }else{
            console.log("NON: Le message reçu par le client n'est PAS au format JSON");
            /*
            let jsonData = {
                "request": "default",
                "data": data,
                "otherData": "truc"
            };
            */
            let jsonData = `{
                "wsTitle": "default",
                "data": "${data}",
                "otherData": "truc"
            }`;
            /*
            let jsonData2 = `{
                "request": "default",
                "data": "${data}",
                "otherData": "truc2"
            }`;
            */
            //ws.send("Hello back");
            //ws.send(data);
            //ws.send(jsonData);
            /*
            let message = "truc"+jsonData;
            console.log(message);
            ws.send(message);
            */
            ws.send(jsonData);
            //ws.send(jsonData2);
        }


    });

    ws.on('close',()=>{
        console.log('a player has disconnected...');

        //Also, make all players playing in the same game find another game.

        //console.log(ws);
        for(const [key, value] of Object.entries(sockets)){
            //console.log(key, value);
            //sockets.splice(key,1);
            if(value==ws){
                console.log(`Disconnecting socket${key}`);
                delete sockets[key];
                //key est l'id du joueur aussi !
                //Donc ça nous permet de supprimer son instance et sa présence dans une game

                let toBeDeletedKey = -1;
                /*
                //Suppression du joueur lui-même
                for(let i=0;i<players.length;i++){
                    if(players[i].id==key){
                        toBeDeletedKey = i;
                        break;//peut-on dire que ça fait gagner des performances
                    }
                }
                if(toBeDeletedKey>=0){
                    players.splice(toBeDeletedKey,1);
                }
                toBeDeletedKey = -1;
                */


                //SUPPRESSION DES DONNEES
                for(let i=0;i<games.length;i++){

                    //Attention resources importantes demandées incomming... => ce serait mieux en MongoDB²
                    //D'abord noter si c'est la game

                    //Dans ce if, c'est la game concernée
                    if((games[i].idPlayer1==key) || (games[i].idPlayer2==key) || (games[i].idPlayer3==key)){
                        
                        //Envoyer un MULTICAST => renvoyer le client à la scène tiltescreen
                        for(const [key2, value2] of Object.entries(sockets)){
                            //Les clients concernés
                            if((games[i].idPlayer1==key2) || (games[i].idPlayer2==key2) || (games[i].idPlayer3==key2)){
                                let jsonResponse = {};
                                jsonResponse.wsTitle = "abortGame";
                                //Ce que ce message provoque :
                                //WS_Client gameobject est bien supprimé
                                // (retirer leur socket se fera automatiquement)
                                value2.send(JSON.stringify(jsonResponse));
                            }

                            console.log("TRUCC");

                            if(games[i].idPlayer1==key){
                                delete games[i].idPlayer1;
                            }else if(games[i].idPlayer2==key){
                                delete games[i].idPlayer2;
                            }else if(games[i].idPlayer3==key){
                                delete games[i].idPlayer3;
                            }
                        }

                        //DESTRUCTION DES PLAYERS
                        let toBeDeletedPlayerKeys = [];
                        for(let j=0;j<players.length;j++){
                            if((players[j].id==games[i].idPlayer1) || (players[j].id==games[i].idPlayer2) || (players[j].id==games[i].idPlayer3)){
                                //players.splice(i,1);
                                toBeDeletedPlayerKeys.push(j);
                            }
                        }
                        let aux = 0;
                        for(let j=0;j<toBeDeletedPlayerKeys.length;j++){
                            console.log("player to delete :")
                            console.log(players[j]);
                            players.splice(toBeDeletedPlayerKeys[j - aux],1);
                            aux++;
                        }
                        
                        //Si c'est la bonne game, on sait ce qu'il faut supprimer
                        toBeDeletedKey = i;
                        games.splice(i,1);

                        break;

                    }
                    
                    /*
                    if(games[i].idPlayer1==key){
                        delete games[i]['idPlayer1'];
                        //console.log(`Deleting player in games[id=${games[i].id}]['idPlayer1']`);
                    }else if(games[i].idPlayer2==key){
                        delete games[i]['idPlayer2'];
                        //console.log(`Deleting player in games[id=${games[i].id}]['idPlayer2']`);
                    }else if(games[i].idPlayer3==key){
                        delete games[i]['idPlayer3'];
                        //console.log(`Deleting player in games[id=${games[i].id}]['idPlayer3']`);
                    }
                    */


                    
                    /*
                    //Delete game if no other player in game
                    if((!("idPlayer1" in games[i])) && (!("idPlayer2" in games[i])) && (!("idPlayer3" in games[i]))){
                        toBeDeletedKey = i;
                        break;
                    }
                    */
                }
                
                if(toBeDeletedKey>=0){
                    games.splice(toBeDeletedKey,1);
                }
                

                /*
                players.forEach((player)=>{
                    if(player.id==key){
                        console.log(`Deleting player[${player.id}]`);
                        delete player;
                    }
                });
                games.forEach((game)=>{
                    if(game.idPlayer1==key){
                        delete game['idPlayer1'];
                        console.log(`Deleting player in game[${game.id}].['idPlayer1']`);
                    }else if(game.idPlayer2==key){
                        delete game['idPlayer2'];
                        console.log(`Deleting player in game[${game.id}].['idPlayer2']`);
                    }else if(game.idPlayer3==key){
                        delete game['idPlayer3'];
                        console.log(`Deleting player in game[${game.id}].['idPlayer3']`);
                    }
                    //Delete game if no other player in game
                    if((!("idPlayer1" in game)) && (!("idPlayer2" in game)) && (!("idPlayer3" in game))){
                        
                    }
                });
                */
                console.log("FIN DES SUPPRESSIONS :");
                console.log(players);
                console.log(games);
                

            }
        }
        /*
        sockets.forEach((key,socket)=>{
            if(socket==ws){
                //On retire le socket des enregistrements
                sockets.splice(key,1);
            }
        });
        */
        /*
        console.log("REMAING SOCKETS:")
        console.log(sockets);
        */
    });
});
