import Fastify from 'fastify';
import dotenv from 'dotenv';
import sequelize from './models/index.js';
import userRoutes from './routes/userRoutes.js';
import cors from '@fastify/cors';

import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import uploadRoutes from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const fastify = Fastify({ logger: true });
await fastify.register(cors, {
	origin: true, // or 'http://localhost:5173' for specific frontend
	credentials: true
});

fastify.register(multipart);
fastify.register(fastifyStatic, {
  	root: path.join(__dirname, 'uploads'),
  	prefix: '/uploads/',
});

fastify.register(uploadRoutes);

fastify.register(userRoutes, { prefix: '/api/users' });
const start = async () => {
	try {
		await sequelize.sync();
		await fastify.listen({ port: process.env.PORT || 3000 });
		console.log('Server running');
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();
