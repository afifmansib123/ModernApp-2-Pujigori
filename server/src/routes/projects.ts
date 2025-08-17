import { Router } from 'express';
import ProjectController from '../controllers/ProjectController';
// import { authMiddleware, adminMiddleware } from '../middleware/auth'; // TODO: Implement auth middleware
// import { validateProjectCreate, validateProjectUpdate } from '../middleware/validation'; // TODO: Implement validation

const router = Router();

// Public routes - no authentication required
router.get('/', ProjectController.getProjects);
router.get('/trending', ProjectController.getTrendingProjects);
router.get('/categories', ProjectController.getProjectsByCategory);
router.get('/:slug', ProjectController.getProject);
router.get('/:id/updates', ProjectController.getProjectUpdates);
router.get('/:id/stats', ProjectController.getProjectStats);

// Protected routes - require authentication (uncomment when auth middleware is ready)
// router.post('/', authMiddleware, validateProjectCreate, ProjectController.createProject);
// router.put('/:id', authMiddleware, validateProjectUpdate, ProjectController.updateProject);
// router.delete('/:id', authMiddleware, ProjectController.deleteProject);
// router.post('/:id/updates', authMiddleware, ProjectController.addProjectUpdate);
// router.get('/creator/:creatorId', authMiddleware, ProjectController.getProjectsByCreator);

// Temporary routes for development (remove when auth is integrated)
router.post('/', ProjectController.createProject);
router.put('/:id', ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);
router.post('/:id/updates', ProjectController.addProjectUpdate);
router.get('/creator/:creatorId', ProjectController.getProjectsByCreator);

export default router;