EXTERNAL_JS_FILES := ./build/js/ext/jquery-3.7.1.slim.js ./build/js/ext/jquery.query-object.js ./build/js/ext/tex-mml-chtml.js ./build/js/ext/Sortable.js
TS_CONFIG := ./tsconfig.json
TS_FILES := ./src/algorithm.ts ./src/generator.ts ./src/utility.ts
JS_GEN_FILES := ./build/js/gen/algorithm_pipeline.js ./build/js/gen/generator_pipeline.js ./build/js/gen/tutorial.js ./build/js/gen/citation.js ./build/js/gen/algorithm.js ./build/js/gen/generator.js ./build/js/gen/utility.js
GENERATED_JS := ./build/js/generated.js
BUILD_HTML := ./build/uncompressed.html
ASSETS_DIR := ./assets
BUILD_DIR := ./build
STANDALONE_HTML := ./build/index.html
DIST_PACKED_HTML := ./dist/index.html
ASSET_CSS := ./assets/qa.css
ASSET_JS := ./assets/worker.js ./assets/legacy_redirects.js ./assets/counter_list.js ./assets/text_opt_element.js ./assets/ds_list.js ./assets/prepare_text.js ./assets/item_list.js ./assets/webpage.js
BUILD_DIR_ASSET_CSS := $(subst $(ASSETS_DIR),$(BUILD_DIR)/css,$(ASSET_CSS))
BUILD_DIR_ASSET_JS := $(subst $(ASSETS_DIR),$(BUILD_DIR)/js,$(ASSET_JS))
.PHONY: all check test clean
all: $(BUILD_HTML) $(STANDALONE_HTML) $(DIST_PACKED_HTML)
./build/css/qa.css: ./assets/qa.css
	@mkdir -p ./build/css
	ln -sr ./assets/qa.css ./build/css/qa.css
./build/js/worker.js: ./assets/worker.js
	@mkdir -p ./build/js
	ln -sr ./assets/worker.js ./build/js/worker.js
./build/js/legacy_redirects.js: ./assets/legacy_redirects.js
	@mkdir -p ./build/js
	ln -sr ./assets/legacy_redirects.js ./build/js/legacy_redirects.js
./build/js/counter_list.js: ./assets/counter_list.js
	@mkdir -p ./build/js
	ln -sr ./assets/counter_list.js ./build/js/counter_list.js
./build/js/text_opt_element.js: ./assets/text_opt_element.js
	@mkdir -p ./build/js
	ln -sr ./assets/text_opt_element.js ./build/js/text_opt_element.js
./build/js/ds_list.js: ./assets/ds_list.js
	@mkdir -p ./build/js
	ln -sr ./assets/ds_list.js ./build/js/ds_list.js
./build/js/prepare_text.js: ./assets/prepare_text.js
	@mkdir -p ./build/js
	ln -sr ./assets/prepare_text.js ./build/js/prepare_text.js
./build/js/item_list.js: ./assets/item_list.js
	@mkdir -p ./build/js
	ln -sr ./assets/item_list.js ./build/js/item_list.js
./build/js/webpage.js: ./assets/webpage.js
	@mkdir -p ./build/js
	ln -sr ./assets/webpage.js ./build/js/webpage.js
./build/js/gen/algorithm.js: ./src/algorithm.ts $(TS_CONFIG)
	@mkdir -p ./build/js/gen
	npx babel ./src/algorithm.ts --out-file ./build/js/gen/algorithm.js --presets=@babel/preset-typescript
./build/js/gen/generator.js: ./src/generator.ts $(TS_CONFIG)
	@mkdir -p ./build/js/gen
	npx babel ./src/generator.ts --out-file ./build/js/gen/generator.js --presets=@babel/preset-typescript
./build/js/gen/utility.js: ./src/utility.ts $(TS_CONFIG)
	@mkdir -p ./build/js/gen
	npx babel ./src/utility.ts --out-file ./build/js/gen/utility.js --presets=@babel/preset-typescript
./build/js/gen/algorithm_pipeline.js: ./src/algorithm.ts ./src/algorithm.py
	@mkdir -p ./build/js/gen
	python3 ./src/algorithm.py
$(EXTERNAL_JS_FILES): ./src/external.url ./src/external.py
	@mkdir -p ./build/js/ext
	python3 ./src/external.py
./build/js/gen/generator_pipeline.js: ./src/generator.ts ./src/generator.py
	@mkdir -p ./build/js/gen
	python3 ./src/generator.py
./build/js/gen/tutorial.js: ./src/generator.ts ./src/algorithm.ts  ./src/tutorial.py
	@mkdir -p ./build/js/gen
	python3 ./src/tutorial.py ./src/generator.ts ./src/algorithm.ts
./build/js/gen/citation.js: ./src/generator.ts ./src/algorithm.ts ./src/citation.py
	@mkdir -p ./build/js/gen
	python3 ./src/citation.py ./src/generator.ts ./src/algorithm.ts
$(BUILD_HTML): ./src/skeleton.py $(EXTERNAL_JS_FILES) ./src/skeleton.html $(GENERATED_JS) $(BUILD_DIR_ASSET_JS) $(BUILD_DIR_ASSET_CSS)
	@mkdir -p ./build
	python3 ./src/skeleton.py
$(DIST_PACKED_HTML): $(STANDALONE_HTML)
	@npx parcel build $< --public-url ./
$(GENERATED_JS): $(JS_GEN_FILES) 
	python3 ./src/compile_javascript.py
$(STANDALONE_HTML): $(BUILD_HTML) ./src/standalone.py
	@mkdir -p ./build
	python3 ./src/standalone.py
check:
	npx tsc -p .
test:
	npx jest
clean:
	rm -rf $(BUILD_DIR) $(DIST_DIR)
