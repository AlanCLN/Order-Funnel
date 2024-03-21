FROM node:18-alpine
RUN echo "Docker Build Starting..."
WORKDIR /app
COPY . /app
RUN chmod +x /app/build-and-serve-app.sh
RUN cd web && ls && npm -v && npm install
RUN cd web/frontend && ls && npm -v && npm install
CMD ["sh", "/app/build-and-serve-app.sh"]
EXPOSE 8081
RUN echo "Docker Build Complete."
