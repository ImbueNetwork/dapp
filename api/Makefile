DBDIR := "./src/db"


all: build

clean:
	rm -rf ./build ./node_modules

node_modules:
	yarn install

build: node_modules
	yarn run tsc

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
		echo $$OUT;\
	    done;\
	'

start: node_modules migrate_latest
	yarn start

.PHONY: clean start migrate migrate_down migrate_up migrate_latest migrate_reset
