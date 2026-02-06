import rateLimit from 'express-rate-limit';

export const workoutLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 godzina
  max: 10, // 10 workoutów per IP
  message: { error: 'Zbyt wiele requestów. Spróbuj ponownie później.' },
});

export const resultLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 godzina
  max: 20, // 20 wyników per IP
  message: { error: 'Zbyt wiele requestów. Spróbuj ponownie później.' },
});
