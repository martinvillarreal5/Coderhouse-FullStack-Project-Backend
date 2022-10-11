import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import logger from "../../utils/logger.js";
import * as userServices from "../../services/userServices.js";
import { sendNewRegisterNotification } from "../utils/mailer.js";

function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

const loginStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    //passReqToCallback: true, // allows us to pass back the entire request to the callback
  },
  async (email, password, done) => {
    try {
      logger.info("Login strategy ");
      const user = await userServices.getByEmail(email);
      if (!user) {
        return done(null, false, { message: "Invalid Credentials." });
      }
      if (!verifyPassword(password, user.passwordHash)) {
        return done(null, false, { message: "Invalid Credentials." });
      }
      return done(null, user);
    } catch (error) {
      // TODO add better error handling
      console.log("Error in Login Strategy", error);
      done("Login Error", null);
    }
  }
);

const getUserInfo = (req, res, next) => {
  console.log("Getting User");
  try {
    res.status(200).json({
      //username: req.user.username,
      id: req.user._id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      phone: req.user.phone,
      avatarUrl: req.user.avatarUrl,
      isAdmin: req.user.isAdmin,
    });
  } catch (error) {
    next(error);
  }
};

const postLogin = (req, res, next) => {
  try {
    console.log("Is authenticated: " + req.isAuthenticated());
    res.status(201).json("Is authenticated: " + req.isAuthenticated());
  } catch (error) {
    next(error);
  }
};

const postRegister = async (req, res, next) => {
  try {
    const existingUser = await userServices.getByEmail(req.body.email);
    if (existingUser) {
      logger.info(existingUser);
      logger.info(`Email: ${existingUser.email} is already in use`);
      return res.status(409).json("Email is already in use");
    }
    if (!req.file) {
      //TODO improve error handling here or in the multer.js
      return res.status(409).json("Avatar didnt upload");
    }
    req.body.avatarUrl = req.file.path;
    const newUser = await userServices.registerUser(req.body);
    sendNewRegisterNotification(newUser); // ? move thes to service layer?
    res.status(201).json("Register Ok");
  } catch (error) {
    next(error);
  }
};

const postRegisterAdmin = async (req, res, next) => {
  try {
    const existingUser = await userServices.getByEmail(req.body.email);
    if (existingUser) {
      logger.info(existingUser);
      logger.info(`Email: ${existingUser.email} is already in use`);
      return res.status(409).json("Email is already in use");
    }
    if (!req.file) {
      //TODO improve error handling here or in the multer.js
      return res.status(409).json("Avatar didnt upload");
    }
    const avatarPath = req.file.path;
    console.log(req.file.path);
    req.body.avatarUrl = avatarPath;
    await userServices.registerAdmin(req.body);
    res.status(201).json("Register Admin Ok");
  } catch (error) {
    next(error);
  }
};

const getUsersList = async (req, res, next) => {
  try {
    const users = await userServices.getUsers();
    if (users.length < 1) {
      logger.info(`No users in database`);
      res.status(404).json("No users in database");
    } else {
      logger.info(users);
      res.status(200).json(users); // ! TODO check if this return sensible info of users
    }
  } catch (error) {
    next(error);
  }
};

const postLogout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    } else {
      /* req.session.destroy(err => {
        if (err) {
          res.status(400).send('Unable to log out')
        } else {
          res.send('Logout successful')
        }
      }); */
      // TODO check if session destroy is needed, and more security options,
      res.status(200).send("Logout successful");
      // ! TODO check status code for logout
    }
  });
};

export {
  loginStrategy,
  getUserInfo,
  getUsersList,
  postLogin,
  postRegister,
  postRegisterAdmin,
  postLogout,
};
