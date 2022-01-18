const boom = require('boom')
var NodeGeocoder = require('node-geocoder');
const server = require('../../server');
const mongoose = require("mongoose");

const Intervention = require('../schemas/interventionSchema')
var geocoder = NodeGeocoder({
  provider: 'opencage',
  apiKey: '82c322c8495a459294057a9cab169099'
});

// Get all Interventions
exports.getInterventions = async (req, reply) => {
  try {
    return Interventions = await Intervention.find().sort({ date: -1 });
  } catch (err) {
    throw boom.boomify(err)
  }
}

// Get single Intervention by ID
exports.getSingleIntervention = async (req, reply) => {
  try {
    const id = req.params.idIntervention
    const Interv = await Intervention.findById(id)
    return Interv
  } catch (err) {
    throw boom.boomify(err)
  }
}

// Add a new Intervention
exports.addIntervention = async (req, reply) => {
  try {
    var intervention = req.body;
    const adresse = intervention.adresse
    intervention.id = mongoose.Types.ObjectId();
    await geocoder.geocode(`${adresse.rue}, ${adresse.ville}`, function(err, res) {
      const long = res && res[0]? res[0].longitude : 0 
      const lat = res && res[0]? res[0].latitude : 0
      intervention.adresse.coord = {
                "latitude": lat ,
                "longitude": long
              }
    });
    // Ajout de l'intervention en base
    const Interv = new Intervention(intervention)
    server.pusher.trigger("global", "addIntervention", Interv);
    return Interv.save()
  } catch (err) {
    throw boom.boomify(err)
  }
}

// Update an existing Intervention
exports.updateIntervention = async (req, reply) => {
  try {
    const interv = req.body;
    const clone = (({ _id, __v, ...o }) => o)(interv);
    if (clone.id) {
      await Intervention.updateOne({ id: clone.id }, { $set: clone }, (err, result) => {
        if (err) {
          return reply.status(500).send(`Error: ${err}`);
        }
      });
    } else {
      return reply.status(500).send(`Error: L'id de l'intervention est manquante`);
    }
    return reply.status(200).send("L'intervention : " + clone.id + " à été modifié");
  } catch (err) {
    throw boom.boomify(err)
  }
}

// Delete a Intervention
exports.deleteIntervention = async (req, reply) => {
  try {
    const idIntervention = req.params.idIntervention
    const Interv = await Intervention.remove({id : idIntervention})
    return Interv
  } catch (err) {
    throw boom.boomify(err)
  }
}