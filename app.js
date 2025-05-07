import Fastify from 'fastify';
import dotenv from 'dotenv';
import sequelize from './models/index.js';
import userRoutes from './routes/userRoutes.js';
import cors from '@fastify/cors';

dotenv.config();
const fastify = Fastify({ logger: true });
await fastify.register(cors, {
	origin: true, // or 'http://localhost:5173' for specific frontend
	credentials: true
});

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
