import { register, login, getAllUsers,getUser,editUser,deleteUser,uploadProfile,editProfile } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

async function userRoutes(fastify, options) {
	fastify.post('/register', async (request, reply) => {
		return register(request, reply);
	});

	fastify.post('/login', async (request, reply) => {
		return login(request, reply);
	});

	fastify.get('/', { preHandler: [authenticate] }, async (request, reply) => {
		return getAllUsers(request, reply);
	});
	fastify.get('/:id', { preHandler: [authenticate] }, async (request, reply) => {
		return getUser(request, reply);
	})
	fastify.post('/edit/:id', { preHandler: [authenticate] }, async (request, reply) => {
		return await editUser(request, reply);
	})
	fastify.post('/delete/:id', { preHandler: [authenticate] }, async (request, reply) => {
		return await deleteUser(request, reply);
	});

	fastify.post('/upload-profile', { preHandler: [authenticate] }, async (request, reply) => {
		return await uploadProfile(request, reply);
	});

	fastify.post('/profile/:id', { preHandler: [authenticate] }, async (request, reply) => {
		return await editProfile(request, reply);
	});

}
export default userRoutes;
