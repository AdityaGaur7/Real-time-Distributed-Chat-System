# Real-time Distributed Chat System

A scalable real-time chat application built with Next.js, Socket.IO, Redis, Apache Kafka, and PostgreSQL using a microservices architecture.

# Project Flow
![Screenshot 2025-03-03 134315](https://github.com/user-attachments/assets/b604fdfc-9edf-4622-b5d7-08df8d6b7d5e)

## Architecture Overview

The system implements a distributed real-time communication platform with the following components:

### Frontend Layer


- Next.js application with Socket.IO client
- Real-time updates using WebSocket connections
- Context providers for socket management

### Backend Services

1. **Socket Servers**

   - Multiple Socket.IO server instances for handling real-time connections
   - Horizontal scaling capability
   - Load balancing across server instances

2. **Message Broker**

   - Redis Pub/Sub for real-time message distribution between socket servers
   - Ensures message delivery across all server instances

3. **Event Processing**

   - Apache Kafka for reliable event streaming
   - Handles message persistence and event sourcing
   - Enables async processing and system scalability

4. **Database Layer**
   - PostgreSQL for persistent storage
   - Prisma as ORM for type-safe database operations

## System Components & Implementation

### 1. Frontend Implementation (Next.js)

#### Socket Context Provider

```typescript
// apps/web/context/SocketProvider.tsx
const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useSocket('ws://localhost:3001');

  useEffect(() => {
    socket.on('message', handleMessage);
    return () => {
      socket.off('message', handleMessage);
    };
  }, [socket]);

  const sendMessage = (message: string) => {
    socket.emit('message', { content: message });
  };

  return (
    <SocketContext.Provider value={{ socket, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};
```

### 2. Backend Services

#### Socket.IO Server Setup

```typescript
// apps/server/src/services/socket.ts
const setupSocketServer = (server: Server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("message", async (data) => {
      // Publish to Redis for other servers
      await redisClient.publish("chat", JSON.stringify(data));

      // Produce to Kafka for persistence
      await kafkaProducer.send({
        topic: "chat-messages",
        messages: [{ value: JSON.stringify(data) }],
      });
    });
  });
};
```

#### Redis Integration

```typescript
// apps/server/src/services/redis.ts
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.subscribe("chat", (message) => {
  // Broadcast to all connected clients on this server
  io.emit("message", JSON.parse(message));
});
```

#### Kafka Producer/Consumer

```typescript
// apps/server/src/services/kafka.ts
const kafka = new Kafka({
  clientId: "chat-app",
  brokers: process.env.KAFKA_BROKERS.split(","),
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: "chat-group" });

// Consumer setup
await consumer.subscribe({ topic: "chat-messages" });
await consumer.run({
  eachMessage: async ({ message }) => {
    // Store message in database
    await prisma.message.create({
      data: JSON.parse(message.value.toString()),
    });
  },
});
```

### 3. Database Schema

```prisma
// apps/server/prisma/schema.prisma
model User {
  id        String    @id @default(uuid())
  name      String
  messages  Message[]
  createdAt DateTime  @default(now())
}

model Message {
  id        String   @id @default(uuid())
  content   String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}
```

## Message Flow

1. **Client Sends Message**

   ```typescript
   socket.emit("message", { content: "Hello!" });
   ```

2. **Socket Server Receives**

   - Validates message
   - Publishes to Redis
   - Produces to Kafka

3. **Redis Distribution**

   - All socket servers receive message
   - Broadcast to connected clients

4. **Kafka Processing**
   - Consumer receives message
   - Stores in PostgreSQL
   - Triggers any additional processing

## Setup & Configuration

### Environment Variables

```env
# apps/web/.env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# apps/server/.env
DATABASE_URL="postgresql://user:password@localhost:5432/chatdb"
REDIS_URL="redis://localhost:6379"
KAFKA_BROKERS="localhost:9092"
FRONTEND_URL="http://localhost:3000"
```

### Docker Compose

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:latest
    environment:
      POSTGRES_DB: chatdb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"

  redis:
    image: redis:latest
    ports:
      - "6379:6379"

  kafka:
    image: confluentinc/cp-kafka:latest
    ports:
      - "9092:9092"
    environment:
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
```

## Development Workflow

1. Start infrastructure:

```bash
docker-compose up -d
```

2. Install dependencies:

```bash
pnpm install
```

3. Run database migrations:

```bash
cd apps/server
pnpm prisma migrate dev
```

4. Start development servers:

```bash
pnpm dev
```

## Scaling Considerations

1. **Socket Servers**

   - Use load balancer (e.g., Nginx)
   - Sticky sessions for WebSocket connections
   - Redis for cross-server communication

2. **Message Processing**

   - Kafka partitioning for parallel processing
   - Consumer groups for load distribution
   - Dead letter queues for failed messages

3. **Database**
   - Connection pooling
   - Read replicas for scaling queries
   - Proper indexing for message queries

## Monitoring & Logging

- Socket.IO metrics
- Kafka consumer lag monitoring
- Redis pub/sub metrics
- PostgreSQL query performance
- Application logs centralization

## Security Considerations

1. **WebSocket Security**

   - Authentication middleware
   - Rate limiting
   - Input validation

2. **Data Protection**
   - Message encryption
   - User data protection
   - CORS configuration

## License

MIT

# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm dev
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
