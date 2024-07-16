const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Dhanya4CB21IS013/-*',
  database: 'shops',
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed: ', err);
  } else {
    console.log('Connected to the database');
  }
});

// Endpoint for user signup
app.post('/api/signup', (req, res) => {
  console.log('Received registration request:', req.body);
  const { email, psw } = req.body; // Adjusted to match input field names

  bcrypt.hash(psw, 10, (hashErr, hashedPassword) => {
    if (hashErr) {
      console.error('Error hashing password:', hashErr);
      return res.status(500).json({ error: 'Internal server error - hashing password' });
    }

    connection.query(
      'INSERT INTO users(email, password) VALUES(?, ?)',
      [email, hashedPassword],
      (queryErr, results) => {
        if (queryErr) {
          console.error('Error registering user:', queryErr);
          return res.status(500).json({ error: 'Internal server error - inserting into database' });
        }

        const id = results.insertId;
        console.log('User registered successfully. id:', id);

        res.status(200).json({ id, email });
      }
    );
  });
});

app.post('/api/login', (req, res) => {
  const { email, psw } = req.body;

  connection.query(
    'SELECT * FROM users WHERE email=?',
    [email],
    (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ error: 'Internal server error - querying database' });
      }

      if (results.length === 0) {
        // Email not found
        console.log('Email not found');
        return res.status(400).json({ error: 'Email or password is incorrect' });
      }

      const users = results[0];

      bcrypt.compare(psw, users.password, (bcryptErr, bcryptResult) => {
        console.log('Bcrypt comparison result:', bcryptResult);
      
        if (bcryptErr) {
          console.error('Error comparing passwords:', bcryptErr);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (bcryptResult) {
          // Password match, login successful
          console.log('Login successful');
          
          res.status(200).json({ id: users.id, email: users.email });
          
          
        
        } else {
          // Password doesn't match
          console.log('Incorrect password');
          res.status(400).json({ error: 'Email or password is incorrect' });
        }
      });
    }
  );
});


app.post('/api/addToCart/:product_id', (req, res) => {
  const product_id = parseInt(req.params.product_id);
  const quantity = parseInt(req.body.quantity);

  if (isNaN(product_id) || product_id <= 0 || isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'Invalid product_id or quantity' });
  }

  // Check if there is enough available kg in the product
  connection.query(
    'SELECT AvailableKg FROM products WHERE product_id = ?',
    [product_id],
    (selectErr, selectResult) => {
      if (selectErr) {
        console.error('Error retrieving available kg:', selectErr);
        return res.status(500).json({ error: 'Failed to add to cart' });
      }

      const availableKg = selectResult[0].AvailableKg;

      if (availableKg < quantity) {
        console.log('Not enough available kg');
        return res.status(400).json({ error: 'Not enough available kg' });
      }

      // Update the number of available kg for the product
      connection.query(
        'UPDATE products SET AvailableKg = AvailableKg - ? WHERE product_id = ?',
        [quantity, product_id],
        (updateErr, updateResult) => {
          if (updateErr) {
            console.error('Error updating available kg:', updateErr);
            return res.status(500).json({ error: 'Failed to add to cart' });
          }

          console.log('Successfully added to cart');
          res.status(200).json({ message: 'Added to cart successfully' });
        }
      );
    }
  );
});









app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/signup.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/home.html');
});

app.get('/product', (req, res) => {
  res.sendFile(__dirname + '/product.html');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/home.html');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});