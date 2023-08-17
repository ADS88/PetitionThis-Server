FROM mysql:5.7
COPY ./app/resources/create_database.sql /docker-entrypoint-initdb.d
EXPOSE 3306