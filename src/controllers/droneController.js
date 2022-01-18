const boom = require("boom");
const Drone = require("../schemas/droneSchema");
const Intervention = require("../schemas/interventionSchema");
const spawn = require("child_process").spawn;
const server = require("../../server");
const imgModel = require("../schemas/imageSchema");
exports.getDroneInformationsByIntervention = async (req, res) => {
  try {
    const id = req.params.idIntervention;
    const d = await Drone.findOne({ idIntervention: id, en_cours: true });
    if (!!d) {
      return d;
    } else {
      return res.status(400).send("Error : pas de drone en cours de mission");
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

// exports.addDonnee = async (req, res) => {
//   try {
//     var donneeDrone = req.body.donneeDrone;
//     if (donneeDrone) {
//       const d = new Drone(moyen);
//       return d.save();
//     } else {
//       return res.status(400).send(`Error: donneeDrone manquant`);
//     }
//   } catch (err) {
//     throw boom.boomify(err);
//   }
// };

exports.updateDroneValues = async (req, res) => {
  const idInterv = req.body.idIntervention;
  const batterie = req.body.batterie;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  const hauteur = req.body.hauteur;

  if (idInterv) {
    let d = await Drone.findOne({ idIntervention: idInterv, en_cours: true });
    if (d) {
      if (batterie) {
        d.batterie = batterie;
        server.pusher.trigger(idInterv, "batterie", batterie);
      }

      if (longitude && latitude) {
        d.position.coordonnee.longitude = longitude;
        d.position.coordonnee.latitude = latitude;
        server.pusher.trigger(idInterv, "coordonnees", {
          longitude: longitude,
          latitude: latitude,
        });
      }

      return d.save();
    } else {
      return res.status(500).send(`Error : Drone non trouvé`);
    }
  } else {
    return res
      .status(400)
      .send(`Error: informations manquantes : idIntervention : ${idInterv}`);
  }
};

exports.lancerMission = async (req, res) => {
  try {
    const typeCirc = req.body.typeCircuit;
    const pointsCoord = req.body.points;
    const idInterv = req.body.idIntervention;
    if (!!idInterv & Array.isArray(pointsCoord) & !!typeCirc) {
      const interv = await Intervention.findOne({ id: idInterv });

      if (interv) {
        // INTERVENTION
        const sourceCoord = interv.adresse.coord;
        let pointsLancerDrone = [];
        let points = [];
        for (let [index, value] of pointsCoord.entries()) {
          points.push({
            index: index + 1,
            latitude: value.latitude,
            longitude: value.longitude,
          });
          pointsLancerDrone.push([value.latitude, value.longitude, 5]);
        }

        // INSTANCE D'IMAGE
        let imageInstance = await imgModel.findOne({
          idIntervention: idInterv,
        });
        let clonePoints = Array.from(points);

        if (imageInstance) {
          // Ajout des coordonnées GPS dans imageInstance (utile pour obtenir la longitude et latitude)
          taillePoint = imageInstance.pointsDuDrone.length;
          clonePoints.forEach((p) => {
            p.index = p.index + taillePoint; // modif +
          });
          console.log(clonePoints);
          clonePoints.forEach((p) => {
            p.indexPoint = p.index
            imageInstance.pointsDuDrone.push(p);
          });
        } else {
          points.forEach((p) => {
            p.indexPoint = p.index
          });
          // Nouvelle instance d'image model
          const newImageInstance = {
            idIntervention: idInterv,
            pointsDuDrone: points,
          };
          imageInstance = new imgModel(newImageInstance);
        }
        //console.log("Sauvegarde IMAGE INSTANCE : \n")
        //console.log(JSON.stringify(imageInstance));
        await imageInstance.save();
        // INSTANCE D'IMAGE

        // INSTANCE DE DRONE
        let droneInstance = await Drone.findOne({ idIntervention: idInterv });

        if (!droneInstance) {
          // Premiere fois, lancement de mission
          droneInstance = new Drone({
            idIntervention: idInterv,
            typeCircuit: typeCirc,
            source: sourceCoord,
            points: points,
            position: {
              coordonnee: sourceCoord,
              hauteur: 10,
            },
            etat: "EN_MISSION",
            batterie: 100,
            en_cours: true,
          });
        } else {
          // Le drone à déja été lancé avant
          if (!!imageInstance) {
            droneInstance.points = [];
            for (let [index, v] of clonePoints.entries()) {
              droneInstance.points.push({
                index: index + 1,
                longitude: v.longitude,
                latitude: v.latitude,
              });
            }
          } else {
            return res.status(500).send(`Erreur : Aucune instance d'IMAGE`);
          }
        }

        console.log("Sauvegarde DRONE INSTANCE : \n");
        console.log(JSON.stringify(droneInstance));

        paramCircuit = typeCirc == "OUVERT" ? "reverse" : "boucle";
        const nbPoints = [
          ...new Set(imageInstance.points.map((item) => item.indexPoint)),
        ].length;
        pointsToSend = JSON.stringify(pointsLancerDrone);
        server.pusher.trigger(idInterv, "startDrone", droneInstance);
        const pythonProcess = spawn("./drone/lancerDrone.sh", [
          droneInstance.source.latitude,
          droneInstance.source.longitude,
          pointsToSend,
          paramCircuit,
          idInterv,
          !droneInstance ? 0 : nbPoints,
        ]);

        pythonProcess.stdout.on("data", (data) => {
          console.log(`${data}`);
        });

        pythonProcess.stderr.on("data", (data) => {
          console.error(`stderr: ${data}`);
        });

        pythonProcess.on("close", (code) => {
          console.log(`child process exited with code ${code}`);
          return true;
        });

        return droneInstance.save();
      } else {
        return res.status(500).send(`Erreur : Intervention non trouvé`);
      }
    } else {
      return res
        .status(400)
        .send(
          `Error: informations manquantes : idIntervention : ${idInterv} & Point coordonnées : ${pointsCoord} & Type Circuit : ${typeCirc}`
        );
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

// exports.demarrerVideo = async (req, res) => {
//   try {
//     return res.status(200);
//   } catch (err) {
//     throw boom.boomify(err);
//   }
// };

exports.arreterMission = async (req, res) => {
  try {
    const idInterv = req.params.idIntervention;
    if (idInterv) {
      server.pusher.trigger(idInterv, "stopDrone", "" );
      let d = await Drone.find({ idIntervention: idInterv, en_cours : true});
      if (Array.isArray(d)) {
        d.forEach((interv) => {
          if (interv.en_cours) {
            interv.en_cours = false;
            interv.save();
          }
        });

        var process = spawn("docker", ["stop", "headless"]);
        process.stdout.on("data", (data) => {
          process.stdin.pause();
          process.kill();
          return res.status(200).send("docker bien arreté");
        });

        process.stderr.on("data", (data) => {
          process.stdin.pause();
          process.kill();
          return res.status(200).send("pas de docker");
        });
      } else {
        return res.status(500).send(`Error: Drone non trouvé`);
      }
    } else {
      return res
        .status(400)
        .send(`Error: informations manquantes : idIntervention : ${idInterv}`);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.isEnCours = async (req, res) => {
  try {
    const idIntervention = req.params.idIntervention;
    if (idIntervention) {
      const d = await Drone.findOne({
        idIntervention: idIntervention,
        en_cours: true,
      });
      if (!!d) {
        return res.status(200).send(true);
      } else {
        return res.status(200).send(false);
      }
    } else {
      return res
        .status(400)
        .send(`Error: informations manquantes : idIntervention : ${idInterv}`);
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.deleteAllDroneIntervention = async (req, res) => {
  try {
    return Drone.deleteMany();
  } catch (err) {
    throw boom.boomify(err);
  }
};
