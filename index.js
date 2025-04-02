const rateLimit = require("express-rate-limit");

const smartRateLimiter = ({
  userTypeFunc,
  maxRequests,
  timeframe,
  adaptive = false,
  dbType,
  dbClient,
}) => {
  return async (req, res, next) => {
    const userType = userTypeFunc ? userTypeFunc(req) : "guest";
    let userLimit =
      typeof maxRequests === "function" ? maxRequests(userType) : maxRequests;

    if (adaptive) {
      userLimit = adjustRateLimit(userLimit);
    }

    if (dbType === "mongoose" && dbClient) {
      try {
        const user = await dbClient.findOne({ userId: req.user?.id });
        if (user?.customRateLimit) {
          userLimit = user.customRateLimit;
        }
      } catch (error) {
        console.error("Mongoose query error:", error);
      }
    }

    if (dbType === "sequelize" && dbClient) {
      try {
        const user = await dbClient.findOne({
          where: { userId: req.user?.id },
        });
        if (user?.customRateLimit) {
          userLimit = user.customRateLimit;
        }
      } catch (error) {
        console.error("Sequelize query error:", error);
      }
    }

    const limiter = rateLimit({
      windowMs: timeframe || 60 * 1000,
      max: userLimit,
      message: "Too many requests, please try again later.",
    });

    limiter(req, res, next);
  };
};

const adjustRateLimit = (currentLimit) => {
  const systemLoad = Math.random();
  return systemLoad > 0.8 ? Math.floor(currentLimit * 0.7) : currentLimit;
};

module.exports = smartRateLimiter;
