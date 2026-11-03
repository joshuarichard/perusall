import cors from 'cors';
import express from 'express';
import { annotationsRouter, readingsRouter, usersRouter } from './routes';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/readings', readingsRouter);
app.use('/api/annotations', annotationsRouter);
