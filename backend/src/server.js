import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from '../routes/auth.routes.js';
import {connectDB} from '../lib/db.js';
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', router);


connectDB();


app.listen(process.env.PORT, () => {
  console.log('Server is running on port ' + process.env.PORT);
});
