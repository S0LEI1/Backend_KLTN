import express from 'express';

const router = express.Router();

router.post('/users/signout', (req, res) => {
  req.session = null;
  res.send({ message: 'Sign out!!' });
});

export { router as signoutRouter };
