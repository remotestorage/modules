SOURCEDIR      = src
BUILDDIR       = dist
DOC_BIN        = naturaldocs
DOC_DIR        = ./doc/code
DOC_CONFIG_DIR = ./doc/config
DOC_CUSTOM_CSS = remotestorage
DOC_INPUTS     = -i $(SOURCEDIR) -i doc/pages/

# SOURCES = $(wildcard $(SOURCEDIR)/*.c)
# OBJECTS = $(patsubst $(SOURCEDIR)/%.c, $(BUILDDIR)/%.o, $(SOURCES))


default: help

help:
	@echo "help           - display this text"
	@echo "all            - build all modules and generate documentation"
	@echo "build-all      - build all modules"
	@echo "doc            - generate documentation via NaturalDocs"
	@echo "clean          - remove all build files"

all: deps build-all doc

.PHONY: help build-all doc clean

deps:
	npm install

doc:
	mkdir -p $(DOC_DIR) $(DOC_CONFIG_DIR)
	$(DOC_BIN) $(DOC_INPUTS) -o html $(DOC_DIR) -p $(DOC_CONFIG_DIR) -s Default $(DOC_CUSTOM_CSS)

build-all:
	for file in $(SOURCEDIR)/*.js; do \
		echo "Compiling $$file"; \
		./node_modules/.bin/browserify $$file -t babelify --outfile dist/$${file##*/} ; \
	done

clean:
	rm -r dist/*
