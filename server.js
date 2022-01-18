// Définition des Librairies à utiliser
const routes = require("./src/routes/routes");
const mongoose = require("mongoose"); 
const fastify = require("fastify")({
  logger: true,
  prettyPrint: true,
});
const swagger = require('./src/config/swagger')
const Pusher = require("pusher")

//Définition des constantes

const PORT = process.env.PORT || 3000;
const MONGOLINK = process.env.MONGOLINK || "mongodb+srv://pituser:KRQfo7VPHr5aIQjT@pitcluster.cpoef.mongodb.net/Pit?retryWrites=true&w=majority";

// Lancer le serveur
const start = async () => {
  try {
    await fastify.listen(PORT, '0.0.0.0');
    fastify.swagger()
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();

mongoose.connect(MONGOLINK,{ useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log("MongoDB connected…"))
  .catch((err) => console.log(err));

// Register Swagger
fastify.register(require('fastify-swagger'), swagger.options)
routes.forEach((route, index) => {
  fastify.route(route);
});

exports.pusher = new Pusher({
  appId: "1177682",
  key: "929626535706f3d50e52",
  secret: "271e5af2c98aac1646d7",
  cluster: "eu",
  useTLS: true
});