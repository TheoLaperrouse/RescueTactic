const mongoose = require("mongoose");

// Schéma représentant les informations du drone
const DroneDataSchema= {
    idIntervention : {type : String, required : true},
    typeCircuit : {
        type: String,
        enum: ["OUVERT", "FERME"],
    },
    source : {
        latitude: Number,
        longitude: Number,
    },
    points: [{
        index : Number,
        latitude: Number,
        longitude: Number,
    }],
    position: {
        coordonnee: {
            latitude: Number,
            longitude: Number,
        },
        hauteur : Number,
        date: { type: Date, default: Date.now },
    },
    etat: {
        type: String,
        enum: ["EN_ATTENTE", "EN_MISSION"],
        default: "EN_ATTENTE",
        required: true,
    },
    batterie : Number,
    en_cours : {
        type: Boolean,
        default: true,
        required: true,
    }
};

const Drone = mongoose.model("Drone", DroneDataSchema);
module.exports = Drone;
