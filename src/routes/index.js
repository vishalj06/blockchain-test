import { Router } from 'express';
import users from '../controllers/userController'
import transaction from '../controllers/transactionController';

const router = Router();

// Routes
router.post('/createUser', users.createUser);
router.post('/transaction',transaction.validateAndPerformTransaction)

export default router;
