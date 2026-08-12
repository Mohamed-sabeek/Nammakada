const mongoose = require('mongoose');
const Product = require('../models/Product');

require('dotenv').config({ path: __dirname + '/../.env' });
mongoose.connect(process.env.MONGODB_URI).then(async () => {
    await Product.deleteMany({ name: { $in: ['Organic Honey 500g', 'Handwoven Cotton Saree'] } });
    console.log('Products deleted');
    process.exit(0);
});
