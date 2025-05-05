const express = require('express');
const app = express();
const path = require('path');

// Middleware pour lire les données de formulaires
app.use(express.urlencoded({ extended: true }));

// Configuration des vues et des fichiers statiques
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'pages'));
app.use(express.static('public'));

let utilisateurs = [];
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

app.use(cookieParser());
const CLE_SECRETE = 'ma-cle-secrete'; // à garder privée

function verifierConnexion(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect('/connexion');

  try {
    const decoded = jwt.verify(token, CLE_SECRETE);
    req.utilisateur = utilisateurs.find(u => u.id === decoded.id);
    if (!req.utilisateur) return res.redirect('/connexion');
    next();
  } catch {
    return res.redirect('/connexion');
  }
}

// Simuler un utilisateur
let utilisateur = {
  id: 1,
  nom: 'Dupont',
  prenom: 'Alice',
  email: 'alice@example.com',
  mdp: 'q8gdrg48'
};

// Route GET : afficher les infos du compte
app.get('/compte', (req, res) => {
  res.render('compte', { utilisateur });
});

// Route POST : mettre à jour les infos
app.post('/compte', (req, res) => {
  const { nom, prenom, email, mdp} = req.body;
  utilisateur = { nom, prenom, email, mdp}; // mise à jour en mémoire
  res.redirect('/compte');
});

app.get('/inscription', (req, res) => {
  res.render('inscription');
});

app.get('/deconnexion', (req, res) => {
  res.clearCookie('token');
  res.redirect('/connexion');
});

app.post('/inscription', (req, res) => {
  const { nom, prenom, email, mdp } = req.body;
  const nouvelUtilisateur = { id: Date.now(), nom, prenom, email, mdp };
  utilisateurs.push(nouvelUtilisateur);
  res.redirect('/connexion');
});

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

app.get('/accueil', (req, res) => {
  res.render('accueil')
});

app.get('/', (req, res) => {
  res.send('Vous êtes à la racine');
});

// Lancer le serveur
app.listen(8080, () => {
  console.log('Serveur démarré sur http://localhost:8080/inscription');
});
