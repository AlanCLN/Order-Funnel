FROM node:18-alpine
RUN echo "Docker Build Starting..."
WORKDIR /app
COPY . /app
RUN chmod +x /app/build-and-serve-app.sh
RUN pwd && ls
RUN cd web && npm install
RUN pwd && ls 
RUN cd web/frontend && npm install
RUN pwd
CMD ["sh", "/app/build-and-serve-app.sh"]
EXPOSE 8081
RUN echo "Docker Build Complete."
