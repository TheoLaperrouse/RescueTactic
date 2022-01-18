const mongoose = require("mongoose");

// Intervention Schema & Model
const imageSchema = new mongoose.Schema({
    idIntervention: String, 
    imageVideo: { data: Buffer, contentType: String },
    points : [{
        name : String,
        indexPoint : Number,// 4 5 6
        imagePoint: { data: Buffer, contentType: String },
        date : {type : Date, default : Date.now()},
        longitude : Number,
        latitude : Number
    }],
    pointsDuDrone :
    [{
        indexPoint : Number, // 1 2 3, 4 5 6
        longitude : Number,
        latitude : Number
    }]
});

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;