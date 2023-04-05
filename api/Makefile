DBDIR := "./src/backend/db"


all: build

clean: clean_build
clean_build:
	rm -rf -- build/*.js build/*/ public/lib/* node_modules/ rm *.lock
clean_deps:
	rm -rf node_modules/
clean_cache:
	yarn cache clean
	npm cache clean -f
cmd: db_up
	node build/index.js
build: install
	yarn build/frontend
	yarn build/backend
	# yarn build/legacy
	mkdir -p ./build/views
	mkdir -p ./build/public
	cp ./src/backend/views/* ./build/views/
	cp -r ./public/* ./build/public/

install:
	yarn install

migrate: migrate_latest

migrate_latest: install
	yarn run knex --cwd ${DBDIR} migrate:latest

migrate_up: install
	yarn run knex --cwd ${DBDIR} migrate:up

migrate_down: install
	yarn run knex --cwd ${DBDIR} migrate:down

migrate_reset: install
	/bin/bash -c '\
	    while [ "x$${OUT/Already at the base migration}" == "x$${OUT}" ]; do\
	        export OUT="$$(yarn run knex --cwd ${DBDIR} migrate:down)";\
		echo "$$OUT";\
	    done;\
	'
seed:
	yarn run knex --cwd ${DBDIR} seed:run

db_up: migrate

db_down: migrate_reset

start: db_up
	yarn start