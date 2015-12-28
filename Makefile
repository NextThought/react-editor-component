.PHONY:
	build \
	clean \
	check \
	test

LIBDIR = lib
CC=webpack
C_FLAGS=--progress --cache --bail

all: node_modules clean check test build

node_modules: package.json
	@rm -rf node_modules
	@npm install
	@touch $@

test: node_modules check
	@karma start --single-run

check:
	@eslint --ext .js,.jsx ./src

clean:
	@rm -rf $(LIBDIR)

build:
	@$(CC) $(C_FLAGS)
