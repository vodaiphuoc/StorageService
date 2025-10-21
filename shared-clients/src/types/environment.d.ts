declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT?: string;
            HOST?: string;
    
            // MinIO Configuration
            MINIO_ENDPOINT: string;
            MINIO_PORT: string;
            MINIO_ACCESS_KEY: string;
            MINIO_SECRET_KEY: string;
            MINIO_SECURE: string;
            MINIO_BUCKET_NAME: string;
    
            // RabbitMQ Configuration
            RABBITMQ_URL: string;
            RABBITMQ_QUEUE_NAME: string;
        }
    }
}
  
export {}; 
