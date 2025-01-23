const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/trade', (req, res) => {
    res.status(200).json({ message: 'Trade route is working!' });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
