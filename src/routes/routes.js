const interventionController = require("../controllers/interventionController");
const userController = require("../controllers/userController");
const droneController = require("../controllers/droneController");
const moyensController = require("../controllers/moyensController");
const demandeMoyenController = require("../controllers/demandeMoyenController");
const geometryDonneeFixeController = require("../controllers/geometryDonneeFixeController");
const imageController = require("../controllers/imageController");

const routes = [
  
  // ****** Intervention ROUTES ******
  {
    /** Récupération de toutes les interventions */
    method: "GET",
    url: "/api/interventions",
    handler: interventionController.getInterventions,
  },
  {
    /** Récupération d'une intervention par son ID*/
    method: "GET",
    url: "/api/intervention/:idIntervention",
    handler: interventionController.getSingleIntervention,
  },
  {
    /** Ajout d'une intervention */
    method: "POST",
    schema: {
      body: {
        type: 'object',
        description: 'an object',
        examples: [
          {
            name: 'Object Sample',
            summary: 'an example',
            value: { a: 'payload' },
          }
        ],
        properties: {
          id: {
            type: 'string',
            description: 'user id'
          }
        }
        
      }
    },
    
    url: "/api/intervention",
    handler: interventionController.addIntervention,
  },
  {
    /** Modification d'une intervention */
    method: "PUT",
    url: "/api/intervention",
    handler: interventionController.updateIntervention,
  },
  {
    /** Suppression d'une intervention */
    method: "DELETE",
    url: "/api/intervention/:idIntervention",
    handler: interventionController.deleteIntervention,
  },
  
  // ****** User ROUTES ******
  {
    /** Login */
    method: "POST",
    properties: {
      nom: "string",
      prenom: "string",
      email: "string",
      password: "string",
    },
    url: "/api/login",
    handler: userController.login,
  },
  
  {
    /** Signup */
    method: "POST",
    properties: {
      email: "string",
      password: "string",
    },
    url: "/api/signup",
    handler: userController.signup,
  },
  
  {
    /** get all users */
    method: "GET",
    url: "/api/getusers",
    handler: userController.getUsers,
  },
  // ****** Intervention ROUTES ******

  
  




  
  // ****** Moyens ROUTES ******
  {
    /** Ajout d'un moyen */
    method: "POST",
    url: "/api/add_moyen",
    handler: moyensController.addMoyen,
  },
  {
    /** Récupération des différents moyens + le nombre disponible */
    method: "GET",
    url: "/api/liste_de_moyens",
    handler: moyensController.getNumberOfMoyens,
  },
  {
    /** Récupération des différents moyens + le nombre disponible */
    method: "GET",
    url: "/api/getMoyenByCode/:code",
    handler: moyensController.getMoyenByCode,
  },
  
  {
    /** Récupération de tous les moyens disponible */
    method: "GET",
    url: "/api/moyens_disponibles",
    handler: moyensController.getMoyensDisponibles,
  },
  {
    /** Récupération des moyens d'une intervention */
    method: "GET",
    url: "/api/moyens/:idIntervention",
    handler: moyensController.getMoyensByIntervention,
  },
  {
    /** Récupération des moyens d'une intervention */
    method: "GET",
    url: "/api/liberationdemoyens",
    handler: moyensController.liberationdemoyens,
  },

  {
    /** Récupération des moyens d'une intervention */
    method: "DELETE",
    url: "/api/delete_all_moyens",
    handler: moyensController.deleteMoyens,
  },
  
  // ****** Fin Moyens ROUTES ******
  
  
  


  
  
  
  // ****** Demande Moyens ROUTES ******
  
  {
    /** Récupération d'une demande de moyen */
    method: "GET",
    url: "/api/getdemandemoyenbyintervention/:idIntervention",
    handler: demandeMoyenController.getdemandemoyenbyintervention,
  },
  {
    /** Récupération des demande de moyen en attente */
    method: "GET",
    url: "/api/liste_demande_moyen",
    handler: demandeMoyenController.getDemandeMoyenDisponible,
  },
  {
    /** Ajout d'une demande de moyens COS*/
    method: "POST",
    url: "/api/demandemoyenscos",
    handler: demandeMoyenController.demandeDeMoyenCos,
  },
  {
    /** Ajouter une demande de moyens CODIS*/
    method: "POST",
    url: "/api/demandemoyenscodis",
    handler: demandeMoyenController.demandeDeMoyenCodis,
  },
  {
    /** Suppression d'une demande de moyens */
    method: "DELETE",
    url: "/api/demandemoyen/:idDemandeMoyen",
    handler: demandeMoyenController.deleteDemandeMoyen,
  },
  {
    /** Suppression de toutes les demande de moyens */
    method: "DELETE",
    url: "/api/demandesmoyen",
    handler: demandeMoyenController.deleteDemandesMoyen,
  },
  
  {
    /** Validation d'une demande de moyens */
    method: "POST",
    url: "/api/validedemandemoyen",
    handler: demandeMoyenController.validerDemandeMoyen,
  },
  {
    /** Engager une demande de moyen */
    method: "POST",
    url: "/api/engager_demande_moyen",
    handler: demandeMoyenController.engagerDemandeMoyen,
  },
  {
    /** Liberer une demande de moyen */
    method: "POST",
    url: "/api/liberer_demande_moyen",
    handler: demandeMoyenController.libererDemandeMoyen,
  },

  {
    /** Liberer une demande de moyen */
    method: "POST",
    url: "/api/retourner_crm",
    handler: demandeMoyenController.retourCRM,
  },


  
  // {
  //   /** Liberer une demande de moyen */
  //   method: "POST",
  //   url: "/api/ajouter_position_demande_moyen",
  //   handler: demandeMoyenController.ajouterPositionDemandeMoyen,
  // },
  {
    /** Liberer une demande de moyen */
    method: "POST",
    url: "/api/transiter_demande_de_moyen",
    handler: demandeMoyenController.transiterDemandeMoyen,
  },

  // ****** Demande Moyens ROUTES ******












  // ****** Donnee Fixe ROUTES ******
  
  {
    /** Récupération données Fixes */
    method: "GET",
    url: "/api/getDonneeFixeByIntervention/:idIntervention",
    handler: geometryDonneeFixeController.getDonneeFixeByIntervention,
  },
  {
    /** Récupération données Dynamiques */
    method: "GET",
    url: "/api/getDonneeDynamiqueByIntervention/:idIntervention",
    handler: geometryDonneeFixeController.getDonneeDynamiqueByIntervention,
  },
  {
    /** Ajouter une donnee */
    method: "POST",
    url: "/api/adddonnee",
    handler: geometryDonneeFixeController.addDonnee,
  },
  {
    /** Ajouter toutes les données du JSON */
    method: "POST",
    url: "/api/adddonnees",
    handler: geometryDonneeFixeController.addDonnees,
  },
  {
    /** Suppression de toutes les données */
    method: "DELETE",
    url: "/api/deleteDonnee",
    handler: geometryDonneeFixeController.deleteDonnee,
  },
  {
    /** Suppression d'une données */
    method: "DELETE",
    url: "/api/delete_donnee_by_id/:idDonneeFixe",
    handler: geometryDonneeFixeController.deleteDonneeById,
  },
  // ****** Donnee Fixe ROUTES ******
  
  



  
  
  // ****** Drone ROUTES ******
  {
    /** Récupération des informations du drone pour une intervention*/
    method: "GET",
    url: "/api/drone/:idIntervention",
    handler: droneController.getDroneInformationsByIntervention,
  },
  // {
  //   /** Ajouter un schéma de vol au drone */
  //   method: "POST",
  //   url: "/api/drone/add_donnee",
  //   handler: droneController.addDonnee,
  // },
  // {
  //   /** Ajouter un point à survoler */
  //   method: "POST",
  //   url: "/api/drone/add_point",
  //   handler: droneController.addPoint,
  // },
  {
    /** Ajouter une mission */
    method: "POST",
    url: "/api/drone/lancer_mission",
    handler: droneController.lancerMission,
  },
  // {
  //   /** Démarrer la Vidéo */
  //   method: "GET",
  //   url: "/api/drone/demarrer_video",
  //   handler: droneController.demarrerVideo,
  // },
   {
     /** Update les values du drone */
     method: "POST",
     url: "/api/drone/update_drone_value",
     handler: droneController.updateDroneValues,
   },
  {
    /** Démarrer la Vidéo */
    method: "GET",
    url: "/api/drone/arreter_mission/:idIntervention",
    handler: droneController.arreterMission,
  },
  {
    /** Return true if drone en cours de mission */
    method: "GET",
    url: "/api/drone/is_en_cours/:idIntervention",
    handler: droneController.isEnCours,
  },
  {
    /** Suppression d'une intervention */
    method: "DELETE",
    url: "/api/drone/delete_all_drones",
    handler: droneController.deleteAllDroneIntervention,
  },

  


  
  // ****** Image ROUTES ******
  {
    /** Ajouter une images du drone selon un point */
    method: "POST",
    url: "/api/drone/add_image_point",
    handler: imageController.addImagePoint,
  },
  {
    /** Ajouter une images du drone selon un point */
    method: "POST",
    url: "/api/drone/add_image_video",
    handler: imageController.addImageVideo,
  },
  {
    /** Recuperation d'une image par son nom, son point et son intervention*/
    method: "GET",
    url: "/api/drone/getImage/:idIntervention/:indexPoint/:name",
    handler: imageController.getImageByInterventionAndNameAndPoint,
  },
  {
    /** Recuperation des noms d'image  */
    method: "GET",
    url: "/api/drone/getImages/:idIntervention/:indexPoint",
    handler: imageController.getImagesByPointAndIntervention,
  },
  {
    /** Recuperation des noms d'image  */
    method: "GET",
    url: "/api/drone/getImageVideo/:idIntervention",
    handler: imageController.getImageVideoByIntervention,
  },
  {
    /** Recuperation des noms d'image  */
    method: "GET",
    url: "/api/drone/getPointsByIntervention/:idIntervention",
    handler: imageController.getPointByIntervention,
  },
  {
    /** Suppression d'une intervention */
    method: "DELETE",
    url: "/api/drone/delete_all_images",
    handler: imageController.deleteAllImages,
  },
  
  // {
  //   /** Récupération des images selon Intervention ou Intervention/Points */
  //   method: "GET",
  //   url: "/api/image_intervention_point",
  //   handler: imageController.getImagesOfInterventionsPoint,
  // },
  // {
  //   /** Récupération d'un moyen par son ID*/
  //   method: "GET",
  //   url: "/api/imagefromname/:name",
  //   handler: imageController.getImageFromName,
  // },

];

module.exports = routes;
