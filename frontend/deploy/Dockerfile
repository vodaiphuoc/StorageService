# Stage 1: Build 
FROM node:lts-alpine AS build
WORKDIR /app

COPY ./frontend ./frontend
COPY ./commons ./commons
COPY ./frontend/deploy/nginx ./nginx

RUN echo ls -la
RUN npm run build --prefix ./commons
RUN cd ./frontend && npm install .
RUN cd ./frontend && npm run build 


# Stage 2: Serve 
FROM nginx:alpine

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/*

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/frontend/dist/frontend/browser /usr/share/nginx/html
COPY --from=build /app/nginx/nginx.conf /etc/nginx/conf.d
CMD ["nginx", "-g", "daemon off;"]

