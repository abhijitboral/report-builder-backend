// routes/upload.js
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { fileURLToPath } from 'url';
import { User } from '../models/index.js'; // adjust as needed
import { authenticate } from '../middlewares/authMiddleware.js'; // optional auth

const pump          = promisify(pipeline);
const __filename    = fileURLToPath(import.meta.url);
const __dirname     = path.dirname(__filename);

export default async function (fastify) {
    /* fastify.post('/api/users/upload-profile', { preHandler: [authenticate] }, async (req, reply) => {
        console.log("Uploading.......");
        const data      = await req.file();
        const fileName  = `${Date.now()}-${data.filename}`;
        const filePath  = path.join(__dirname, '..', 'uploads', fileName);
        await pump(data.file, fs.createWriteStream(filePath));

        // Optionally update user record in DB
        await User.update(
            { profileImage: fileName },
            { where: { id: req.user.id } }
        );

    reply.code(200).send({ status:true, message: 'Uploaded', imageUrl: `/uploads/${fileName}` });
  }); */
}
