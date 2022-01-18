const mongoose = require("mongoose");

// Schéma représentant les informations du drone
const DemandeMoyenSchema = {
    idDemandeMoyen: String,
    idIntervention: { type: String, required: true },
    idMoyen: { type: String },
    tagMoyen: { type: String },
    dateDemande: { type: Date, default: Date.now, required: true },
    dateTraitement: Date,
    dateLiberation: Date,
    dateEngagement: Date,
    ville: String,
    rue : String,
    coord : {
        longitude : Number,
        latitude : Number
    },
    couleur: {
        type: String,
        enum: ["VERT", "ROUGE", "BLEU", "VIOLET", "ORANGE", "NOIR"],
    },
    typeMoyen: {
        type: String,
        enum: ["VSAV", "FPT", "VLCG", "SPT"],
    },
    etat: {
        type: String,
        enum: ["REFUSE", "EN_ATTENTE", "EN_TRANSIT", "ARRIVE_CRM", "SUR_PLACE", "LIBERE"],
        // SUR_PLACE --> affecté à une position géoloc
        default: "EN_ATTENTE",
        required: true,
    },
    description : String
};

const DemandeMoyen = mongoose.model("DemandeMoyen", DemandeMoyenSchema);
module.exports = DemandeMoyen;