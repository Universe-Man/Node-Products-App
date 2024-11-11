const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

const db = new sqlite3.Database('./products.db', (err) => {
  if (err) {
    console.error(err.message);
  };
  console.log('Connected to the Database.');
});

app.use(express.json());

app.get('/products', (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(rows);
    };
  });
});

app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
    } else if (!row) {
      res.status(404).send('Product Not Found');
    } else {
      res.send(row);
    };
  });
});

app.post('/products', (req, res) => {
  const { name, price } = req.body;
  if (!name || !price) {
    res.status(400).send('Name and Price are Required');
  } else {
    const sql = 'INSERT INTO products (name, price) VALUES (?, ?)';
    db.run(sql, [name, price], function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Internal Server Error');
      } else {
        const id = this.lastID;
        res.status(201).send({ id, name, price });
      };
    });
  };
});

app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;
  if (!name || !price) {
    res.status(400).send('Name and Price are Required');
  } else {
    const sql = 'UPDATE products SET name = ?, price = ? WHERE id = ?';
    db.run(sql, [name, price, id], function(err) {
      if (err) {
        console.error(err.message);
        res.status(500).send('Internal Server Error');
      } else if (this.changes === 0) {
        res.status(404).send('Product Not Found');
      } else {
        res.status(200).send({ id, name, price });
      };
    });
  };
});

app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal Server Error');
    } else if (this.changes === 0) {
      res.status(404).send('Product Not Found');
    } else {
      res.status(204).send();
    };
  });
});

app.listen(port, () => {
  console.log(`Server Listening on Port ${port}.`);
});