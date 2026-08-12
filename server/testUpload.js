require('dotenv').config({ path: './.env' });
const { uploadToCloudinary } = require('./config/cloudinary');
const fs = require('fs');

async function testUpload() {
    try {
        console.log("Cloudinary Config:", {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            hasSecret: !!process.env.CLOUDINARY_API_SECRET
        });

        // Create a dummy 1x1 png buffer
        const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
        
        console.log("Starting upload...");
        const result = await uploadToCloudinary(buffer);
        console.log("Upload successful:", result.secure_url);
        process.exit(0);
    } catch (error) {
        console.error("Upload failed:", error);
        process.exit(1);
    }
}

testUpload();
