const mongoose = require("mongoose");

// Intervention Schema & Model
const geometryDonneeFixeSchema = new mongoose.Schema({
    id : String,
    type : String,
    forme : {
        type: String,
        enum: ["RECTANGLE", "ROND", "CARRE", "TRIANGLE", "ETOILE"],
    },
    name : String,
    longitude : Number,
    latitude : Number,
    couleur : {
        type: String,
        enum: ["VERT", "ROUGE", "BLEU", "VIOLET", "ORANGE", "NOIR"],
    },
    idIntervention : String
});

const DonneeFixe = mongoose.model("DonneeFixe", geometryDonneeFixeSchema);
module.exports = DonneeFixe;