import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (request, reply) => {
	console.log(request.body);
	const { username, email,password } = request.body;

	try {
		// Check if user already exists
		const existingUser = await User.findOne({ where: { username } });
		if (existingUser) {
			return reply.code(400).send({ error: 'Username already exists' });
		}

		const existingEmail = await User.findOne({ where: { email } });
		if (existingEmail) {
			return reply.code(400).send({ error: 'Email already exists' });
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create new user
		const user = await User.create({ username, email, password: hashedPassword });

		// Hide password in response
		const { password: _, ...userWithoutPassword } = user.toJSON();
		reply.code(201).send(userWithoutPassword);

	} catch (err) {
		console.error(err);

		if (err.name === 'SequelizeValidationError') {
			return reply.code(400).send({
				error: 'Validation failed',
				details: err.errors.map(e => e.message)
			});
		}

		reply.code(500).send({ error: 'Internal server error' });
	}
};

export const login = async (req, reply) => {
	const { email, password } = req.body;
	const user = await User.findOne({ where: { email } });
	if (!user || !(await bcrypt.compare(password, user.password))) {
		return reply.code(401).send({ message: 'Invalid credentials' });
	}
	const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
	reply.send({ token });
};

export const getAllUsers = async (request, reply) => {
	try {
		const users = await User.findAll({
			attributes: { exclude: ['password'] } // Optional: hide passwords
		});
		reply.code(200).send(users);
	} catch (err) {
        reply.code(500).send({ error: 'Internal error' });
	}
};

export const getUser = async (request, reply) => {
	try {
		const { id } = request.params;
		const user = await User.findByPk(id,{attributes: { exclude: ['password'] }});
		if (!user) {
			return reply.code(404).send({ message: 'User not found' });
		}
		return reply.code(200).send(user);
	} catch (error) {
		console.error('Error updating user:', err);
		return reply.code(500).send({ message: 'Internal server error' });
	}
}

export const editUser = async (request, reply) => {
	
	try {
		const { id } = request.params;
		const { username, email, role } = request.body;
		const user = await User.findByPk(id);
		if (!user) {
			return reply.code(404).send({ message: 'User not found' });
		}
		user.username 	= username;
      	user.email 		= email;
		user.role = role;
		await user.save();

      	return reply.send({ message: 'User updated successfully', user });
	} catch (error) {
		console.error('Error updating user:', err);
      	return reply.code(500).send({ message: 'Internal server error' });
	}
}

export const deleteUser = async (request, reply) => {
	try {
		const { id } = request.params;
		const user = await User.findByPk(id);

		if (!user) {
		return reply.code(404).send({ message: 'User not found' });
		}
    	await user.destroy();

    	return reply.code(200).send({ message: 'User deleted successfully' });
  	} catch (error) {
    	console.error('Delete error:', error);
    	return reply.code(500).send({ message: 'Internal Server Error' });
  	}
}