const logFunc = ({ prefix = '', message }: { prefix?: string; message: string }) =>
  console.log(prefix, message);

let signale = {
  error: logFunc,
  start: logFunc,
  success: logFunc,
  await: logFunc,
  info: logFunc,
  pending: logFunc,
};

const context: any = this;

let logLevel = 0;

export const logger = {
  error: (...args: any[]) => logLevel > 0 && signale.error.apply(context, args),
  start: (...args: any[]) => logLevel > 0 && signale.start.apply(context, args),
  success: (...args: any[]) => logLevel > 0 && signale.success.apply(context, args),
  wait: (...args: any[]) => logLevel > 1 && signale.await.apply(context, args),
  info: (...args: any[]) => logLevel > 1 && signale.info.apply(context, args),
  pending: (...args: any[]) => logLevel > 1 && signale.pending.apply(context, args),
  setLogLevel: (level: number) => (logLevel = level),
};
