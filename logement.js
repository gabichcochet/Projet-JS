const mongoose = require('mongoose');

const logementSchema = new mongoose.Schema({
  titre: String,
  description: String,
  prix: Number,
  adresse: String,
  latitude: Number,
  longitude: Number,
  image: String, // chemin vers l'image
  utilisateurId: Number // si tu veux lier à un user
});

module.exports = mongoose.model('Logement', logementSchema);