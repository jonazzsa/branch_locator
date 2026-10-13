## This project was generated using Angular CLI version 20.3.7.

## QUICK START

# Using docker compose
docker-compose build
docker-compose up

# Docker UI
docker build -f Dockerfile.frontend -t frontend .
docker run -p 4200:4200 frontend

# Docker API
docker build -f Dockerfile.api -t api .
docker run -p 5001:5001 api

# No Docker UI
npm install
npm run start-with-proxy

# No Docker API
cd api
npm install
node server.js