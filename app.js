import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userRoutes.js';
const app = express();
import propertyRoutes from './routes/propertyRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/users', userRoutes);
app.use('/property', propertyRoutes);
app.use('/booking', bookingRoutes);
app.use('/comments', commentRoutes);




export default app;