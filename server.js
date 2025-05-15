const mongoose = require('mongoose');
const Logement = require('./logement');

app.get('/logement', async (req, res) => {
  const logements = await Logement.find();
  res.render('logements', { logements });
});


// Connexion à la base de données
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur de connexion MongoDB :', err));
const express = require('express')
const app = express()
const path = require('path')
const cookieParser = require('cookie-parser')
const routesConnexion = require('./js/auth')
require('dotenv').config()

const PORT = process.env.PORT || 8080

app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))

app.use('/', routesConnexion)

app.get('/accueil', (req, res) => {
	res.render('accueil')
})

app.get('/', (req, res) => {
	res.redirect('/accueil')
})

app.listen(PORT, () => {
	console.log(`✅ Serveur démarré sur http://localhost:${PORT}/inscription`)
})
