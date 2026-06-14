/**
 * Wraps an async route handler so that any thrown errors or rejected
 * promises are automatically forwarded to Express's error-handling
 * middleware via next(err), instead of crashing the process.
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
