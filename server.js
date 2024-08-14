//SERVER SIDE

const express = require('express');
const path = require('path');

const app = express();
const port = 3003; // You can change this to any port number you prefer

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});






