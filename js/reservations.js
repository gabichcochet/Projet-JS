const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const { verifierConnexion } = require('./auth')

const hotelsFile       = path.join(__dirname, 'hotels.json')
const reservationsFile = path.join(__dirname, 'reservations.json')

function loadHotels() {
  try { return JSON.parse(fs.readFileSync(hotelsFile, 'utf8')) }
  catch { return [] }
}
function loadReservations() {
  try { return JSON.parse(fs.readFileSync(reservationsFile, 'utf8')) }
  catch { return [] }
}
function saveReservations(data) {
  fs.writeFileSync(reservationsFile, JSON.stringify(data, null, 2))
}

// GET /reservations — afficher les réservations
router.get('/', verifierConnexion, (req, res) => {
  const hotels  = loadHotels()
  const réservs = loadReservations().filter(r => r.userId === req.utilisateur.id)

  const mesHotels = réservs.map(r => {
    const h = hotels.find(h => h.id === r.hotelId)
    return {
      reservationId: r.id,      // <-- on garde l'ID de la réser­va­tion
      id:            h.id,
      nom:           h.nom,
      image:         h.image,
      date:          new Date(r.date).toLocaleDateString('fr-FR', {
                       day: '2-digit', month: '2-digit', year: 'numeric'
                     })
    }
  })

  res.render('reservations', { mesHotels })
})

// POST /reservations/:resId/annuler — annuler une réservation
router.post('/:resId/annuler', verifierConnexion, (req, res) => {
  const resId        = parseInt(req.params.resId, 10)
  let réservs        = loadReservations()
  const initialCount = réservs.length

  // Ne garder que les réservations qui ne correspondent pas à celle annulée
  réservs = réservs.filter(r =>
    !(r.id === resId && r.userId === req.utilisateur.id)
  )

  // Sauvegarde si quelque chose a changé
  if (réservs.length < initialCount) {
    saveReservations(réservs)
  }

  res.redirect('/reservations')
})

module.exports = router
