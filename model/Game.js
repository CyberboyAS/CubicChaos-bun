const mongoose = require('mongoose');
const { Schema } = mongoose;//const { Schema } = mongoose.Schema;

const gameSchema = new Schema({
    //_id: String,
    //isJoinable: Boolean,
    /*
    J'aimerais tester et voir si on peut rejoindre une game en cours si quelqu'un se déco
    Donc je désactive cette ligne non essentielle
    à remplacer dans le code par des conditions [si 4 joueurs ont joint, pas possible de rejoindre]
    */
    idPlayer1: String,
    idPlayer2: String,
    idPlayer3: String,
    idPlayer4: String,
    
    currentLevel: String,
    timer: Number
});

mongoose.model('games', gameSchema);