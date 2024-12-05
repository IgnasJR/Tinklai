FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5001

ENV DB_HOST=
ENV DB_USER=
ENV DB_PASSWORD=
ENV DB_NAME=
ENV JWT_SECRET=

CMD ["npm", "start"]

# docker build -t my-backend .
# docker run -d   --name backend   -p 5001:5001   my-backend