import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const WINDOW_15M = 15 * 60 * 1000;
const WINDOW_1H = 60 * 60 * 1000;
const PER_IP_LIMIT = 75;
const FAILED_LOGIN_LIMIT = 5;

const RATE_LIMIT_ERROR = 'Too many requests';

function limitHandler(windowMs) {
  return (req, res) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfter = resetTime
      ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
      : Math.ceil(windowMs / 1000);
    res.set('Retry-After', String(retryAfter));
    res.status(429).json({ error: RATE_LIMIT_ERROR, retryAfter });
  };
}

export const loginAccountLimiter = rateLimit({
  windowMs: WINDOW_15M,
  limit: FAILED_LOGIN_LIMIT,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler(WINDOW_15M),
  keyGenerator: (req) => `${ipKeyGenerator(req.ip)}|${String(req.body?.email || '').trim().toLowerCase()}`,
});

export const loginIpLimiter = rateLimit({
  windowMs: WINDOW_15M,
  limit: PER_IP_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler(WINDOW_15M),
});

export const signupLimiter = rateLimit({
  windowMs: WINDOW_1H,
  limit: PER_IP_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler(WINDOW_1H),
});

export const joinClassLimiter = rateLimit({
  windowMs: WINDOW_15M,
  limit: PER_IP_LIMIT,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitHandler(WINDOW_15M),
});