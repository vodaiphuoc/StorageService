# Stage 1: Build 
FROM node:20-slim AS builder
WORKDIR /app

COPY ./upload-service ./upload-service
COPY ./commons ./commons
COPY ./shared-clients ./shared-clients

RUN cd ./commons && npm install .
RUN cd ./commons && npm run build

RUN cd ./shared-clients && npm install .
RUN cd ./shared-clients && npm run build

RUN cd ./upload-service && npm install .
RUN cd ./upload-service && npm run build 


# Stage 2: Serve 
FROM node:20-slim AS runner

WORKDIR /app
# RUN mkdir ./upload-service
RUN apt-get update && apt-get install -y curl


COPY --from=builder /app/commons ./commons
COPY --from=builder /app/upload-service/dist ./upload-service/dist
COPY --from=builder /app/upload-service/node_modules ./upload-service/node_modules
COPY --from=builder /app/upload-service/*.json ./upload-service/
COPY --from=builder /app/upload-service/.env ./upload-service/.env 

# Expose the application port
EXPOSE 8080

CMD ["node", "upload-service/dist/index.js"]