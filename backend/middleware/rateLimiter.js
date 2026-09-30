const { RateLimiterMemory } = require('rate-limiter-flexible');

const rateLimiter = new RateLimiterMemory({
    points: 100,
    duration: 15 * 60 // 15 minutes
});

const limiterMiddleware = (req, res, next) => {
    rateLimiter.consume(req.ip, 1).then(() => {
        next();
    }).catch(() => {
        res.status(429).json({
            error: "Too many requests from this IP, please try again later"
        });
    });
};

module.exports = limiterMiddleware;
