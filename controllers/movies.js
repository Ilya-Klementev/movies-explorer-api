const movieModel = require('../models/movies');
const NotFoundError = require('../middlewares/errors/NotFoundError');
const CastError = require('../middlewares/errors/CastError');
const ValidationError = require('../middlewares/errors/ValidationError');
const ForbiddenError = require('../middlewares/errors/ForbiddenError');
const ConflictError = require('../middlewares/errors/ConflictError');

const constants = require('../utils/constants');

function readAllUserMovies(req, res, next) {
  const owner = req.user._id;
  return movieModel.find({ owner })
    .then((movies) => res.status(constants.resSuccess.readMovies.code).send(movies))
    .catch(next);
}

async function createMovie(req, res, next) {
  try {
    const movieData = req.body;
    movieData.owner = req.user._id;
    const movie = await movieModel.create(movieData);
    return res.status(constants.resSuccess.movieCreated.code).send(movie);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return next(new ValidationError(constants.resError.validationError));
    }
    if (err.code === 11000) {
      return next(new ConflictError(constants.resError.conflictMovieError));
    }
    return next(err);
  }
}

async function deleteMovie(req, res, next) {
  try {
    const movie = await movieModel.findById(req.params.movieId);

    if (!movie) {
      return next(new NotFoundError(constants.resError.movieNotFound));
    }

    if (req.user._id !== movie.owner.toString()) {
      return next(new ForbiddenError(constants.resError.notMovieOwner));
    }

    await movieModel.deleteOne(movie);

    return res
      .status(constants.resSuccess.movieDeleted.code)
      .send({ message: constants.resSuccess.movieDeleted.message });
  } catch (err) {
    if (err.name === 'CastError') {
      return next(new CastError(constants.resError.invalidMovieDeletion));
    }
    return next(err);
  }
}

module.exports = {
  readAllUserMovies,
  createMovie,
  deleteMovie,
};
