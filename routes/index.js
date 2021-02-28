var express = require('express');
var router = express.Router();
const crypto = require('crypto');

let usersMockDB = [
  {
      username: 'admin',
      password: 'XohImNooBHFR0OVvjcYpJ3NgPQ1qq73WKhHvch0VQtg='
  }
];

// Database setup
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')

// Create file sync adapter and connect
const adapter = new FileSync('db.json')
const db = low(adapter)
if ( db.get('users').value().length < 1 ) {
  db.defaults({
    "users": require('../MOCK_DATA.json')
  }).write();
  
}

const requireAuth = (req, res, next) => {
  const authToken = req.cookies['AuthToken'];

  if (authToken) {
      next();
  } else {
      res.render('login', {
          message: 'Please login to continue',
      });
  }
};

const authTokens = {};

const generateAuthToken = () => {
  return crypto.randomBytes(30).toString('hex');
}

router.post('/login/', (req, res) => {
  const { username, password } = req.body;
  const hasher = crypto.createHash('sha256');
  const hashedPassword = hasher.update(password).digest('base64');

  const user = usersMockDB.find(u => {
      return u.username === username && hashedPassword === u.password
  });

  if (user) {
      const authToken = generateAuthToken();

      // Store authentication token
      authTokens[authToken] = user;

      // Setting the auth token in cookies
      res.cookie('AuthToken', authToken);

      // Redirect user to the protected page
      res.redirect('/business_contacts/');
  } else {
      res.render('login', {
          message: 'Invalid username or password'
      });
  }
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Smit Mandavia' });
});

router.post('/contact_submission/', function(req, res) {
  console.log(req.body);
  res.redirect(301, '/');
});

router.get('/about/', function(req, res, next) {
  res.render('about', { title: 'Smit Mandavia' });
});

router.get('/projects/', function(req, res, next) {
  res.render('projects', { title: 'Smit Mandavia' });
});

router.get('/services/', function(req, res, next) {
  res.render('services', { title: 'Smit Mandavia' });
});

router.get('/contact/', function(req, res, next) {
  res.render('contact', { title: 'Smit Mandavia' });
});

router.get('/login/', function(req, res, next) {
  res.render('login', { title: 'Login', message: null });
});

router.get('/business_contacts/', requireAuth, (req, res) => {
  res.render('business_contacts', { title: 'Business Contacts',
  contacts: db.get("users").value() });
});

router.get('/edit/:id/', requireAuth, (req, res) => {
  res.render('update_bs_ct', { title: 'Edit Business Contact',
  contact: db.get("users").find({_id: parseInt(req.params.id)}).value() });
});

router.post('/edit/:id/', requireAuth, (req, res) => {

  db.get('users')
  .find({ _id: parseInt(req.params.id) })
  .assign({
    contact_name: req.body.name,
    email_address: req.body.email,
    contact_number: req.body.phone 
  })
  .write()
  res.redirect('/business_contacts/');
});

router.get('/delete/:id/', requireAuth, (req, res) => {
  console.log(req.params.id)
  db.get('users')
  .remove({ _id: parseInt(req.params.id) })
  .write();
  res.redirect('/business_contacts/');
});

module.exports = router;
