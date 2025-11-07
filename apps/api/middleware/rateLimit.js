import rateLimit from 'express-rate-limit'


export const LoginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
        success: false,
        error: 'Too many login attempts from this IP, please try again after 15 minutes'},
          standardHeaders: true,
  legacyHeaders: false,
})


export const forgotPasswordRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        error: 'Too many password reset attempts from this IP, please try again after 15 minutes'},
            standardHeaders: true,
    legacyHeaders: false,
})  


