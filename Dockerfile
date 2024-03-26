FROM node:20-alpine

RUN echo "Docker Build Starting..."
WORKDIR /app
COPY . /app
RUN chmod +x /app/build-and-serve-app.sh
RUN npm install
RUN cd web && npm install
RUN cd web/frontend && npm install
CMD ["sh", "/app/build-and-serve-app.sh"]
EXPOSE 8081
RUN echo "Docker Build Complete."
