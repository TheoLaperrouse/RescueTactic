const DemandeMoyen = require("../schemas/demandeMoyenSchema");
const boom = require("boom");
const Moyen = require("../schemas/moyenSchema");
const mongoose = require("mongoose");
const Intervention = require("../schemas/interventionSchema");
const server = require("../../server");

const mapColor = {
  VLCG: "VIOLET",
  FPT: "ROUGE",
  VSAV: "VERT",
};

/**
*  Ajout d'une demande de moyen COS
*/
exports.demandeDeMoyenCos = async (req, res) => {
  try {
    let arrayDemandeMoyens = [];
    const body = req.body;
    if (body.idIntervention && Array.isArray(body.moyens)) {
      const intervention = await Intervention.findOne({
        id: body.idIntervention,
      });
      for (moyen of body.moyens) {
        for (let i = 0; i < moyen.nombre; i++) {
          // Création d'une demande moyen
          const DemandeMoyens = await new DemandeMoyen({
            idDemandeMoyen: mongoose.Types.ObjectId(),
            idIntervention: body.idIntervention,
            ville: intervention.adresse.ville,
            rue: intervention.adresse.rue,
            typeMoyen: moyen.typeMoyen,
            description: intervention.description,
            couleur: mapColor[moyen.typeMoyen],
            // Etat devient en attente --> attente de validation
            etat: "EN_ATTENTE",
          });
          arrayDemandeMoyens.push(DemandeMoyens);
          await DemandeMoyens.save();
        }
      }
      server.pusher.trigger(
        body.idIntervention,
        "addDemandeMoyen",
        arrayDemandeMoyens
      );
      server.pusher.trigger("global", "addDemandeMoyen", arrayDemandeMoyens);
      return res.status(200).send("Les demandes ont été effectuées");
    } else {
      return res
        .status(400)
        .send(
          `Error: Informations manquantes (idIntervention: ${idIntervention} ou typeMoyen: ${typeMoyen})`
        );
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

/**
*  Ajout d'une demande de moyen CODIS
*/
exports.demandeDeMoyenCodis = async (req, res) => {
  try {
    const body = req.body;
    const intervention = await Intervention.findOne({
      id: body.idIntervention,
    });
    console.log(intervention);
    if (body.idIntervention && Array.isArray(body.idMoyens)) {
      for (moyen of body.idMoyens) {
        var moyenToAffect = await Moyen.findOne({ id: moyen });
        if (moyenToAffect) {
          const DemandeMoyens = new DemandeMoyen({
            idDemandeMoyen: mongoose.Types.ObjectId(),
            idIntervention: body.idIntervention,
            typeMoyen: moyenToAffect.code,
            idMoyen: moyen,
            tagMoyen: moyenToAffect.tag,
            rue: intervention.adresse.rue,
            ville: intervention.adresse.ville,
            couleur: mapColor[moyenToAffect.code],
            description: moyenToAffect.description,
            // Etat est automatiquement validé
            etat: "EN_TRANSIT",
            dateTraitement: Date.now(),
          });
          await moyenToAffect.updateOne({
            idIntervention: body.idIntervention,
          });
          await DemandeMoyens.save();
        } else {
          return res.status(400).send(`Error: idMoyen does not exist`);
        }
      }
      return res.status(200).send("Les demandes ont été effectuées");
    } else {
      return res
        .status(400)
        .send(
          `Error: Informations manquantes (idIntervention: ${idIntervention} ou idMoyen: ${idMoyen} ou typeMoyen : ${typeMoyen})`
        );
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.validerDemandeMoyen = async (req, res) => {
  try {
    // parametre
    const idDemande = req.body.idDemandeMoyen;
    const idIntervention = req.body.idIntervention;
    const idMoyen = req.body.idMoyen;
    const value = req.body.value;
    if (idDemande && (value || value === false) && idIntervention) {
      var DemandeMoyens = await DemandeMoyen.findOne({
        idDemandeMoyen: idDemande,
      });
      if (!value) {
        DemandeMoyens.dateTraitement = Date.now()
        DemandeMoyens.etat = 'REFUSE'
        server.pusher.trigger("global", "modifDemandeMoyen", DemandeMoyens);
        server.pusher.trigger(idIntervention, "modifDemandeMoyen", DemandeMoyens);
        return DemandeMoyens.save();
      } else {
        if (idMoyen) {
          var m = await Moyen.findOne({ id: idMoyen });
          DemandeMoyens.dateTraitement = Date.now();
          DemandeMoyens.etat = 'EN_TRANSIT';
          DemandeMoyens.idMoyen = idMoyen;
          DemandeMoyens.tagMoyen = m.tag;
          DemandeMoyens.description = m.description;
          await m.updateOne({ idIntervention: idIntervention });
          server.pusher.trigger("global", "modifDemandeMoyen", DemandeMoyens);
          server.pusher.trigger(
            idIntervention,
            "modifDemandeMoyen",
            DemandeMoyens
          );
          return DemandeMoyens.save()
        } else {
          return res.status(400).send(`Error: idMoyen manquant`);
        }
      }
    } else {
      return res
        .status(400)
        .send(
          `Error: Informations manquantes (idDemandeMoyen: ${idDemande} ou idMoyen: ${idMoyen} ou value: ${value} ou idIntervention : ${idIntervention})`
        );
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

/**
* Retourne la liste des demandes en attente
*/
exports.getDemandeMoyenDisponible = async (req, reply) => {
  try {
    return DemandeMoyen.find({ etat: "EN_ATTENTE" }).sort({ dateDemande: -1 });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getdemandemoyenbyintervention = async (req, res) => {
  try {
    const idIntervention = req.params.idIntervention;
    if (idIntervention) {
      return DemandeMoyen.find({ idIntervention: idIntervention });
    } else {
      return res
        .status(400)
        .send(
          `Error: informations manquantes : idIntervention : ${idIntervention}`
        );
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getDemandeMoyenAccepte = async (req, reply) => {
  try {
    return DemandeMoyen.find({ etat: { $nin: ["REFUSE", "EN_ATTENTE"] } });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteDemandesMoyen = async (req, res) => {
  try {
    return DemandeMoyen.deleteMany();
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteDemandeMoyen = async (req, res) => {
  try {
    const id = req.params.idDemandeMoyen;
    if (!!id) {
      const dm = await DemandeMoyen.find({ idDemandeMoyen: id });
      if (dm) {
        server.pusher.trigger(dm.idIntervention, "deleteDemandeMoyen", id);
        server.pusher.trigger("global", "deleteDemandeMoyen", id);
        const DemandeMoyens = await DemandeMoyen.remove({ idDemandeMoyen: id });
        return DemandeMoyens;
      } else {
        return res
          .status(500)
          .send(
            `Error: La demande de moyen n'existe pas, idDemandeMoyen: ${idDemandeMoyen}`
          );
      }
    } else {
      return res
        .status(400)
        .send(
          `Error: informations manquantes : idDemandeMoyen : ${idDemandeMoyen}`
        );
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.engagerDemandeMoyen = async (req, res) => {
  try {
    // Id de la demande de moyen
    const idDemande = req.body.idDemandeMoyen;
    if (idDemande) {
      var demandeMoyen = await DemandeMoyen.findOne({
        idDemandeMoyen: idDemande,
      });
      if (demandeMoyen) {
        // Si pas d'heure d'engagement, on update
        if (!demandeMoyen.dateEngagement) {
          demandeMoyen.dateEngagement = Date.now();
        }
        const demandeGeoloc = demandeMoyen.coord;
        // Si données géoloc alors le statut devient : SUR_PLACE
        if (
          demandeGeoloc &&
          demandeGeoloc.longitude &&
          demandeGeoloc.latitude
        ) {
          demandeMoyen.etat = "SUR_PLACE";
        } else {
          // Sinon statut : ARRIVE_CRM
          demandeMoyen.etat = "ARRIVE_CRM";
        }
        server.pusher.trigger(
          demandeMoyen.idIntervention,
          "modifDemandeMoyen",
          demandeMoyen
        );
        return demandeMoyen.save();
      } else {
        return res
          .status(500)
          .send(`Error: Demande de moyen introuvable : ${idDemande}`);
      }
    } else {
      return res
        .status(400)
        .send(`Error: informations manquantes : idDemandeMoyen : ${idDemande}`);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.libererDemandeMoyen = async (req, res) => {
  try {
    // Id de la demande de moyen
    const idDemande = req.body.idDemandeMoyen;
    if (idDemande) {
      var demandeMoyen = await DemandeMoyen.findOne({
        idDemandeMoyen: idDemande,
      });
      if (demandeMoyen) {
        if (demandeMoyen.etat == "EN_ATTENTE") {
          server.pusher.trigger(demandeMoyen.idIntervention,"deleteDemandeMoyen",idDemande);
          server.pusher.trigger("global", "deleteDemandeMoyen", idDemande);
          // delete la demande de moyen 
          return DemandeMoyen.remove({idDemandeMoyen : idDemande});
        } else {
          const realMoyen = await Moyen.findOne({ id: demandeMoyen.idMoyen });
          if (realMoyen) {
            // Modification de la date de libération + statut : LIBERE + supprimer l'affectation du moyen en question
            demandeMoyen.dateLiberation = Date.now();
            demandeMoyen.etat = "LIBERE";
            await realMoyen.updateOne({ idIntervention: null });
            server.pusher.trigger(
              demandeMoyen.idIntervention,
              "modifDemandeMoyen",
              demandeMoyen
            );
            return demandeMoyen.save();
          } else {
            return res.status(500).send(`Error MAJOR: Le moyen n'existe pas`);
          }
        }
      } else {
        return res
          .status(500)
          .send(`Error: Demande de moyen introuvable : ${idDemande}`);
      }
    } else {
      return res
        .status(400)
        .send(`Error: informations manquantes : idDemandeMoyen : ${idDemande}`);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};


exports.retourCRM= async (req, res) => {
  try {
    const idDemande = req.body.idDemandeMoyen;
    if (idDemande) {
      var demandeMoyen = await DemandeMoyen.findOne({
        idDemandeMoyen: idDemande,
      });
      if (demandeMoyen) {
        demandeMoyen.coord.longitude = undefined ;
        demandeMoyen.coord.latitude = undefined ;
        if (demandeMoyen.idMoyen) {
          demandeMoyen.etat = "EN_TRANSIT";
        }else{
          demandeMoyen.etat = "EN_ATTENTE";
        }
        server.pusher.trigger(
          demandeMoyen.idIntervention,
          "modifDemandeMoyen",
          demandeMoyen
        );
        return demandeMoyen.save();
      } else {
        return res
          .status(500)
          .send(`Error: Demande de moyen introuvable : ${idDemande}`);
      }
    } else {
      return res
        .status(400)
        .send(
          `Error: informations manquantes : idDemandeMoyen : ${idDemande}`
        );
    }
  } catch (err) {
    throw boom.boomify(err);
  }
}

exports.transiterDemandeMoyen = async (req, res) => {
  try {
    const idDemande = req.body.idDemandeMoyen;
    const lon = req.body.coord.longitude;
    const lat = req.body.coord.latitude;
    const couleur = req.body.couleur;
    if (idDemande && lon && lat) {
      let demandeMoyen = await DemandeMoyen.findOne({
        idDemandeMoyen: idDemande,
      });
      if (demandeMoyen) {
        demandeMoyen.coord.longitude = lon;
        demandeMoyen.coord.latitude = lat;
        if (demandeMoyen.etat != "EN_ATTENTE") {
          demandeMoyen.etat = "EN_TRANSIT";
        }
        if(couleur){
          demandeMoyen.couleur = couleur;
        }
        server.pusher.trigger(
          demandeMoyen.idIntervention,
          "modifDemandeMoyen",
          demandeMoyen
        );
        return demandeMoyen.save();
      } else {
        return res
          .status(500)
          .send(`Error: Demande de moyen introuvable : ${idDemande}`);
      }
    } else {
      return res
        .status(400)
        .send(
          `Error: informations manquantes : idDemandeMoyen : ${idDemande} ou longitude : ${lon} ou latitude ${lat} `
        );
    }
  } catch (err) {
    throw boom.boomify(err);
  }
}

