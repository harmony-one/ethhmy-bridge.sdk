import signale from 'signale';
import { config } from '../testConfig';

const context: any = this;

export const logger = {
  error: (...args: any[]) => signale.error.apply(context, args),
  start: (...args: any[]) => signale.start.apply(context, args),
  success: (...args: any[]) => config.logLevel > 0 && signale.success.apply(context, args),
  wait: (...args: any[]) => config.logLevel > 0 && signale.await.apply(context, args),
  info: (...args: any[]) => config.logLevel > 1 && signale.info.apply(context, args),
  pending: (...args: any[]) => config.logLevel > 1 && signale.pending.apply(context, args),
};
