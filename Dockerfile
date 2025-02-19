FROM node:16-alpine as builder

RUN apk add --update git

WORKDIR /app
COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./.npmrc ./

#Installing dependecy and creating build
RUN npm config set registry https://pkg.form.io
RUN npm install

ENV PATH="$PATH:./node_modules/.bin"


COPY . .
RUN npm run build

#prepare Nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
#fire nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]