# Stage 1: Build 
FROM node:20-slim AS builder
WORKDIR /app

COPY ./upload-service ./upload-service
COPY ./commons ./commons
COPY ./shared-clients ./shared-clients

RUN echo ls -la
RUN npm run build --prefix ./commons
RUN npm run build --prefix ./shared-clients
RUN cd ./upload-service && npm install .
RUN cd ./upload-service && npm run build 


# Stage 2: Serve 
FROM node:20-slim AS runner

WORKDIR /app

RUN apt-get update && apt-get install -y curl

COPY --from=builder /app/upload-service/dist ./dist
# Copy the built dependencies (node_modules)
COPY --from=builder /app/upload-service/node_modules ./node_modules
COPY --from=builder /app/upload-service/*.json .
COPY --from=builder /app/upload-service/.env .

# Expose the application port
EXPOSE 8080

CMD ["node", "dist/index.js"] 
