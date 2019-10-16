import { Router } from 'express';
import {users, transactions} from '../controllers'
const router = Router();

// Routes
router.post('/createUser', users.createUser);
router.post('/transaction',transactions.validateAndPerformTransaction)

export default router;
