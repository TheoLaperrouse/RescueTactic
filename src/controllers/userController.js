const boom = require("boom");
const bcrypt = require("bcrypt");

const User = require("../schemas/userSchema");

// Return true si le parametre est le format d'une adrese email
function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

// Fonction de connexion
exports.login = async (req, res) => {
  try {
    const body = req.body;
    // Recherche de l'utilisateur
    const user = await User.findOne({ email: body.email });
    if (user) {
      // comparaison avec le mot de passe chiffré dans la base de données
      const validPassword = await bcrypt.compare(body.password, user.password);

      if (validPassword) {
        // Mot de passe correct
        res.status(200).send({nom : user.nom, prenom : user.prenom});
      } else {
        // Mot de passe incorrect
        res.status(400).send("Invalid Password");
      }
    } else {
      // L'utilisteur n'existe pas en base
      res.status(401).send("User does not exist");
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.signup = async (req, res) => {
  try {
    const body = req.body;
    if (!(body.email && body.password)) {
      return res.status(400).send({ error: "Veuillez remplir les champs email et mot de passe." });
    }

    const user = await User.findOne({ email: body.email });
    
    if (!user) {

      if(validateEmail(body.email)){
        // Création d'un utilisateur
        const user = new User(body);
        // Création de sel pour le chiffrement du mot de passe
        const salt = await bcrypt.genSalt(10);
        // Chiffrement du mot de passe
        user.password = await bcrypt.hash(user.password, salt);
        user
          .save()
          .then((doc) => res.status(201).send({nom : user.nom, prenom : user.prenom}));
      }else{
        return res.status(400).send({ error: "Veuillez renseigner un email valide." });
      }
    } else {
      return res.status(409).send({ error: "L'email renseigné est déjà utilisé, veuillez utiliser un autre email." });
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};



exports.getUsers = async (req, res) => {
  try {
    return await User.find();
  } catch (err) {
    throw boom.boomify(err)
  }
}


