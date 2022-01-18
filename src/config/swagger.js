exports.options = {
  routePrefix: "/",
  exposeRoute: true,
  swagger: {
    info: {
      title: "PIT Project",
      description:
        "Développement d’une appli éditeur de situation tactique multi-utilisateur sur tablette Android. Plusieurs utilisateurs vont pouvoir interagir sur une même intervention pour effectuer diverses actions.",
      version: "1.1.0",
    },
    externalDocs: {
      url: "https://hackmd.io/FaJuVskHRHC_UOzIYgFZmA",
      description: "Plus d'informations sur notre projet Rescue Tactic",
    },
    host: "pitgroupb.istic.univ-rennes1.fr",
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],

    // tags: [
    //   { name: 'user', description: 'User related end-points' },
    //   { name: 'code', description: 'Code related end-points' }
    // ],

    
  },
};
