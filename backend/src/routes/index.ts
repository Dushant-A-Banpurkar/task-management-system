import { Router } from 'express';
import { register, login, getMe, getAdminSetupStatus, setupAdmin } from '../controllers/authController';
import { addTaskComment, createTask, deleteTask, getTaskById, getTaskComments, getTasks, updateTask } from '../controllers/taskController';
import { getUsers } from '../controllers/userController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/authorize';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/admin-setup-status', getAdminSetupStatus);
router.post('/auth/setup-admin', setupAdmin);
router.get('/auth/me', protect, getMe);

router.route('/tasks').all(protect).get(getTasks).post(createTask);
router.get('/users', protect, getUsers);
router
  .route('/tasks/:id')
  .all(protect)
  .get(getTaskById)
  .put(updateTask)
  .delete(authorize('admin', 'user'), deleteTask);
router
  .route('/tasks/:id/comments')
  .all(protect)
  .get(getTaskComments)
  .post(addTaskComment);

export default router;
