const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(body) {
  const errors = {};
  const { name, email, password } = body || {};

  if (!name || String(name).trim().length < 2) {
    errors.name = "Имя должно быть не короче 2 символов";
  }
  if (!email || !EMAIL_RE.test(email)) {
    errors.email = "Введите корректный email";
  }
  if (!password || String(password).length < 8) {
    errors.password = "Пароль должен быть не короче 8 символов";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

function validateLogin(body) {
  const errors = {};
  const { email, password } = body || {};

  if (!email || !EMAIL_RE.test(email)) {
    errors.email = "Введите корректный email";
  }
  if (!password || String(password).length < 6) {
    errors.password = "Введите пароль";
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateRegister, validateLogin };
