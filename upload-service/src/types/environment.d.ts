declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: number;
            NODE_ENV: 'development' | 'production' | 'test';
            DATABASE_URL: string;
        }
    }
}
  
export {};
