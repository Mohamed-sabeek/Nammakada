require('dotenv').config({ path: __dirname + '/.env' });
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function migrate() {
    try {
        console.log('Attempting to create NammaKada root folder...');
        try {
            await cloudinary.api.create_folder('NammaKada');
        } catch (e) {
            console.log('NammaKada folder might already exist or create failed:', e.message);
        }

        console.log('Migrating nammakada_products -> NammaKada/products...');
        try {
            await cloudinary.api.rename_folder('nammakada_products', 'NammaKada/products');
            console.log('Moved products successfully.');
        } catch (e) {
            console.log('Products migration failed/skipped:', e.message);
        }

        console.log('Migrating profiles -> NammaKada/profiles...');
        try {
            await cloudinary.api.rename_folder('profiles', 'NammaKada/profiles');
            console.log('Moved profiles successfully.');
        } catch (e) {
            console.log('Profiles migration failed/skipped:', e.message);
        }

        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

migrate();
