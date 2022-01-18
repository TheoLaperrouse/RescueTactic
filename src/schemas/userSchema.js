const mongoose = require("mongoose");

// Intervention Schema & Model
const userSchema = new mongoose.Schema({
    nom : String,
    prenom : String,
    email: {type : String, required : true},
    password: {type : String, required : true}
});

const Connection = mongoose.model("Connection", userSchema);
module.exports = Connection;