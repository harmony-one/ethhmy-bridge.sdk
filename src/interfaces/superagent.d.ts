declare module 'superagent' {
  const value: {
    post: <T>(url: string, data?: any) => Promise<T>;
    get: <T>(url: string, data?: any) => Promise<T>;
  };

  export const post: <T>(url: string, data?: any) => Promise<T>;
  export const get: <T>(url: string, data?: any) => Promise<T>;
}
