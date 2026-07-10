function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    status: "success",
    data,
  });
}

module.exports = {
  success,
};
