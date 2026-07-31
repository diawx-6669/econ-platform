const { v4: uuid } = require("uuid");
const db = require("../config/db");

const User = {
  findByEmail(email) {
    return db.get("users").find({ email: email.toLowerCase() }).value();
  },

  findById(id) {
    return db.get("users").find({ id }).value();
  },

  create({ name, email, passwordHash }) {
    const user = {
      id: uuid(),
      name,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString()
    };
    db.get("users").push(user).write();
    return user;
  },

  toPublic(user) {
    if (!user) return null;
    const { passwordHash, ...publicUser } = user;
    return publicUser;
  }
};

module.exports = User;
