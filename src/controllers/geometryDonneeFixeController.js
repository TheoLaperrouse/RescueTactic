const boom = require("boom");
const Intervention = require('../schemas/interventionSchema')
const DonneeFixe = require('../schemas/geometryDonneeFixeSchema')
const server = require('../../server');
const mongoose = require("mongoose");

/**
*  Ajout d'une demande de moyen COS
*/
exports.getDonneeFixeByIntervention = async (req, res) => {
  try {
    const idIntervention = req.params.idIntervention;
    
    if (idIntervention) {
      const intervention = await Intervention.findOne({ id: idIntervention });
      
      if(intervention){
        const latitudevingtKm = (0.00898319 * 7);
        const longitudevingtKm = (0.01272799012 * 7);
        const geometryIntervention = intervention.adresse.coord;
        
        if(geometryIntervention){
          return DonneeFixe.find({
            idIntervention : [null,''],
            longitude : {$lt: geometryIntervention.longitude + longitudevingtKm, $gte: geometryIntervention.longitude - longitudevingtKm},
            latitude : {$lt: geometryIntervention.latitude + latitudevingtKm, $gte: geometryIntervention.latitude - latitudevingtKm}});
          }else{
            return res.status(400).send(`Error: Pas de données géométriques`);
          }
        } else {
          return res.status(400).send(`Error: idIntervention inexistente`);
        }
      }else{
        return res.status(400).send(`Error: idIntervention manquant`);
      }
    } catch (err) {
      throw boom.boomify(err);
    }
  };

  exports.getDonneeDynamiqueByIntervention = async (req, res) => {
    try {
      const idIntervention = req.params.idIntervention;
      
      if (idIntervention) {
        const intervention = await Intervention.findOne({ id: idIntervention });
        
        if(intervention){
          const latitudevingtKm = (0.00898319 * 7);
          const longitudevingtKm = (0.01272799012 * 7);
          const geometryIntervention = intervention.adresse.coord;
          
          if(geometryIntervention){
            return DonneeFixe.find({
              idIntervention : [idIntervention],
              longitude : {$lt: geometryIntervention.longitude + longitudevingtKm, $gte: geometryIntervention.longitude - longitudevingtKm},
              latitude : {$lt: geometryIntervention.latitude + latitudevingtKm, $gte: geometryIntervention.latitude - latitudevingtKm}});
            }else{
              return res.status(400).send(`Error: Pas de données géométriques`);
            }
          } else {
            return res.status(400).send(`Error: idIntervention inexistente`);
          }
        }else{
          return res.status(400).send(`Error: idIntervention manquant`);
        }
      } catch (err) {
        throw boom.boomify(err);
      }
    };
  
  exports.addDonnees = async (req, res) => {
    try {
      var json = require('../../scripts/geometry_points.json');
      objects = []
      for(object of json){
        objects.push({...object, id : mongoose.Types.ObjectId()})
      }
      await DonneeFixe.insertMany(objects)
      return res.status(200).send("Les données ont été ajoutées");
    } catch (err) {
      throw boom.boomify(err);
    }
  };

  exports.addDonnee = async (req, res) => {
    try {
      if(Array.isArray(req.body.donnees)){
        req.body.donnees.forEach( point => {
          const p = new DonneeFixe({...point, id: mongoose.Types.ObjectId()});
          p.save();
        });
        return res.status(200).send("Les données ont été ajoutées");
      }else{
        donneeFixe = new DonneeFixe({...req.body, id: mongoose.Types.ObjectId()});
        const d = await donneeFixe.save();
        if(donneeFixe.idIntervention){
          const channel = donneeFixe.idIntervention.replace(/:/g,"")
          server.pusher.trigger(channel, "addDonneeFixe", d);
        }
        return d;
      }

    } catch (err) {
      throw boom.boomify(err);
    }
  };
  
  exports.deleteDonnee = async (req, res) => {
    try {
      return DonneeFixe.deleteMany();
    } catch (err) {
      throw boom.boomify(err);
    }
  };

  exports.deleteDonneeById = async (req, res) => {
    try {
      var id = req.params.idDonneeFixe;
      if(id){
        const don = await DonneeFixe.findOne({id : id});
        server.pusher.trigger(don.idIntervention, "deleteDonneeFixe", id);
        return DonneeFixe.deleteOne({id : id});
      }else{
        return res.status(400)
        .send(`Error: informations manquantes : id : ${id}`);
      }
    } catch (err) {
      throw boom.boomify(err);
    }
  };