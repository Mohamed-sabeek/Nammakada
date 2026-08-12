const fs = require('fs');
const path = require('path');

async function testCreateProduct() {
    try {
        // 1. Login as Admin
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: 'admin@nammakada.com',
                password: 'Admin@123'
            })
        });
        
        if (!loginRes.ok) throw new Error('Login failed: ' + await loginRes.text());
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Logged in successfully, token received.");

        // 2. Create FormData
        const form = new FormData();
        form.append('name', 'Test Product');
        form.append('description', 'Test Description');
        form.append('price', '100');
        form.append('stock', '10');
        form.append('category', 'Groceries');
        
        // Add dummy image
        const imgPath = path.join(__dirname, 'test.png');
        const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
        fs.writeFileSync(imgPath, buffer);
        
        form.append('image', new Blob([buffer], { type: 'image/png' }), 'test.png');

        // 3. Send Request
        console.log("Sending create product request...");
        const createRes = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: form
        });

        const data = await createRes.json();
        if (!createRes.ok) {
            console.error("Server Error Response:", data);
        } else {
            console.log("Product created successfully:", data);
        }
        
        fs.unlinkSync(imgPath); // Cleanup
    } catch (error) {
        console.error("Request Error:", error.message);
    }
}

testCreateProduct();
