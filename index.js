//Setting up the DB

var sockets = {};//On fait un dictionnary, je pense que c'est plus adapté
var socketNextId = 0;//Sera aussi l'id du joueur

var gameNextId = 0;
var games = [];
var players = [];

var buttons = [];

/*
const path = require('path');
const express = require('express');
const app = express();
const ws = require('ws');
*/
import path from 'path';
import express from 'express';
import ws from 'ws';

//const path = require('path');
//const express = require('express');
const app = express();
//const ws = require('ws');

app.use(express.static(__dirname + "/client/"));

app.get('/',(req,res) => {
    res.sendFile(path.join(__dirname,"/client/index.html"));
});

//Get IP of the machine the server runs on
//to let people install the game without editing the code!

/*
ipv4 = require("./getServerIP.js").getEthernetIPv4();
if(ipv4===null){
    console.log("ERROR - IPV4===null");
    console.log("Ensure to launch the server with a machine connected through Ethernet on a local network!");
    return "ERROR - IPV4===null";
}
*/
const ipv4 = "192.168.1.165";

//Create server
const server = app.listen(8090, ipv4);
const wss = new ws.Server({ server });


//Indicate that server runs and on which url access to the game
wss.on('listening',()=>{
    console.log('###############################################################');
    console.log('---------------------------------------------------------------');
    console.log();
    console.log("Welcome on Cubic Chaos (v1.0)!");
    console.log("By S-Levels - 2024");
    console.log();
    console.log();
    console.log(`To play Cubic Chaos with people on your network, ensure the machine the server runs on is connected to the local network using Ethernet.`);
    console.log();
    console.log(`Then, the players should connect via a browser with http://${server.address().address}:${server.address().port}`);
    console.log(`After the game loaded, write "${server.address().address}" in the text input (IPv4 of the server in the url), and finally press enter.`);
    console.log(`Be careful not to write it badly.`);
    console.log();
    console.log("Be aware that some BROWSERS are INCOMPATIBLE THE ONES WITH THE OTHERS, so if your game has problems at the start of a level, try changing one of the browsers!");
    console.log("Some little bugs could show up while playing, we hope to avoid them in the future patches");
    console.log();
    console.log();
    console.log(`And that should be it!`);
    console.log("Enjoy :D");
    console.log();
    console.log('---------------------------------------------------------------');
    console.log('###############################################################');
    console.log();
    console.log();
});


wss.on('connection',function connection(ws){
    
    //This script is called immediately when the connection with the client is made
    console.log('a player has connected!');
    //We store the socket and associate it to an id (that will be reused to link the client and the player object)
    sockets[socketNextId] = ws;
    const ownClientId = socketNextId;
    let ownGameId = "";
    socketNextId++;
    console.log("UPDATED SOCKETS:");
    console.log(sockets);

    ws.on('message',(data)=>{

        //We will usually communicate with JSONs
        let isJson = true;
        try{
            var jsonData = JSON.parse(data);
        }
        catch (err){
            console.error(err);
            //But just in case, we can imagine giving info without them
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

                games.forEach((game) => {
                    if(game.levelId == jsonData.levelId){
                        if(("idPlayer1" in game) && ("idPlayer2" in game) && ("idPlayer3" in game)){
                            console.log(`Game[${game.id}] already full`);
                        }else{

                            //If the game is joinable
                            console.log(`Adding player to game[${game.id}]`);

                            //We enter the client id in an unused property of the game
                            if(!("idPlayer1" in game)){
                                game.idPlayer1 = ownClientId;
                                ownGameId = game.id;
                                //attributedCharacter = "1"; // already default value
                            }else if(!("idPlayer2" in game)){
                                game.idPlayer2 = ownClientId;
                                ownGameId = game.id;
                                attributedCharacter = "2";
                            }else if(!("idPlayer3" in game)){
                                game.idPlayer3 = ownClientId;
                                ownGameId = game.id;
                                attributedCharacter = "3";
                            }

                            //We can remember that the player has been added, so shouldn't create new game later!
                            aux = true;

                            console.log("Est-ce que le lobby est complet ?");
                            if(("idPlayer1" in game) && ("idPlayer2" in game) && ("idPlayer3" in game)){
                                console.log("OUI");
                                //Then we should tell everyone in the game that it can start
                                //(using the concerned stored sockets that we recognize with their key)
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

                            //Anyway, the client has been attributed a game in this case
                            console.log("about to return...");
                            return;

                        }
                    }
                });

                
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
                        //The following ones haven't been used as we lacked time
                        //so the client deals with them as bad as it can :`)
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
                
                //Create a player
                var newPlayer = {};

                if((jsonData.levelId=="1")||(jsonData.levelId=="2")||(jsonData.levelId=="3")){
                    //Values of a player that starts in this kind of level

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
                    //If we ever needed other types of levels and starting positions for instance
                    newPlayer = {
                        id: ownClientId,
                        posX: 0,
                        posY: 0,
                        characterVelocity: "0.0",
                        flipX: false,
                        isJumping: false,
                        isCrushed: false,
                        crushedNot: false,
                        arrived: false
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
                
            }else if(jsonData.wsTitle == "selfPlayerPos"){
                //console.log("Player position received...");
                //Acknowledge position (transfering towards BD)
                //Transmit others' position (sending to client)
                
                games.forEach((game)=>{
                    //console.log("All games : ", games);
                    //Traiter seulement les joueurs de la même partie
                    if(game.id==ownGameId){//Remplacer par la requête MongoDB adéquate
                        //console.log(`Correct game[${game.id}] in loop`);
                        //console.log(game);
                        
                        players.forEach((player)=>{
                            
                            if(player.id==ownClientId){
                                //Get his own position by the way

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
                                //console.log("posX and posY acknowledged...");

                            }else if((player.id==game.idPlayer1) || (player.id==game.idPlayer2) || (player.id==game.idPlayer3)){
                                //Send him the others' position

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
                                
                                //Very important to make the client understand which gameobject to update
                                
                                
                                ws.send(JSON.stringify(jsonResponse));
                                //console.log("Sent data from player{id: "+player.id+"}");
                                //console.log(jsonResponse);
                            }
                        });
                    }
                });

            }else if(jsonData.wsTitle == "gotKey"){
                
                //Just keep in memory that the key has been found
                //Initially, there were multiple optional stars to get
                //But imagine that stars==1 means possible to end game

                console.log("> player go key in game "+ownGameId);
                
                games.forEach((game) => {
                    if(game.id==ownGameId){
                        game.stars = 1;
                    }
                });

            }else if(jsonData.wsTitle == "playerArrived"){
                
                //A player met the end of the level (ending door)

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
                        
                        //The game gets closer to fully end...
                        games[i].arrivalsToGo -= 1;
                        //console.log(games[i].arrivalsToGo);

                        
                        //Now let's see if we should tell e veryone that it is the end...

                        console.log("Est-ce que la game doit se terminer ?");
                        if(games[i].arrivalsToGo<=0){

                            //We should stop the connection and display the interface to get back to menu
                            
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

                //Okay someone decided to come back after getting to the door
                //Useful because if a player is stuck alone and needs someone to end the game...

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

            }else if(jsonData.wsTitle == "activateButton"){

                //Some buttons have a status that should be updated in DB and not in client
                //If a player activates a platform and that others can't use it because it hasn't moved on their screen...

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

                                    if((key==games[j].idPlayer1) || (key==games[j].idPlayer2) || (key==games[j].idPlayer3)){
                                        
                                        //console.log("une websocket concernée : "+key);

                                        //actualisation : il faut le MultiCast ! (y compris au joueur qui envoie l'info)
                                        let jsonResponse = {};
                                        jsonResponse.wsTitle = "updateButton";
                                        jsonResponse.buttonName = jsonData.buttonName;
                                        jsonResponse.activated = buttons[i].activated;
                                        
                                        value.send(JSON.stringify(jsonResponse));
                                        console.log(jsonResponse);
                                    }
                                }

                                break;
                            }
                        }

                        break;//pour la perf?
                    }
                }

            }else if(jsonData.wsTitle == "deactivateButton"){

                //Same code as activate but... deactivates
                //Should have been put in an outside function by the way

                for(let i=0;i<buttons.length;i++){
                    if(buttons[i].gameId==jsonData.selfGameId){
                        
                        buttons[i].activated = false;

                        for(let j=0;j<games.length;j++){
                            if(games[j].id==jsonData.selfGameId){
                                
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

                        break;//pour la perf?
                    }
                }

            }else if(jsonData.wsTitle == "audioRequest"){

                //Transmits an order to play a sound effect or stop it or anything
                //To the whole playing team

                console.log(jsonData);

                for(let j=0;j<games.length;j++){
                    if(games[j].id==ownGameId){

                        for(const [key, value] of Object.entries(sockets)){
                            if((key==games[j].idPlayer1) || (key==games[j].idPlayer2) || (key==games[j].idPlayer3)){

                                /*
                                Basically sends the same request but to all clients...
                                So we could have juste sent the received data back with
                                value.send(JSON.stringify(jsonData));
                                But let's keep a bit of control over it
                                */

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

                                value.send(JSON.stringify(jsonResponse));
                                //console.log(jsonResponse);

                            }
                        }
                        break;
                    }
                }
            }

        }else{
            console.log("NON: Le message reçu par le client n'est PAS au format JSON");
            
            let jsonData = `{
                "wsTitle": "default",
                "data": "${data}",
                "otherData": "truc"
            }`;

            ws.send(jsonData);
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
                let toBeDeletedKey = -1;
                
                //key est l'id du joueur aussi !
                //Donc ça nous permet de supprimer son instance et sa présence dans une game


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
                    
                }
                
                if(toBeDeletedKey>=0){
                    games.splice(toBeDeletedKey,1);
                }
                
                console.log("FIN DES SUPPRESSIONS :");
                console.log(players);
                console.log(games);
                

            }
        }

    });
});
