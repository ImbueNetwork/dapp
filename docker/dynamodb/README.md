This is just here so that we have something to check in for git to allow
us to commit the directory with its ownership intact. Otherwise,
`docker-compose` will try to create the directory with the root user, which
will result in a permissions error for sqlite on start up.
