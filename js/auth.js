const express = require('express')
const router = express.Router()
const fs = require('fs')
const jwt = require('jsonwebtoken')
const path = require('path')
require('dotenv').config()

const CLE_SECRETE = process.env.CLE_SECRETE
const cheminFichier = path.join(__dirname, 'users.json')

let utilisateurs = []
try {
	const donnees = fs.readFileSync(cheminFichier, 'utf8')
	utilisateurs = JSON.parse(donnees)
} catch (err) {
	console.error('Erreur de lecture du fichier users.json :', err)
}

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

router.get('/connexion', (req, res) => {
	res.render('connexion', { erreur: null })
})

router.post('/connexion', (req, res) => {
	const { email, mdp } = req.body
	const utilisateur = utilisateurs.find(u => u.email === email && u.mdp === mdp)
	if (!utilisateur) {
  		return res.render('connexion', { erreur: 'Identifiants incorrects' })
	}

	const token = jwt.sign({ id: utilisateur.id }, CLE_SECRETE, { expiresIn: '1h' })
	res.cookie('token', token, { httpOnly: true })
	res.redirect('/compte')
})

router.get('/inscription', (req, res) => {
  res.render('inscription', { erreur: null })
})

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

router.get('/deconnexion', (req, res) => {
	res.clearCookie('token')
	res.redirect('/connexion')
})

router.get('/compte', verifierConnexion, (req, res) => {
	res.render('compte', { utilisateur: req.utilisateur })
})

router.post('/compte', verifierConnexion, (req, res) => {
	const { nom, prenom, email, mdp } = req.body
	const utilisateur = req.utilisateur

	utilisateur.nom = nom
	utilisateur.prenom = prenom
	utilisateur.email = email
	utilisateur.mdp = mdp

	fs.writeFileSync(cheminFichier, JSON.stringify(utilisateurs, null, 2))
	res.redirect('/compte')
})

module.exports = router
