const router = require('express').Router();
const { celebrate } = require('celebrate');
const userController = require('../controllers/users');
const { validationRequestPatchProfile } = require('../middlewares/validationRequest');

router.get('/me', userController.readMe);

router.patch(
  '/me',
  celebrate(validationRequestPatchProfile),
  userController.patchProfile,
);

module.exports = router;
