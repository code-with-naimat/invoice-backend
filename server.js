require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
 
connectDB();

const app = express();
console.log("CLIENT_ORIGIN =", process.env.CLIENT_ORIGIN);
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*'}));
app.use(express.json());

app.get('/', (req, res) => res.json({status: 'Invoice Generator API is running'}));
app.get('/test', (req, res) => {
  res.json({ message: 'Test Route Working' });
});


app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/api-keys', apiKeyRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server running on port ${PORT}`));
