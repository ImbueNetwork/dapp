DBDIR := "./src/backend/db"


all: clean build

clean: clean_build clean_deps
clean_build:
	rm -rf -- build/*.js build/*/
clean_deps:
	rm -rf node_modules/

node_modules:
	yarn install --force

build: node_modules
	yarn build/frontend
	yarn build/backend
	yarn build/legacy
	mkdir -p ./build/views
	mkdir -p ./build/public
	cp ./src/backend/views/* ./build/views/
	cp -r ./public/* ./build/public/

migrate: migrate_latest

migrate_latest: node_modules
	yarn run knex --cwd ${DBDIR} migrate:latest

migrate_up: node_modules
	yarn run knex --cwd ${DBDIR} migrate:up

migrate_down: node_modules
	yarn run knex --cwd ${DBDIR} migrate:down

migrate_reset: node_modules
	/bin/bash -c '\
	    while [ "x$${OUT/Already at the base migration}" == "x$${OUT}" ]; do\
	        export OUT="$$(yarn run knex --cwd ${DBDIR} migrate:down)";\
		echo "$$OUT";\
	    done;\
	'

seed:
	yarn run knex --cwd ${DBDIR} seed:run

db_up: migrate seed

db_down: migrate_reset

cmd: db_up
	node build/index.js

start: db_up
	yarn start

.PHONY: all clean clean_build clean_deps build \
	migrate migrate_latest migrate_up migrate_down migrate_reset \
	seed db_up db_down \
	cmd start
