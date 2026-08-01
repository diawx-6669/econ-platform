const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { validateRegister, validateLogin, validateProfileUpdate, validatePasswordChange } = require("../utils/validators");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

async function register(req, res, next) {
  try {
    const { valid, errors } = validateRegister(req.body);
    if (!valid) {
      return res.status(422).json({ message: "Проверьте правильность заполнения полей", errors });
    }

    const { name, email, password } = req.body;

    if (User.findByEmail(email)) {
      return res.status(409).json({ message: "Пользователь с таким email уже существует" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = User.create({ name: name.trim(), email, passwordHash });
    const token = signToken(user);

    return res.status(201).json({ user: User.toPublic(user), token });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { valid, errors } = validateLogin(req.body);
    if (!valid) {
      return res.status(422).json({ message: "Проверьте правильность заполнения полей", errors });
    }

    const { email, password } = req.body;
    const user = User.findByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Неверный email или пароль" });
    }

    const token = signToken(user);
    return res.status(200).json({ user: User.toPublic(user), token });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    return res.status(200).json({ user: User.toPublic(user) });
  } catch (err) {
    return next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { valid, errors } = validateProfileUpdate(req.body);
    if (!valid) {
      return res.status(422).json({ message: "Проверьте правильность заполнения полей", errors });
    }

    const user = User.updateName(req.userId, req.body.name.trim());
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    return res.status(200).json({ user: User.toPublic(user) });
  } catch (err) {
    return next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { valid, errors } = validatePasswordChange(req.body);
    if (!valid) {
      return res.status(422).json({ message: "Проверьте правильность заполнения полей", errors });
    }

    const { currentPassword, newPassword } = req.body;
    const user = User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });

    const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Текущий пароль указан неверно" });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    User.updatePasswordHash(req.userId, passwordHash);

    return res.status(200).json({ message: "Пароль успешно изменён" });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, me, updateProfile, changePassword };
