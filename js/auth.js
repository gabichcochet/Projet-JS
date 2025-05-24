const express = require('express')
const router = express.Router()
const fs = require('fs')
const jwt = require('jsonwebtoken')
const path = require('path')
require('dotenv').config()

const CLE_SECRETE = process.env.CLE_SECRETE
const cheminFichier = path.join(__dirname, 'users.json')

// Charger les utilisateurs depuis le fichier
let utilisateurs = []
try {
  const donnees = fs.readFileSync(cheminFichier, 'utf8')
  utilisateurs = JSON.parse(donnees)
} catch (err) {
  console.error('Erreur de lecture du fichier users.json :', err)
}

// Middleware pour vérifier que l'utilisateur est connecté
function verifierConnexion(req, res, next) {
  const token = req.cookies.token
  if (!token) return res.redirect('/connexion')

  try {
    const decoded = jwt.verify(token, CLE_SECRETE)
    const utilisateur = utilisateurs.find(u => u.id === decoded.id)
    if (!utilisateur) return res.redirect('/connexion')
    req.utilisateur = utilisateur
    next()
  } catch {
    return res.redirect('/connexion')
  }
}

// Page de connexion
router.get('/connexion', (req, res) => {
  res.render('connexion', { erreur: null })
})

// Traitement du formulaire de connexion
router.post('/connexion', (req, res) => {
  const { email, mdp } = req.body
  const utilisateur = utilisateurs.find(u => u.email === email && u.mdp === mdp)
  if (!utilisateur) {
    return res.render('connexion', { erreur: 'Identifiants incorrects' })
  }

  const token = jwt.sign({ id: utilisateur.id }, CLE_SECRETE, { expiresIn: '1h' })
  res.cookie('token', token, { httpOnly: true })
  res.redirect('/accueil')
})

// Page d'inscription
router.get('/inscription', (req, res) => {
  res.render('inscription', { erreur: null })
})

// Traitement du formulaire d'inscription
router.post('/inscription', (req, res) => {
  const { nom, prenom, email, mdp } = req.body
  const existant = utilisateurs.find(u => u.email === email)
  if (existant) {
    return res.render('inscription', { erreur: 'Cet email est déjà utilisé.' })
  }

  const nouvelUtilisateur = {
    id: Date.now(),
    nom,
    prenom,
    email,
    mdp
  }

  utilisateurs.push(nouvelUtilisateur)
  fs.writeFileSync(cheminFichier, JSON.stringify(utilisateurs, null, 2))
  res.redirect('/connexion')
})

// Déconnexion
router.get('/deconnexion', (req, res) => {
  res.clearCookie('token')
  res.render('deconnexion')
})

// Affichage du compte (GET) avec gestion des messages via query string
router.get('/compte', verifierConnexion, (req, res) => {
  const message = req.query.msg || null
  const erreur  = req.query.err || null
  res.render('compte', {
    utilisateur: req.utilisateur,
    message,
    erreur
  })
})

// Mise à jour du compte (POST) avec Post-Redirect-Get, doublon email et mot de passe conditionnel
router.post('/compte', verifierConnexion, (req, res) => {
  const { nom, prenom, email, mdp } = req.body
  const utilisateur = req.utilisateur

  // Vérifier doublon d'email
  const doublon = utilisateurs.find(u => u.email === email && u.id !== utilisateur.id)
  if (doublon) {
    return res.redirect('/compte?err=' + encodeURIComponent('Cet email est déjà utilisé.'))
  }

  utilisateur.nom    = nom
  utilisateur.prenom = prenom
  utilisateur.email  = email
  if (mdp && mdp.trim() !== '') {
    utilisateur.mdp = mdp
  }

  fs.writeFileSync(cheminFichier, JSON.stringify(utilisateurs, null, 2))

  res.redirect('/compte?msg=' + encodeURIComponent('Profil mis à jour avec succès'))
})

module.exports = router
