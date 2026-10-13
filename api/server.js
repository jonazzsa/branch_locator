const express = require('express');

const branchData = require('./data/branches-mock-data.json');

const app = express();
const PORT = 5001;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.get('/Branch', (req, res) => {
  const { searchQuery } = req.query;

  const branchList = branchData;


  
    return res.json(branchList);
  
});



app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).send("Internal Server Error");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
