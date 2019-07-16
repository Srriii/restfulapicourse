const range = require('express-range')
const compression = require('compression')

const express = require('express')

const CitiesDB = require('./citiesdb');

//Load application keys
//Rename _keys.json file to keys.json
const keys = require('./keys.json')

console.info(`Using ${keys.mongo}`);

const db = CitiesDB({  
	connectionUrl: keys.mongo, 
	databaseName: 'zips', 
	collectionName: 'city'
});

const app = express();

app.set('etag', false);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Start of workshop

// Mandatory workshop
// TODO GET /api/states
app.get('/api/state',
	(req, resp) => {
		// Content-Type: application.json
		resp.type('application.json')

		db.findAllStates()
			.then(result => {
				// 200 OK
				resp.status(200)
				resp.set('X-Date', (new Date()).toUTCString())
				resp.json(result);
			})
			.catch(error => {
				// 400 Bad Request
				resp.status(400)
				resp.json({ error: error})
			});
	}
);



// TODO GET /api/state/:state
app.get('/api/state/:state',
	(req, resp) => {
		const stateAbbrev = req.params.state;
		resp.type('application.json')
		db.findAllStates()
			.then(result => {
				if (result.indexOf(stateAbbrev.toUpperCase()) < 0) {
					resp.status(400)
					resp.json({error: `Not a valid state: ${stateAbbrev}`})
					return;
				}
				return (db.findCitiesByState(stateAbbrev))
			})
			.then(result => {
				resp.status(200)
				resp.set('X-Date', (new Date()).toUTCString())
				resp.json(result.map(v => `/api/city/${v}`));
			})
			.catch(error => {
				resp.status(400)
				resp.json({error: error})
			});
	}
);



// TODO GET /api/city/:cityId
app.get('/api/city/:cityId',
	(req, resp) => {
		const cityAbbrev = req.params.cityId;
		resp.type('application.json')
		db.findCityById(cityAbbrev)
			.then(result => {
				resp.status(200)
				resp.set('X-Date', (new Date()).toUTCString())
				resp.json(result);
			})
			.catch(error => {
				resp.status(400)
				resp.json({ error: error})
			});
	}
);


// TODO POST /api/city




// Optional workshop
// TODO HEAD /api/state/:state



// TODO GET /state/:state/count



// TODO GET /city/:name



// End of workshop

db.getDB()
	.then((db) => {
		const PORT = parseInt(process.argv[2] || process.env.APP_PORT) || 3000;

		console.info('Connected to MongoDB. Starting application');
		app.listen(PORT, () => {
			console.info(`Application started on port ${PORT} at ${new Date()}`);
		});
	})
	.catch(error => {
		console.error('Cannot connect to mongo: ', error);
		process.exit(1);
	});
