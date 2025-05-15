const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Chemin vers hotels.json (même dossier que ce fichier)
const hotelsFile = path.join(__dirname, 'hotels.json');

function loadHotels() {
  try {
    const data = fs.readFileSync(hotelsFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erreur lecture hotels.json :', err);
    return [];
  }
}

// GET /hotels — liste tous les hôtels
router.get('/', (req, res) => {
  const hotels = loadHotels();
  res.render('accueil', { hotels });
});

// GET /hotels/:id — détail d’un hôtel
router.get('/:id', (req, res) => {
  const hotels = loadHotels();
  const id = parseInt(req.params.id, 10);
  const hotel = hotels.find(h => h.id === id);

  if (!hotel) {
    return res.status(404).send('Hôtel non trouvé');
  }

  res.render('details', { hotel });
});

module.exports = router;
