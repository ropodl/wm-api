FROM node:18.16.0-alpine AS builder
WORKDIR /app 

COPY package*.json /app 


RUN npm install --arch=$(uname -m) --platform=$(uname -s)

FROM node:18.16.0-alpine

WORKDIR /app 

COPY --from=builder /app/node_modules  ./node_modules

COPY . .

EXPOSE 8000 

CMD ["npm", "run", "dev"]