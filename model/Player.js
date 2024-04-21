const mongoose = require('mongoose');
const { Schema } = mongoose;//const { Schema } = mongoose.Schema;

const playerSchema = new Schema({
    //_id: String,
    pseudo: String,
    //posX: Number,
    //posY: Number,
    posX: String,
    posY: String,
    orientation: Number,
    sprite: String/*,
    spriteImage: Number
    */
});

mongoose.model('players', playerSchema);