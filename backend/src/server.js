import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from '../routes/auth.routes.js';
import userRoutes from '../routes/user.route.js';
import chatRoutes from '../routes/chat.route.js';
import {connectDB} from '../lib/db.js';
import cookieParser from 'cookie-parser';
dotenv.config();


const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', router);
app.use('/api/users', userRoutes);
app.use('/api/chat',chatRoutes)

connectDB();


app.listen(process.env.PORT, () => {
  console.log('Server is running on port ' + process.env.PORT);
});
