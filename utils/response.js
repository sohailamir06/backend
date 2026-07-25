function success(res, data, statusCode = 200, meta = undefined) {
  return res.status(statusCode).json({
    status: "success",
    data,
    ...(meta ? { meta } : {}),
  });
}

module.exports = {
  success,
};
