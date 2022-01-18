# Rescue Tactic

Application NodeJS/Android : Application de gestion d'intervention pour les pompiers. 

## Projet M2 :

Projet réalisé en groupe de 12 pendant deux semaines
Ici seulement la partie Back faite avec mon collègue Alex Van Niekerk


## Technos utilisé

MongoDB : 4.0

Node : 12.21.0
- "boom": "^7.3.0" -> Meilleur code erreur HTTP pour un débuggage plus simple
- "dotenv": "^8.2.0" -> Accès aux variables d'environnement dans le .env
- "fastify": "^3.11.0" -> Framework pour Appli Node.JS simple et expérience développeur +
- "fastify-swagger": "^4.0.1" -> Doc Swagger créé automatique grâce aux routes
- "mongodb": "^3.6.3" -> Librairie pour l'accès aux données et connexion
- "mongoose": "^5.11.14", -> Librairie pour définition des schémas
- "nodemon": "^2.0.7" -> Meilleur expérience développeur : Relancement du serveur à la sauvegarde de fichier

## Architecture du back : 

Arbre de l'architecture: 
```
.
├── deploy.sh
├── docker-compose.yml
├── Dockerfile
├── drone
│   ├── cancelMission.py
│   ├── mission.py
│   ├── mission.sh
│   ├── README.md
│   ├── requirement.txt
│   ├── screen_scripts
│   │   ├── __init__.py
│   │   ├── jimutmap.py
│   │   └── take_screenshot.py
│   └── telemetry.py
├── package.json
├── package-lock.json
├── README.md
├── scripts
│   ├── DangerBeaulieu.json
│   ├── geometry_points.json
│   ├── moyens.json
│   └── scriptRandomValues.js
├── server.js
├── src
│   ├── config
│   │   └── swagger.js
│   ├── controllers
│   │   ├── demandeMoyenController.js
│   │   ├── droneController.js
│   │   ├── geometryDonneeFixeController.js
│   │   ├── imageController.js
│   │   ├── interventionController.js
│   │   ├── moyensController.js
│   │   └── userController.js
│   ├── routes
│   │   └── routes.js
│   └── schemas
│       ├── demandeMoyenSchema.js
│       ├── droneSchema.js
│       ├── geometryDonneeFixeSchema.js
│       ├── imageSchema.js
│       ├── interventionSchema.js
│       ├── moyenSchema.js
│       └── userSchema.js
└── uploads
```
config/swagger.js : définition de la config de swagger

controllers/interventionController.js : définition des requêtes à faire en base

controllers/userController.js : définition des requêtes à faire en base

controllers/moyensController.js : définition des requêtes à faire en base

routes/routes.js : définition des différentes routes de l'API

schemas/interventionSchema.js : définition des schémas des objet en BDD

server.js : Point de lancement du serveur, Connexion à la base et écoute sur port 3000

## Installation & Lancement :

Installation des modules node :
```
npm install
```

Lancement du serveur en local: 
```
node server.js
```

Lancement du serveur en local pour le développement (Sauvegarde automatique des fichier avec Nodemon) :
```
npm start
```

Lancement du serveur via un docker en l'exposant sur le port 3000 :
```
docker build -t servnode .
docker run --name servnode -p 3000:3000 servnode
```
Arrêter le container docker :
```
docker stop servnode
```

Lancer une stack de back(Serveur + BDD): 
```
docker-compose build
docker-compose up
```

## Vérifier le fonctionnement des routes :

Après lancement du serveur se rendre ici :
[Swagger avec les différentes routes](http://localhost:3000/documentation/static/index.html)

Envoi de requêtes à l'API directement avec l'interface Web de Swagger ou avec un outil comme Insomnia, Postman ou curl.

Envoi de requêtes à l'API directement avec l'interface Web de Swagger ou avec un outil comme Insomnia, Postman ou curl.

## Générateur de valeurs aléatoires selon des schémas:

Génération de données aléatoires grâce à la lib mongoose-dummy
```
node scriptRandomValues.js
```
