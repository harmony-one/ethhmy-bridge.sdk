const signale = require('signale');

let logLevel = 0;

export const logger = {
  error: (...args) => logLevel > 0 && signale.error.apply(this, args),
  start: (...args) => logLevel > 0 && signale.start.apply(this, args),
  success: (...args) => logLevel > 0 && signale.success.apply(this, args),
  wait: (...args) => logLevel > 1 && signale.await.apply(this, args),
  info: (...args) => logLevel > 1 && signale.info.apply(this, args),
  pending: (...args) => logLevel > 1 && signale.pending.apply(this, args),
  setLogLevel: level => (logLevel = level),
};
