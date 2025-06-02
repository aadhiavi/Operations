const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

router.put('/password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const valid = await bcrypt.compare(oldPassword, user.password);
  if (!valid) return res.status(400).send('Incorrect old password');
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.send('Password updated');
});

module.exports = router;