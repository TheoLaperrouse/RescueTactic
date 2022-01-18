const mongoose = require("mongoose");
const DroneData = require('./schemas/interventionSchema')
const Moyen = require('./schemas/moyenSchema')
const Drone = require('./schemas/droneSchema')
const Intervention = require('./schemas/interventionSchema')
const DemandeMoyen = require('./schemas/demandeMoyenSchema')
const dummy = require('mongoose-dummy');
const model = mongoose.model("InterventionDatas", Intervention.Interv);



jsonData = [];
 for (let i = 0; i < 10; i++) {
  jsonData.push(JSON.stringify(dummy(model)))  
}
console.log(jsonData)