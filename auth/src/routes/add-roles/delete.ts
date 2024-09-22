import express, { Request, Response } from 'express';
import { User } from '../../models/user';
import { UserRole } from '../../models/user-role';
import { UserURMapping } from '../../models/user-ur-mapping';
import { NotFoundError } from '@share-package/common';
const router = express.Router();
router.delete('/users/urm', async (req: Request, res: Response) => {
  const userId = req.currentUser!.id;
  const { roleId } = req.body;
  const user = await User.findUser(userId);
  const role = await UserRole.findRole(roleId);
  const userURM = await UserURMapping.findOne({
    user: user!.id,
    role: role!.id,
  });
  if (!userURM) throw new NotFoundError('User-UserRole-Mapping');
  await UserURMapping.deleteOne({ _id: userURM });
  res.status(205).send({ 'delete-user-urm': 'success' });
});
export { router as deleteUserURM };
