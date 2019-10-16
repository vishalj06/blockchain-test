import { Router } from 'express';
import users from '../controllers/userController'

const router = Router();

// Routes
router.post('/createUser', users.createUser);

export default router;
