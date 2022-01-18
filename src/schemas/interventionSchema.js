const mongoose = require("mongoose");

// Intervention Schema & Model
const interventionSchema = new mongoose.Schema({
    id: String,
    adresse: {
        coord: {
            latitude: Number,
            longitude: Number,
        },
        rue: {type : String, required : true},
        zipcode: {type : String, required : true},
        ville: {type : String, required : true},
    },
    etat: {
        type: Boolean,
        required: true,
    },
    date: { type: Date, default: Date.now, required: true },
    codeSinistre: {
        type: String,
        enum: ["SAP", "INC"],
        default: "ERROR",
        required: true,
    },
});

const Interv = mongoose.model("InterventionDatas", interventionSchema);
module.exports = Interv;
