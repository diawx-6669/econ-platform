const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { validateRegister, validateLogin, validateProfileUpdate, validatePasswordChange } = require("../utils/validators");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const SALT_ROUNDS = 10;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

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

    if (!user.passwordHash) {
      return res.status(401).json({
        message: "Этот аккаунт создан через Google. Войдите с помощью кнопки «Продолжить с Google»."
      });
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

async function googleAuth(req, res, next) {
  try {
    if (!googleClient) {
      return res.status(500).json({
        message: "Вход через Google не настроен на сервере. Задайте GOOGLE_CLIENT_ID в .env бэкенда."
      });
    }

    const { credential } = req.body || {};
    if (!credential) {
      return res.status(422).json({ message: "Не получен токен от Google" });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (err) {
      return res.status(401).json({ message: "Не удалось подтвердить вход через Google" });
    }

    if (!payload || !payload.email) {
      return res.status(401).json({ message: "Google не вернул email пользователя" });
    }

    if (payload.email_verified === false) {
      return res.status(401).json({ message: "Email в Google-аккаунте не подтверждён" });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || email.split("@")[0];
    const avatarUrl = payload.picture || null;

    let user = User.findByGoogleId(googleId);

    if (!user) {
      user = User.findByEmail(email);
      if (user) {
        // Аккаунт с таким email уже был создан по паролю — привязываем Google
        user = User.linkGoogleId(user.id, googleId, avatarUrl);
      } else {
        user = User.createFromGoogle({ name, email, googleId, avatarUrl });
      }
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

    if (!user.passwordHash) {
      return res.status(409).json({
        message: "У этого аккаунта нет пароля — вход выполняется через Google"
      });
    }

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

module.exports = { register, login, googleAuth, me, updateProfile, changePassword };
