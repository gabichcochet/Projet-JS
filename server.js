const express = require('express')
const app = express()
const path = require('path')
const cookieParser = require('cookie-parser')
const routesConnexion = require('./js/auth')
require('dotenv').config()

const PORT = process.env.PORT

app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))

// dans server.js, après avoir instancié app...
const hotelsRouter = require('./js/hotels');
app.use('/hotels', hotelsRouter);

const reservationsRouter = require('./js/reservations')
app.use('/reservations', reservationsRouter)

// et, si tu veux que '/accueil' y redirige :
app.get('/accueil', (req, res) => res.redirect('/hotels'))

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
