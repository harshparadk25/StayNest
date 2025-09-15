import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware } from '../middlewear/authMiddlewear.js';
import {
  createProperty,
  getProperties,
  getPropertyById,
  deleteProperty,
  updateProperty,
  getHostProperties,
} from '../controller/propertyController.js';

const router = Router();


router.post(
  '/create',
  authMiddleware,
  [
    body('title')
      .isLength({ min: 3 })
      .withMessage('Title must be at least 3 characters'),
    body('description')
      .notEmpty()
      .withMessage('Description is required'),
    body('location')
      .notEmpty()
      .withMessage('Location is required'),
    body('pricePerNight')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
  ],
  createProperty
);


router.get('/', authMiddleware, getProperties);


router.get(
  '/:id',
  authMiddleware,
  [param('id').isMongoId().withMessage('Invalid property ID')],
  getPropertyById
);


router.put(
  '/:id',
  authMiddleware,
  [
    param('id').isMongoId().withMessage('Invalid property ID'),
    body('title')
      .optional()
      .isLength({ min: 3 })
      .withMessage('Title must be at least 3 characters'),
    body('description').optional().notEmpty(),
    body('location').optional().notEmpty(),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
  ],
  updateProperty
);


router.delete(
  '/:id',
  authMiddleware,
  [param('id').isMongoId().withMessage('Invalid property ID')],
  deleteProperty
);

router.get('/host/me', authMiddleware, getHostProperties);

export default router;
