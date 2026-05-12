# Fase 1: Construcción (Build)
FROM node:22-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Fase 2: Servidor de Producción (Nginx)
FROM nginx:stable-alpine
# Copiamos los archivos construidos de React a la carpeta de Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html
# Copiar la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]