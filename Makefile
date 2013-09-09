DOC_BIN        = naturaldocs
DOC_DIR        = ./doc/code
DOC_CONFIG_DIR = ./doc/config
DOC_CUSTOM_CSS = remotestorage
DOC_INPUTS     = -i src/ -i doc/pages/

.PHONY: doc

doc:
	mkdir -p $(DOC_DIR) $(DOC_CONFIG_DIR)
	$(DOC_BIN) $(DOC_INPUTS) -o html $(DOC_DIR) -p $(DOC_CONFIG_DIR) -s Default $(DOC_CUSTOM_CSS)
