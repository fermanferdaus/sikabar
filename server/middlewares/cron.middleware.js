export const cronAuth = (req, res, next) => {
  const token = req.headers["x-cron-token"];

  if (!token || token !== process.env.CRON_TOKEN) {
    return res.status(403).json({
      message: "Unauthorized cron request",
    });
  }

  next();
};
