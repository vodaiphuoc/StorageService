declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: number;
            NODE_ENV: 'development' | 'production' | 'test';
            DATABASE_URL: string;

            MINIO_BUCKET_NAME: string;
            MINIO_PORT: number;
            MINIO_SECURE: string;
            MINIO_ENDPOINT: string;
            ACCESSKEY: string;
            SECRETKEY: string;
        }
    }
}

export {};
