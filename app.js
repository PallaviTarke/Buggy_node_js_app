// app.js
const express = require('express');
const fs = require('fs'); // ❌ Unused
const app = express();

app.use(express.static('public'));
app.use(express.static('public')); // ❌ Duplicate middleware

console.log("App is starting..."); // ❌ Shouldn't be in prod

app.get('/deprecated', (req, res) => {
  res.sendfile(__dirname + '/index.html'); // ❌ Deprecated method
});

app.get('/', (req, res) => {
  const unused = "not used"; // ❌ Unused variable
  res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 3000; // ❌ Magic number
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

module.exports = app;
