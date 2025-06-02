const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
dotenv.config();
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const attRoutes = require('./controllers/AttController');
const materialRoutes = require('./routes/materialRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes')
const boqRoutes = require('./routes/boqRoutes')
const imageRoutes = require('./routes/ImageRoutes');
const cors = require('cors');
const path = require('path');
const { startBirthdayReminder } = require('./cron/birthdayReminder');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://ops.tradesyndicate.in',
  credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    startBirthdayReminder();
  })
  .catch((error) => console.log(error));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/escape', leaveRoutes);
app.use('/api/pay', salaryRoutes);
app.use('/api/att', attRoutes);
app.use('/api/material', materialRoutes)
app.use('/api/supplier', supplierRoutes)
app.use('/api/purchase', purchaseOrderRoutes)
app.use('/api/boq', boqRoutes)
app.use('/api/pic', imageRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

