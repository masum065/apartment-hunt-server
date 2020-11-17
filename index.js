const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zp3ic.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const ObjectId = require('mongodb').ObjectId;

const port = 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('images'));
app.use(fileUpload());

const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

client.connect((err) => {
	const apartmentCollection = client
		.db(`${process.env.DB_NAME}`)
		.collection('apartmentList');
	const bookingCollection = client
		.db(`${process.env.DB_NAME}`)
		.collection('bookingList');
	//   const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admins");

	// Add New Rent House

	app.post('/addhouse', (req, res) => {
		const file = req.files.file;
		const title = req.body.title;
		const price = req.body.price;
		const location = req.body.location;
		const bedroom = req.body.bedroom;
		const bathroom = req.body.bathroom;
		const newImg = file.data;
		const encImg = newImg.toString('base64');

		const image = {
			contentType: file.mimetype,
			size: file.size,
			img: Buffer.from(encImg, 'base64'),
		};

		apartmentCollection
			.insertOne({ title, image, price, location, bedroom, bathroom })
			.then((result) => {
				res.send(result.insertedCount > 0);
			});
	});

	// get Rent House List
	app.get('/apartments', (req, res) => {
		apartmentCollection.find({}).toArray((err, documents) => {
			res.send(documents);
		});
	});

	// get apartment details
	app.get('/book-apartment/:key', (req, res) => {
		apartmentCollection
			.find({
				_id: ObjectId(req.params.key),
			})
			.toArray((err, documents) => {
				res.send(documents[0]);
			});
	});

	app.post('/reqBooking', (req, res) => {
		const orderData = req.body;
		bookingCollection.insertOne(orderData).then((result) => {
			res.send(result.insertedCount > 0);
		});
	});

	// Filter By Booking List
	app.post('/bookingList', (req, res) => {
		const email = req.body.email;
		bookingCollection.find({ email: email }).toArray((err, documents) => {
			res.send(documents);
		});
	});

	app.get('/allBookings', (req, res) => {
		bookingCollection.find({}).toArray((err, documents) => {
			res.send(documents);
		});
	});
});

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.listen(process.env.PORT || port);

// "start": "node index.js",
// "start:dev": "nodemon index.js",
