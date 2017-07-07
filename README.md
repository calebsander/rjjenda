# rjjenda

## Intializing database
````
$ psql postgres

postgres=# CREATE DATABASE rjjenda;
postgres=# CREATE ROLE rjjenda WITH LOGIN;
postgres=# GRANT ALL ON DATABASE "rjjenda" TO rjjenda;
postgres=# \q
````

## Compiling the TypeScript
````
$ npm i -g typescript #if not already installed
$ npm run compile
````