#!/bin/bash
TAG=v0.1

CURRENT_FILE_DIR=$(dirname "$(realpath "$0")")
PROJECT_DIR=$(dirname $(dirname "$(realpath "$0")"))

# option to run
OPTS=$(getopt -o "" --long ngrok:,url: -- "$@")
eval set -- "$OPTS"

NGROK_TOKEN=$2
DEPLOY_URL=$4

# frontend
FRONTEND_IMAGE=clonedrive-angular-image:$TAG
FRONTEND_CONTAINER=clonedrive-angular

# upload service
UPLOAD_IMAGE=clonedrive-upload-image:$TAG
UPLOAD_CONTAINER=clonedrive-upload

# ngrok
NGROK_CONTAINER=clonedrive-ngrok

# make ngrok config
cat <<EOF > "$CURRENT_FILE_DIR/ngrok.yml"
version: 3

agent:
  authtoken: $NGROK_TOKEN
  log_level: debug
  log: false

endpoints:
  - name: my-app-endpoint
    url: $DEPLOY_URL    
    upstream:
      url: frontend-angular:80
EOF

# make env file for docker compose
cat <<EOF > "$CURRENT_FILE_DIR/.env"
FRONTEND_IMAGE=$FRONTEND_IMAGE
FRONTEND_CONTAINER=$FRONTEND_CONTAINER
UPLOAD_IMAGE=$UPLOAD_IMAGE
UPLOAD_CONTAINER=$UPLOAD_CONTAINER
NGROK_CONTAINER=$NGROK_CONTAINER
NGROK_CONFIG_PATH="$CURRENT_FILE_DIR/ngrok.yml"
EOF

# clean up
cleanup() {
  echo "Runining cleanup ..."
  # The cleanup commands you already have
  docker container rm -f "$NGROK_CONTAINER" "$FRONTEND_CONTAINER" "$UPLOAD_CONTAINER"
  docker image rm -f "$FRONTEND_IMAGE" "$UPLOAD_IMAGE"
  
  echo "Cleanup complete."
  exit 1
}
trap cleanup SIGINT

# run docker compose
echo "current dir: $CURRENT_FILE_DIR/.env"
docker compose \
  --env-file "$CURRENT_FILE_DIR/.env" \
  -f "$CURRENT_FILE_DIR/Docker-compose.yaml" \
  up --abort-on-container-exit --build
