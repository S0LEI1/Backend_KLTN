import express, { Request, Response } from 'express';
import { ProfileController } from '../controllers/profile.controllers';
import { requireAuth, validationRequest } from '@share-package/common';
import { body } from 'express-validator';
import {
  ADDRESS_MESSAGE,
  GENDER_MESSAGE,
  NAME_MESSAGE,
  PHONE_MESSAGE,
} from '../utils/message';
const router = express.Router();
router.get('/accounts/imformation', requireAuth, ProfileController.information);
router.patch(
  '/accounts/information',
  [
    body('fullName').not().isEmpty().withMessage(NAME_MESSAGE),
    body('gender').not().isEmpty().withMessage(GENDER_MESSAGE),
    body('phoneNumber').isMobilePhone('vi-VN').withMessage(PHONE_MESSAGE),
    body('address').not().isEmpty().withMessage(ADDRESS_MESSAGE),
  ],
  validationRequest,
  requireAuth,
  ProfileController.updateInformation
);
export { router as profileRouter };
