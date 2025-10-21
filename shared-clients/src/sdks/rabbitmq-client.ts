import * as amqp from 'amqplib';

// Define a type for the consumer callback function
type ConsumerCallback = (msg: amqp.ConsumeMessage | null) => Promise<void>;

/**
 * Service class for connecting to, publishing, and consuming messages from RabbitMQ.
 */
export class RabbitMQService {
    private static singleton: RabbitMQService| null;

    private connection: amqp.Connection | undefined;
    private channel: amqp.Channel | undefined;
    private queueName: string = process.env.RABBITMQ_QUEUE_NAME;

    private constructor() {}

    public static async getInstance() {
        if (!RabbitMQService.singleton) {
            const newInstance = new RabbitMQService();
            await newInstance.connect();
            RabbitMQService.singleton = newInstance;
        }
        return RabbitMQService.singleton;
    }

    /**
     * Establishes connection and channel to RabbitMQ.
     */
    private async connect(): Promise<void> {
        try {
        
            console.log(`RabbitMQ: Connecting to ${process.env.RABBITMQ_URL}`);
            this.connection = await amqp.connect(process.env.RABBITMQ_URL);
            this.channel = await this.connection.createChannel();
            
            // Ensure the queue exists
            await this.channel.assertQueue(this.queueName, { durable: true });

            // Handle connection closure/errors
            this.connection.on('close', () => {
                console.error('RabbitMQ connection closed. Attempting to reconnect...');
                // In a production app, you would implement a full reconnection strategy here.
            });
            this.connection.on('error', (err) => {
                console.error('RabbitMQ connection error:', err);
            });
            
            console.log(`RabbitMQ: Connection and channel established. Queue: ${this.queueName}`);
            
        } catch (error: any) {
            console.error('RabbitMQ Connection Failed:', error);
            throw new Error('Failed to connect to RabbitMQ.');
        }
    }

    /**
     * Publishes a JSON message to the configured queue.
     * @param message The payload object to send.
     */
    public publish(message: any): boolean {
        const payload = JSON.stringify(message);
        
        if (!this.channel) {
            console.error('RabbitMQ: Cannot publish, channel not initialized.');
            return false;
        }

        const success = this.channel.sendToQueue(
            this.queueName,
            Buffer.from(payload),
            { persistent: true } // Message survives broker restart
        );
        
        if (success) {
            console.log(`RabbitMQ: Published message to ${this.queueName}: ${payload.substring(0, 100)}...`);
        } else {
            console.warn(`RabbitMQ: Message failed to send to ${this.queueName}.`);
        }

        return success;
    }
    
    /**
     * Starts consuming messages from the configured queue.
     * @param callback The function to execute for each received message.
     */
    public async consume(callback: ConsumerCallback): Promise<void> {
        if (!this.channel) {
            console.error('RabbitMQ: Consume failed. Channel is not initialized or was closed.');
            return;
        }
        
        // Fix: Assign the channel to a local constant to assure TypeScript it is defined
        const channel = this.channel; 

        // Setup the consumer
        await channel.consume(this.queueName, async (msg) => {
            if (msg) {
                try {
                    // Execute the callback function
                    await callback(msg);
                    
                    // Acknowledge the message only after successful processing
                    channel.ack(msg);
                } catch (error) {
                    console.error('RabbitMQ: Error processing message, NACKing:', error);
                    // Reject the message, optionally re-queuing it (false means discard or move to dead-letter queue)
                    channel.nack(msg, false, false); 
                }
            }
        }, {
            noAck: false // We must manually acknowledge the messages
        });
        
    }
}
