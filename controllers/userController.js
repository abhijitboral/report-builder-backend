import { User } from '../models/index.js';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const pump          = promisify(pipeline);
const __filename    = fileURLToPath(import.meta.url);
const __dirname 	= path.dirname(__filename);

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
	const response = {
		token,
		"data":user
	}
	reply.code(200).send({ response });
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
		user.role 		= role;
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

export const uploadProfile = async (request, reply) => {
	try {
		console.log("Uploading.......");
			const data      = await request.file();
			const fileName  = `${Date.now()}-${data.filename}`;
			const filePath  = path.join(__dirname, '..', 'uploads', fileName);
			await pump(data.file, fs.createWriteStream(filePath));
	
			// update user record in DB
			await User.update(
				{ profileImage: fileName },
				{ where: { id: request.user.id } }
			);
	
		reply.code(200).send({ status:true, message: 'Uploaded', imageUrl: `/uploads/${fileName}` });
		
	} catch (error) {
		console.error('Delete error:', error);
    	return reply.code(500).send({ message: 'Internal Server Error' });
	}
}
export const editProfile = async (request, reply) => {
	try {
		const { id } = request.params;
		const { username, email, role } = request.body;
		const user = await User.findByPk(id);
		if (!user) {
			return reply.code(404).send({ message: 'User not found' });
		}
		user.username 	= username;
      	user.email 		= email;
		//user.role 		= role;
		await user.save();

      	return reply.send({ message: 'User updated successfully', user });
	} catch (error) {
		console.error('Error updating user:', err);
      	return reply.code(500).send({ message: 'Internal server error' });
	}
}

export const reset_password = async (request, reply) => {
	try {
		const { email, password } = request.body;
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await User.findOne({ where: { email },attributes: { exclude: ['password'] },});
		if (!user) {
			return reply.code(404).send({ message: 'User not found' });
		}
		console.log(user);
		const result = await User.update({ password: hashedPassword }, { where: { id: user.dataValues.id } });
		if (result[0] === 0) {
			return reply.code(404).send({ message: "User not found or no change" });
		}
    	reply.send({ message: "Password updated successfully" });
	} catch (error) {
		console.error(error);
    	reply.code(500).send({ message: "Internal server error" });
	}

}