import ws from "ws";
import path from "path";
import express from "express";

import { log, error } from "./modules/logManager";

const app = express();

app.use(express.static(import.meta.dir + "/public/"));

app.get("/", (req, res) => {
	res.sendFile(path.join(import.meta.dir, "/public/index.html"));
});

//Setting up the DB

let sockets = {}; //On fait un dictionnary, je pense que c'est plus adapté
let socketNextId = 0; //Sera aussi l'id du joueur
let gameNextId = 0;
let games = [];
let players = [];
let buttons = [];

//Create server
const wss = new ws.Server({ server: app.listen(import.meta.env.PORT || 8090) });

//Indicate that server runs and on which url access to the game
wss.on("listening", () => {
	log("###############################################################");
	log("---------------------------------------------------------------");
	log();
	log("Welcome on Cubic Chaos (v1.0)!");
	log("By S-Levels - 2024");
	log();
	log();
	/*
	log(
		`To play Cubic Chaos with people on your network, ensure the machine the server runs on is connected to the local network using Ethernet.`,
	);
	log();
	*/
	log(
		`Then, the players should connect via a browser with http://${wss.address().address}:${wss.address().port}`,
	);
	/*
	log(
		`After the game loaded, write "${wss.address()}" in the text input (IPv4 of the server in the url), and finally press enter.`,
	);
	log(`Be careful not to write it badly.`);
	log();
	*/
	log(
		"Be aware that some BROWSERS are INCOMPATIBLE THE ONES WITH THE OTHERS, so if your game has problems at the start of a level, try changing one of the browsers!",
	);
	log(
		"Some little bugs could show up while playing, we hope to avoid them in the future patches",
	);
	log();
	log();
	log(`And that should be it!`);
	log("Enjoy :D");
	log();
	log("---------------------------------------------------------------");
	log("###############################################################");
	log();
	log();
});

wss.on("connection", function connection(ws) {
	//This script is called immediately when the connection with the client is made
	log("a player has connected!");
	//We store the socket and associate it to an id (that will be reused to link the client and the player object)
	sockets[socketNextId] = ws;
	const ownClientId = socketNextId;
	let ownGameId = "";
	socketNextId++;
	log("UPDATED SOCKETS:");
	log(sockets);

	ws.on("message", (data) => {
		// We will usually communicate with JSONs
		let isJson = true;
		let jsonData = {};
		try {
			jsonData = JSON.parse(data);
		} catch (err) {
			error(err);
			//But just in case, we can imagine giving info without them
			isJson = false;
		}

		if (isJson) {
			//log("OUI: Le message reçu par le client est un JSON");

			if (jsonData.wsTitle == "findOrCreateGame") {
				//log("Client asks to find or create a game (and be part of it)...");
				//log(games);
				//letiable to know if there is an available game
				let aux = false;
				let attributedCharacter = "1";
				// let shouldGameStart = false;

				//Search available game

				games.forEach((game) => {
					if (game.levelId == jsonData.levelId) {
						if (
							"idPlayer1" in game &&
							"idPlayer2" in game &&
							"idPlayer3" in game
						) {
							//log(`Game[${game.id}] already full`);
						} else {
							//If the game is joinable
							//log(`Adding player to game[${game.id}]`);

							//We enter the client id in an unused property of the game
							if (!("idPlayer1" in game)) {
								game.idPlayer1 = ownClientId;
								ownGameId = game.id;
								//attributedCharacter = "1"; // already default value
							} else if (!("idPlayer2" in game)) {
								game.idPlayer2 = ownClientId;
								ownGameId = game.id;
								attributedCharacter = "2";
							} else if (!("idPlayer3" in game)) {
								game.idPlayer3 = ownClientId;
								ownGameId = game.id;
								attributedCharacter = "3";
							}

							//We can remember that the player has been added, so shouldn't create new game later!
							aux = true;

							//log("Est-ce que le lobby est complet ?");
							if (
								"idPlayer1" in game &&
								"idPlayer2" in game &&
								"idPlayer3" in game
							) {
								//log("OUI");
								//Then we should tell everyone in the game that it can start
								//(using the concerned stored sockets that we recognize with their key)
								for (const [key, socket] of Object.entries(
									sockets,
								)) {
									if (
										key == game.idPlayer1 ||
										key == game.idPlayer2 ||
										key == game.idPlayer3
									) {
										//log(`Sending startLevel to socket[${key}]`);

										let jsonResponse = {};
										jsonResponse.wsTitle = "startLevel";
										jsonResponse.levelId = game.levelId;

										socket.send(
											JSON.stringify(jsonResponse),
										);
										//log(JSON.stringify(jsonResponse));
									}
								}
							} else {
								//log("NON");
							}

							//Anyway, the client has been attributed a game in this case
							//log("about to return...");
							return;
						}
					}
				});

				//log(games);
				//If there was no available game
				if (aux == false) {
					//Create a game
					let newGame = {
						id: gameNextId,
						levelId: jsonData.levelId,
						arrivalsToGo: 3,
						stars: 0,
						idPlayer1: ownClientId, //Add the player to that game
					};

					if (jsonData.levelId == "1") {
						//On peut créer les plateformes mouvantes ici
						let button0 = {
							buttonName: "Button0",
							gameId: gameNextId,
							activated: false,
						};
						buttons.push(button0);
						//The following ones haven't been used as we lacked time
						//so the client deals with them as bad as it can :`)
						let button1 = {
							buttonName: "Button1",
							gameId: gameNextId,
							activated: false,
						};
						buttons.push(button1);
						let button2 = {
							buttonName: "Button2",
							gameId: gameNextId,
							activated: false,
						};
						buttons.push(button2);
						let button3 = {
							buttonName: "Button3",
							gameId: gameNextId,
							activated: false,
						};
						buttons.push(button3);
					}

					ownGameId = newGame.id;
					gameNextId += 1;
					games.push(newGame);
				}

				//Create a player
				let newPlayer = {};

				if (
					jsonData.levelId == "1" ||
					jsonData.levelId == "2" ||
					jsonData.levelId == "3"
				) {
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
						arrived: false, //dans le client, si (data.arrived==true) { alpha=0 ou z=-100 en gros }
					};
				} else {
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
						arrived: false,
					};
				}
				players.push(newPlayer);

				//log(games);

				let jsonResponse = {};
				jsonResponse.wsTitle = "attributedGame";
				jsonResponse.ownPlayerId = ownClientId;
				jsonResponse.ownGameId = ownGameId;
				jsonResponse.attributedCharacter = attributedCharacter;
				ws.send(JSON.stringify(jsonResponse));

				//On enverra ces données quand les joueurs le demanderont au start du level
				//log(players);

				//log("ownClientId = "+ownClientId);
				//log("ownGameId = "+ownGameId);
			} else if (jsonData.wsTitle == "selfPlayerPos") {
				//log("Player position received...");
				//Acknowledge position (transfering towards BD)
				//Transmit others' position (sending to client)

				games.forEach((game) => {
					//log("All games : ", games);
					//Traiter seulement les joueurs de la même partie
					if (game.id == ownGameId) {
						//Remplacer par la requête MongoDB adéquate
						//log(`Correct game[${game.id}] in loop`);
						//log(game);

						players.forEach((player) => {
							if (player.id == ownClientId) {
								//Get his own position by the way

								//log(`Player[${player.id}] found`);
								/*
                               //log(`player.posX : ${player.posX}`);
                               //log(`player.posY : ${player.posY}`);
                               //log(`jsonData.posX : ${jsonData.posX}`);
                               //log(`jsonData.posY : ${jsonData.posY}`);
                                */
								player.posX = jsonData.posX;
								player.posY = jsonData.posY;
								player.characterVelocity =
									jsonData.characterVelocity;
								player.flipX = jsonData.flipX;
								player.isJumping = jsonData.isJumping;
								//log("posX and posY acknowledged...");
							} else if (
								player.id == game.idPlayer1 ||
								player.id == game.idPlayer2 ||
								player.id == game.idPlayer3
							) {
								//Send him the others' position

								//log("Other player...");
								//log("Preparing data to be sent to client...");

								let jsonResponse = JSON.parse(
									JSON.stringify(player),
								);
								jsonResponse.wsTitle = "otherPlayerPos";
								let attributedCharacter = "1";
								if (game.idPlayer1 == player.id) {
									//attributedCharacter = "1";//inutile?
								} else if (game.idPlayer2 == player.id) {
									attributedCharacter = "2";
								} else if (game.idPlayer3 == player.id) {
									attributedCharacter = "3";
								}
								jsonResponse.attributedCharacter =
									attributedCharacter;

								//Very important to make the client understand which gameobject to update

								ws.send(JSON.stringify(jsonResponse));
								//log("Sent data from player{id: "+player.id+"}");
								//log(jsonResponse);
							}
						});
					}
				});
			} else if (jsonData.wsTitle == "gotKey") {
				//Just keep in memory that the key has been found
				//Initially, there were multiple optional stars to get
				//But imagine that stars==1 means possible to end game

				//log("> player go key in game "+ownGameId);

				games.forEach((game) => {
					if (game.id == ownGameId) {
						game.stars = 1;
					}
				});
			} else if (jsonData.wsTitle == "playerArrived") {
				//A player met the end of the level (ending door)

				//log("> playerArrived");

				for (let i = 0; i < players.length; i++) {
					if (players[i].id == jsonData.selfPlayerId) {
						players[i].arrived = true;
						break; //pour la perf
					}
				}

				//Trouver la bonne game
				for (let i = 0; i < games.length; i++) {
					if (games[i].id == jsonData.selfGameId) {
						//La bonne game

						//The game gets closer to fully end...
						games[i].arrivalsToGo -= 1;
						//log(games[i].arrivalsToGo);

						//Now let's see if we should tell e veryone that it is the end...

						//log("Est-ce que la game doit se terminer ?");
						if (games[i].arrivalsToGo <= 0) {
							//We should stop the connection and display the interface to get back to menu

							//log("Let's end the game");

							//MULTICAST --> endGame
							//Le serveur détecte si la game est terminée ou non

							//Cela va déclencher Destroy(WSManager)

							for (const [key, value] of Object.entries(
								sockets,
							)) {
								//Les clients concernés
								if (
									games[i].idPlayer1 == key ||
									games[i].idPlayer2 == key ||
									games[i].idPlayer3 == key
								) {
									let jsonResponse = {};
									jsonResponse.wsTitle = "endGame";
									jsonResponse.stars = games[i].stars;

									//Ce que ce message provoque :
									//WS_Client gameobject est bien supprimé
									// (retirer leur socket se fera automatiquement)
									value.send(JSON.stringify(jsonResponse));
								}
							}
						} else {
							//On dit au client qui vient de arrive à la door que la partie n'est pas terminée
							//mais qu'il est bien caché et qu'il peut ressortir avec pressanykey
							let jsonResponse = {};
							jsonResponse.wsTitle = "arrivedButNotEndGame";
							ws.send(JSON.stringify(jsonResponse)); //Réponse au client concerné seulement
						}

						break;
					}
				}
			} else if (jsonData.wsTitle == "playerNotArrived") {
				//Okay someone decided to come back after getting to the door
				//Useful because if a player is stuck alone and needs someone to end the game...

				//log("> playerNotArrived");

				for (let i = 0; i < players.length; i++) {
					if (players[i].id == jsonData.selfPlayerId) {
						players[i].arrived = false;
						break; //encore pour la perf
					}
				}

				//Trouver la bonne game
				for (let i = 0; i < games.length; i++) {
					if (games[i].id == jsonData.selfGameId) {
						//La bonne game

						games[i].arrivalsToGo += 1;
						//log(games[i].arrivalsToGo);

						break;
					}
				}
			} else if (jsonData.wsTitle == "activateButton") {
				//Some buttons have a status that should be updated in DB and not in client
				//If a player activates a platform and that others can't use it because it hasn't moved on their screen...

				//log("activateButton ["+jsonData.buttonName+"]");
				for (let i = 0; i < buttons.length; i++) {
					if (buttons[i].gameId == jsonData.selfGameId) {
						//log("activation du bouton dans la liste");
						buttons[i].activated = true;

						for (let j = 0; j < games.length; j++) {
							if (games[j].id == jsonData.selfGameId) {
								//La bonne game

								//log("la game du bouton");
								for (const [key, value] of Object.entries(
									sockets,
								)) {
									if (
										key == games[j].idPlayer1 ||
										key == games[j].idPlayer2 ||
										key == games[j].idPlayer3
									) {
										//log("une websocket concernée : "+key);

										//actualisation : il faut le MultiCast ! (y compris au joueur qui envoie l'info)
										let jsonResponse = {};
										jsonResponse.wsTitle = "updateButton";
										jsonResponse.buttonName =
											jsonData.buttonName;
										jsonResponse.activated =
											buttons[i].activated;

										value.send(
											JSON.stringify(jsonResponse),
										);
										//log(jsonResponse);
									}
								}

								break;
							}
						}

						break; //pour la perf?
					}
				}
			} else if (jsonData.wsTitle == "deactivateButton") {
				//Same code as activate but... deactivates
				//Should have been put in an outside function by the way

				for (let i = 0; i < buttons.length; i++) {
					if (buttons[i].gameId == jsonData.selfGameId) {
						buttons[i].activated = false;

						for (let j = 0; j < games.length; j++) {
							if (games[j].id == jsonData.selfGameId) {
								for (const [key, value] of Object.entries(
									sockets,
								)) {
									if (
										key == games[j].idPlayer1 ||
										key == games[j].idPlayer2 ||
										key == games[j].idPlayer3
									) {
										let jsonResponse = {};
										jsonResponse.wsTitle = "updateButton";
										jsonResponse.buttonName =
											jsonData.buttonName;
										jsonResponse.activated =
											buttons[i].activated;
										//log(jsonData);
										//log(jsonResponse);
										value.send(
											JSON.stringify(jsonResponse),
										);
									}
								}

								break;
							}
						}

						break; //pour la perf?
					}
				}
			} else if (jsonData.wsTitle == "audioRequest") {
				//Transmits an order to play a sound effect or stop it or anything
				//To the whole playing team

				//log(jsonData);

				for (let j = 0; j < games.length; j++) {
					if (games[j].id == ownGameId) {
						for (const [key, value] of Object.entries(sockets)) {
							if (
								key == games[j].idPlayer1 ||
								key == games[j].idPlayer2 ||
								key == games[j].idPlayer3
							) {
								/*
                                Basically sends the same request but to all clients...
                                So we could have juste sent the received data back with
                                value.send(JSON.stringify(jsonData));
                                But let's keep a bit of control over it
                                */

								let jsonResponse = {};
								jsonResponse.wsTitle = "audioRequest";
								jsonResponse.function = jsonData.function;
								if ("name" in jsonData) {
									jsonResponse.name = jsonData.name;
								}
								if ("checkPlaying" in jsonData) {
									jsonResponse.checkPlaying =
										jsonData.checkPlaying;
								}
								if ("volume" in jsonData) {
									jsonResponse.volume = jsonData.volume;
								}
								if ("smooth" in jsonData) {
									jsonResponse.smooth = jsonData.smooth;
								}

								value.send(JSON.stringify(jsonResponse));
								//log(jsonResponse);
							}
						}
						break;
					}
				}
			}
		} else {
			//log("NON: Le message reçu par le client n'est PAS au format JSON");

			let jsonData = `{
                "wsTitle": "default",
                "data": "${data}",
                "otherData": "truc"
            }`;

			ws.send(jsonData);
		}
	});

	ws.on("close", () => {
		//log('a player has disconnected...');

		//Also, make all players playing in the same game find another game.

		//log(ws);
		for (const [key, value] of Object.entries(sockets)) {
			//log(key, value);
			//sockets.splice(key,1);
			if (value == ws) {
				//log(`Disconnecting socket${key}`);
				delete sockets[key];
				let toBeDeletedKey = -1;

				//key est l'id du joueur aussi !
				//Donc ça nous permet de supprimer son instance et sa présence dans une game

				//SUPPRESSION DES DONNEES
				for (let i = 0; i < games.length; i++) {
					//Attention resources importantes demandées incomming... => ce serait mieux en MongoDB²
					//D'abord noter si c'est la game

					//Dans ce if, c'est la game concernée
					if (
						games[i].idPlayer1 == key ||
						games[i].idPlayer2 == key ||
						games[i].idPlayer3 == key
					) {
						//Envoyer un MULTICAST => renvoyer le client à la scène tiltescreen
						for (const [key2, value2] of Object.entries(sockets)) {
							//Les clients concernés
							if (
								games[i].idPlayer1 == key2 ||
								games[i].idPlayer2 == key2 ||
								games[i].idPlayer3 == key2
							) {
								let jsonResponse = {};
								jsonResponse.wsTitle = "abortGame";
								//Ce que ce message provoque :
								//WS_Client gameobject est bien supprimé
								// (retirer leur socket se fera automatiquement)
								value2.send(JSON.stringify(jsonResponse));
							}

							//log("TRUCC");

							if (games[i].idPlayer1 == key) {
								delete games[i].idPlayer1;
							} else if (games[i].idPlayer2 == key) {
								delete games[i].idPlayer2;
							} else if (games[i].idPlayer3 == key) {
								delete games[i].idPlayer3;
							}
						}

						//DESTRUCTION DES PLAYERS
						let toBeDeletedPlayerKeys = [];
						for (let j = 0; j < players.length; j++) {
							if (
								players[j].id == games[i].idPlayer1 ||
								players[j].id == games[i].idPlayer2 ||
								players[j].id == games[i].idPlayer3
							) {
								//players.splice(i,1);
								toBeDeletedPlayerKeys.push(j);
							}
						}
						let aux = 0;
						for (let j = 0; j < toBeDeletedPlayerKeys.length; j++) {
							//log("player to delete :")
							//log(players[j]);
							players.splice(toBeDeletedPlayerKeys[j - aux], 1);
							aux++;
						}

						//Si c'est la bonne game, on sait ce qu'il faut supprimer
						toBeDeletedKey = i;
						games.splice(i, 1);

						break;
					}
				}

				if (toBeDeletedKey >= 0) {
					games.splice(toBeDeletedKey, 1);
				}

				//log("FIN DES SUPPRESSIONS :");
				//log(players);
				//log(games);
			}
		}
	});
});
