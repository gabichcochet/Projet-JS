const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Configuration
const PORT = 8080;
const CLE_SECRETE = 'ma-cle-secrete'; // à garder confidentielle
const cheminFichier = './users.json';

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // ou 'pages' si tu as renommé
app.use(express.static('public'));

// Chargement des utilisateurs depuis le fichier
let utilisateurs = [];
try {
  const donnees = fs.readFileSync(cheminFichier, 'utf8');
  utilisateurs = JSON.parse(donnees);
} catch (err) {
  console.error("Erreur de lecture du fichier users.json :", err);
}

// Middleware d'authentification
function verifierConnexion(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect('/connexion');

  try {
    const decoded = jwt.verify(token, CLE_SECRETE);
    const utilisateur = utilisateurs.find(u => u.id === decoded.id);
    if (!utilisateur) return res.redirect('/connexion');

    req.utilisateur = utilisateur;
    next();
  } catch {
    return res.redirect('/connexion');
  }
}

// Routes

// Page d'accueil
app.get('/accueil', (req, res) => {
  res.render('accueil');
});

// Page "Mon compte"
app.get('/compte', verifierConnexion, (req, res) => {
  res.render('compte', { utilisateur: req.utilisateur });
});

app.post('/compte', verifierConnexion, (req, res) => {
  const { nom, prenom, email, mdp } = req.body;
  const utilisateur = req.utilisateur;

  // Mise à jour de l'utilisateur
  utilisateur.nom = nom;
  utilisateur.prenom = prenom;
  utilisateur.email = email;
  utilisateur.mdp = mdp;

  // Sauvegarde dans le fichier JSON
  fs.writeFileSync(cheminFichier, JSON.stringify(utilisateurs, null, 2));
  res.redirect('/compte');
});

// Inscription
app.get('/inscription', (req, res) => {
  res.render('inscription');
});

app.post('/inscription', (req, res) => {
  const { nom, prenom, email, mdp } = req.body;
  const existant = utilisateurs.find(u => u.email === email);
  if (existant) return res.send('Cet email est déjà utilisé.');

  const nouvelUtilisateur = {
    id: Date.now(),
    nom,
    prenom,
    email,
    mdp
  };

  utilisateurs.push(nouvelUtilisateur);
  fs.writeFileSync(cheminFichier, JSON.stringify(utilisateurs, null, 2));
  res.redirect('/connexion');
});

// Connexion
app.get('/connexion', (req, res) => {
  res.render('connexion');
});

app.post('/connexion', (req, res) => {
  const { email, mdp } = req.body;
  const utilisateur = utilisateurs.find(u => u.email === email && u.mdp === mdp);

  if (!utilisateur) return res.send('Identifiants incorrects');

  const token = jwt.sign({ id: utilisateur.id }, CLE_SECRETE, { expiresIn: '1h' });
  res.cookie('token', token, { httpOnly: true });
  res.redirect('/compte');
});

// Déconnexion
app.get('/deconnexion', (req, res) => {
  res.clearCookie('token');
  res.redirect('/connexion');
});

// Page racine
app.get('/', (req, res) => {
  res.redirect('/accueil');
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}/inscription`);
});
