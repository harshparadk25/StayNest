import dotenv from 'dotenv';
dotenv.config();
import cors from 'cors';

import http from 'http';
import connectDB from './db/db.js';
import app from './app.js';



app.use(cors(
    {
        origin: '*'
    }
));


const PORT = process.env.PORT || 3000;

const server = http.createServer(app);
connectDB();
server.listen(PORT, () => {
    console.log(`✅ Server + Socket ready on port ${PORT}`);
});
