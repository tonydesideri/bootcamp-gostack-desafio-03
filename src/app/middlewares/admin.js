import User from '../models/User';

export default async (req, res, next) => {
  const user = await User.findByPk(req.userId);

  if (user.email !== 'admin@fastfeet.com') {
    return res.status(401).json({ error: 'Is not administrator' });
  }

  return next();
};
