const mongoose = require('mongoose');
const Product = require('../models/Product');

mongoose.connect('mongodb+srv://safeeofficial1730_db_user:sabeeatlas1730@merncluster1.r2hejmk.mongodb.net/NammaKada?appName=MERNcluster1').then(async () => {
    await Product.deleteMany({ name: { $in: ['Organic Honey 500g', 'Handwoven Cotton Saree'] } });
    console.log('Products deleted');
    process.exit(0);
});
