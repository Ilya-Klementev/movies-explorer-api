const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
require('dotenv').config();
const NotFoundError = require('../middlewares/errors/NotFoundError');
const CastError = require('../middlewares/errors/CastError');
const ConflictError = require('../middlewares/errors/ConflictError');
const ValidationError = require('../middlewares/errors/ValidationError');
const UnauthorizedError = require('../middlewares/errors/UnauthorizedError');
const constants = require('../utils/constants');

const { JWT_SECRET = 'secret', SALT_ROUNDS = 10, NODE_ENV } = process.env;

async function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new CastError(constants.resError.emptyData));
  }

  try {
    const user = await userModel.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new UnauthorizedError(constants.resError.unauthorizedUserData));
    }

    const payload = { _id: user._id };
    const token = jwt.sign(
      payload,
      NODE_ENV === 'production' ? JWT_SECRET : 'secret',
      { expiresIn: '7d' },
    );
    res.cookie('jwt', token, { maxAge: 3600000 * 24 * 7, sameSite: true });
    return res
      .status(constants.resSuccess.userSignedIn.code)
      .send({ message: constants.resSuccess.userSignedIn.message, token });
  } catch (err) {
    return next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { email, password, name } = req.body;
    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await userModel.create({
      name,
      email,
      password: hash,
    });

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    return res.status(constants.resSuccess.createdUser.code).send({ ...userWithoutPassword });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new ValidationError(constants.resError.validationError));
    }
    if (err.code === 11000) {
      return next(new ConflictError(constants.resError.conflictUserError));
    }
    return next(err);
  }
}

async function patchProfile(req, res, next) {
  try {
    const { name, email } = req.body;
    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true },
    );

    if (!user || user.length === 0) {
      return next(new NotFoundError(constants.resError.userNotFound));
    }

    return res.status(constants.resSuccess.profilePatched.code).send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new CastError(constants.resError.validationError));
    }
    if (err.code === 11000) {
      return next(new ConflictError(constants.resError.conflictUserError));
    }
    return next(err);
  }
}

async function readMe(req, res, next) {
  try {
    const { _id } = req.user;
    const user = await userModel.findOne({ _id });

    if (!user || user.length === 0) {
      return next(new NotFoundError(constants.resError.userNotFound));
    }

    const { email, name } = user;
    return res.status(constants.resSuccess.readUser.code).send({ email, name });
  } catch (err) {
    return next(err);
  }
}

function signout(req, res, next) {
  try {
    res.clearCookie('jwt', { sameSite: true });

    return res
      .status(constants.resSuccess.userSignedOut.code)
      .send({ message: constants.resSuccess.userSignedOut.message });
  } catch (err) {
    return next(new UnauthorizedError(constants.resError.unauthorizedSignout));
  }
}

module.exports = {
  login, createUser, patchProfile, readMe, signout,
};
