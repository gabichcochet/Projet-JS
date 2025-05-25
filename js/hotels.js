const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const { verifierConnexion } = require('./auth')

const hotelsFile        = path.join(__dirname, 'hotels.json')
const reservationsFile  = path.join(__dirname, 'reservations.json')

// Lit la liste des hôtels
function loadHotels() {
  try {
    return JSON.parse(fs.readFileSync(hotelsFile, 'utf8'))
  } catch {
    return []
  }
}

// Lit les réservations
function loadReservations() {
  try {
    return JSON.parse(fs.readFileSync(reservationsFile, 'utf8'))
  } catch {
    return []
  }
}

// Sauve les réservations
function saveReservations(data) {
  fs.writeFileSync(reservationsFile, JSON.stringify(data, null, 2))
}

// GET /hotels — liste tous les hôtels
router.get('/', (req, res) => {
  const hotels = loadHotels()
  res.render('accueil', { hotels })
})

// GET /hotels/:id — détail d’un hôtel
router.get('/:id', (req, res) => {
  const hotels = loadHotels()
  const hotel  = hotels.find(h => h.id === parseInt(req.params.id, 10))
  if (!hotel) return res.status(404).send('Hôtel non trouvé')

  // message de confirmation ou d'erreur éventuel
  const msg = req.query.msg || null
  res.render('details', { hotel, msg })
})

// POST /hotels/:id/reserver — réserver un hôtel (utilisateur connecté)
router.post('/:id/reserver', verifierConnexion, (req, res) => {
  const hotelId      = parseInt(req.params.id, 10)
  const reservations = loadReservations()

  // Vérifier si l'utilisateur a déjà réservé cet hôtel
  const existe = reservations.some(r =>
    r.hotelId === hotelId && r.userId === req.utilisateur.id
  )

  if (!existe) {
    reservations.push({
      id:       Date.now(),
      hotelId:  hotelId,
      userId:   req.utilisateur.id,
      date:     new Date().toISOString()
    })
    saveReservations(reservations)
  }

  // Rediriger vers la même page avec un message
  const message = existe
    ? 'Vous avez déjà réservé cet hôtel.'
    : 'Réservation confirmée !'

  res.redirect(`/hotels/${hotelId}?msg=${encodeURIComponent(message)}`)
})

module.exports = router
