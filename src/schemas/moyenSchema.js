const mongoose = require("mongoose");

// Schéma représentant un véhicule
const MoyenSchema = {
    id: String,
    code: {
        type: String,
        enum: ["VSAV", "FPT", "VLCG", "SPT"],
        required: true,
    },
    description: String,
    idIntervention: { type: String },
    tag :String
    // FPT12
};

const Moyen = mongoose.model("Moyen", MoyenSchema);
module.exports = Moyen;
