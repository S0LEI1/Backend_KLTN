import {
  BadRequestError,
  ListPermission,
  UserType,
  requireAuth,
  requirePermission,
  requireType,
  singleUploadMiddleware,
  validationRequest,
} from '@share-package/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { AccountControllers } from '../../controllers/auth.controllers';
import {
  ADDRESS_MESSAGE,
  EMAIL_MESSAGE,
  GENDER_MESSAGE,
  MATCH_MESSAGE,
  NAME_MESSAGE,
  PASS_MESSAGE,
  PHONE_MESSAGE,
} from '../../utils/message';
const router = express.Router();
const REGEX_PASSWORD =
  /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/;
router.post(
  '/users/new/employee',
  [
    body('email').isEmail().withMessage(EMAIL_MESSAGE),
    body('fullName').not().isEmpty().withMessage(NAME_MESSAGE),
    body('gender').not().isEmpty().withMessage(GENDER_MESSAGE),
    body('phoneNumber').isMobilePhone('vi-VN').withMessage(PHONE_MESSAGE),
    body('address').not().isEmpty().withMessage(ADDRESS_MESSAGE),
  ],
  // middleware validationRequest
  validationRequest,
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([ListPermission.EmployeeCreate]),
  AccountControllers.createEmployee
);
router.patch(
  '/users/update-password',
  [
    body('email').isEmail().withMessage(EMAIL_MESSAGE),
    body('password')
      .trim()
      .notEmpty()
      .matches(REGEX_PASSWORD)
      .withMessage(PASS_MESSAGE),
    body('confirmPassword')
      .trim()
      .notEmpty()
      .matches(REGEX_PASSWORD)
      .withMessage(PASS_MESSAGE),
    body('confirmPassword').custom(async (confirmPassword, { req }) => {
      const { password } = req.body;
      if (password != confirmPassword) {
        throw new BadRequestError(MATCH_MESSAGE);
      }
    }),
  ],
  validationRequest,
  AccountControllers.updatePassword
);
router.post(
  '/users/verify',
  [
    body('email').isEmail().withMessage(EMAIL_MESSAGE),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Otp is invalid'),
  ],
  validationRequest,
  AccountControllers.verifyOtp
);
router.post(
  '/users/signup',
  [
    body('email').isEmail().withMessage(EMAIL_MESSAGE),
    body('password')
      .trim()
      .notEmpty()
      .matches(REGEX_PASSWORD)
      .withMessage(PASS_MESSAGE),
    body('confirmPassword')
      .trim()
      .notEmpty()
      .matches(REGEX_PASSWORD)
      .withMessage(PASS_MESSAGE),
    body('confirmPassword').custom(async (confirmPassword, { req }) => {
      const { password } = req.body;
      if (password != confirmPassword) {
        throw new BadRequestError(MATCH_MESSAGE);
      }
    }),
    body('fullName').not().isEmpty().withMessage(NAME_MESSAGE),
    body('gender').not().isEmpty().withMessage(GENDER_MESSAGE),
    body('phoneNumber').isMobilePhone('vi-VN').withMessage(PHONE_MESSAGE),
    body('address').not().isEmpty().withMessage(ADDRESS_MESSAGE),
  ],
  // middleware validationRequest
  validationRequest,
  AccountControllers.createCustomer
);
router.post(
  '/users/otp',
  [body('email').isEmail().withMessage(EMAIL_MESSAGE)],
  validationRequest,
  AccountControllers.sendOtp
);
router.get(
  '/users/export/data',
  requireAuth,
  requireType([UserType.Manager]),
  requirePermission([
    ListPermission.EmployeeCreate,
    ListPermission.CustomerCreate,
  ]),
  AccountControllers.exportUser
);
router.post(
  '/users/import/data',
  requireAuth,
  singleUploadMiddleware,
  requireType([UserType.Manager]),
  requirePermission([
    ListPermission.EmployeeCreate,
    ListPermission.CustomerCreate,
  ]),
  AccountControllers.importUser
);
export { router as authRouter };
