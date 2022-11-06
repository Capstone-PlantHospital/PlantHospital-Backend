FROM node:12
WORKDIR /home/ubuntu/PlantHospital-Backend
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "./bin/www"]


