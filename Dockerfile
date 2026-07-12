FROM node:20-slim AS build
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --base-href=/FyloDataStorageComponent/

FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
RUN mkdir -p /usr/share/nginx/html/FyloDataStorageComponent
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/fylo-data-storage-component/browser/ /usr/share/nginx/html/FyloDataStorageComponent/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
