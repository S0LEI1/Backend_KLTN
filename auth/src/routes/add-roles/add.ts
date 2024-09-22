import express, { Request, Response } from 'express';
import { User } from '../../models/user';
import { UserRole } from '../../models/user-role';
import { validationRequest } from '@share-package/common';
import { body } from 'express-validator';
import { UserURMapping } from '../../models/user-ur-mapping';
const router = express.Router();
router.post(
  '/users/urm',
  [body('roleId').isMongoId().withMessage('Role Id must be valid')],
  validationRequest,
  async (req: Request, res: Response) => {
    const userId = req.currentUser!.id;
    const { roleId } = req.body;
    const user = await User.findUser(userId);
    const userRole = await UserRole.findRole(roleId);
    const userURM = UserURMapping.build({
      user: user!,
      role: userRole!,
    });
    await userURM.save();
    res.status(201).send({ 'add-role': 'success', userURM });
  }
);
export { router as addUserURMRouter };
