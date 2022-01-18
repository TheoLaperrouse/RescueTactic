const boom = require("boom");
const Moyen = require("../schemas/moyenSchema");
const DemandeMoyen = require("../schemas/demandeMoyenSchema");

/**
 * Ajout d'un moyen
 */
exports.addMoyen = async (req, res) => {
  try {
    if (Array.isArray(req.body.moyens)) {
      req.body.moyens.forEach((moyen) => {
        const m = new Moyen(moyen);
        m.save();
      });
    }
    else{
      var moyen = req.body;
      const moyenData = new Moyen(moyen);
      return moyenData.save();
    }
    return res.status(200).send("Les données ont été ajoutées");
  } catch (err) {
    throw boom.boomify(err);
  }
};

/**
 * Récupération de tous les moyens disponibles
 * */
exports.getMoyensDisponibles = async (req, reply) => {
  try {
    // Recherche des moyens qui ne sont pas liés à une intervention
    const Moyens = await Moyen.find({ idIntervention: [null, ""] });
    return Moyens;
  } catch (err) {
    throw boom.boomify(err);
  }
};

/**
 * Récupération de tous les moyens d'une intervention
 * */
exports.getMoyensByIntervention = async (req, res) => {
  try {
    const id = req.params.idIntervention;
    if (id) {
      const moyensIntervention = await Moyen.find({ idIntervention: id });
      var resultSchema = [];

      for (const moyen of moyensIntervention) {
        const demandeMoyen = await DemandeMoyen.findOne({ idMoyen: moyen.id });
        resultSchema.push({
          code: demandeMoyen.typeMoyen,
          couleur: demandeMoyen.couleur,
          description: moyen.description,
          dateTraitement: demandeMoyen.dateTraitement,
          dateLiberation: demandeMoyen.dateLiberation,
          etat: demandeMoyen.etat,
        });
      }
      return res.status(200).send(resultSchema);
    }
    return res.status(200).send("La demande de moyen COS à été effectué");
  } catch (err) {
    throw boom.boomify(err);
  }
};

/**
 * Retourne les différents moyens existant ainsi que le nombre disponible par moyen
 */
exports.getNumberOfMoyens = async (req, res) => {
  try {
    return Moyen.aggregate([
      { $match: { $or: [{ idIntervention: null }, { idIntervention: "" }] } },
      { $group: { _id: "$code", count: { $sum: 1 } } },
      {
        $project: {
          _id: 0,
          nom: "$_id",
          count: 1,
          sum: 1,
        },
      },
    ]);
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getMoyenByCode = async (req, reply) => {
  try {
    const code = req.params.code;
    const Moyens = await Moyen.find({ code: code, idIntervention: ["", null] });
    return Moyens;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.liberationdemoyens = async (req, reply) => {
  try {
    await Moyen.updateMany({}, { $set: { idIntervention: "" } });
    return await DemandeMoyen.deleteMany();
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteMoyens = async (req, res) => {
  try {
    return Moyen.deleteMany();
  } catch (err) {
    throw boom.boomify(err);
  }
};
