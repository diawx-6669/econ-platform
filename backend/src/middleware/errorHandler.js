function notFound(req, res) {
  res.status(404).json({ message: "Маршрут не найден" });
}

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Внутренняя ошибка сервера" });
}

module.exports = { notFound, errorHandler };
