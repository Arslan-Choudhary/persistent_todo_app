FROM node:alpine

WORKDIR /persistent_todo_app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

# Default for standalone `docker run` when MongoDB is on the host (e.g. `docker-compose up -d mongo`).
# docker-compose overrides this with mongodb://mongo:27017/...
# ENV MONGODB_URI=mongodb://host.docker.internal:27017/devweekends_todos

CMD ["npm", "start"]