import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliveryCheckInController from './app/controllers/DeliveryCheckInController';
import DeliveryCheckOutController from './app/controllers/DeliveryCheckOutController';
import SignatureController from './app/controllers/SignatureController';
import DeliverymanDelivery from './app/controllers/DeliverymanDelivery';

import authMiddleware from './app/middlewares/auth';
import adminMiddleware from './app/middlewares/admin';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);
routes.put('/deliveries/:id/checkin', DeliveryCheckInController.update);
routes.put('/deliveries/:id/checkout', DeliveryCheckOutController.update);

routes.get('/deliveryman/:id/deliveries', DeliverymanDelivery.index);

routes.post(
  '/signature',
  upload.single('signature'),
  SignatureController.store
);

routes.use(authMiddleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.get('/deliverymans', adminMiddleware, DeliverymanController.index);
routes.post('/deliverymans', adminMiddleware, DeliverymanController.store);
routes.put('/deliverymans/:id', adminMiddleware, DeliverymanController.update);
routes.delete(
  '/deliverymans/:id',
  adminMiddleware,
  DeliverymanController.delete
);

routes.get('/deliveries', adminMiddleware, DeliveryController.index);
routes.post('/deliveries', adminMiddleware, DeliveryController.store);
routes.put('/deliveries/:id', adminMiddleware, DeliveryController.update);
routes.delete('/deliveries/:id', adminMiddleware, DeliveryController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
