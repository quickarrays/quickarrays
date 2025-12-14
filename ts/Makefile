
JS_DIR=js
HTML_DIR=html

BUILD_SENTINEL := $(JS_DIR)/.make_build_complete

TS_CONFIG := tsconfig.json
TS_FILES := $(wildcard *.ts)
# JS_FILES := $(TS_FILES:.ts=.js)
JS_FILES := $(patsubst %.ts,${JS_DIR}/%.js,$(TS_FILES))
JS_FOLDER=../js/

all: $(BUILD_SENTINEL) ${HTML_DIR}/index.html $(JS_FOLDER)/generated.js

$(BUILD_SENTINEL): $(TS_FILES) $(TS_CONFIG)
	@mkdir -p $(JS_DIR)
	npx tsc -p .
	@touch $@

${JS_DIR}/algorithm_pipeline.js: algorithm.py algorithm.ts
	python3 algorithm.py

${JS_DIR}/generator_pipeline.js: generator.py generator.ts
	python3 generator.py

${HTML_DIR}/index.html: skeleton.html ${JS_DIR}/algorithm_pipeline.js ${JS_DIR}/generator_pipeline.js
	python3 skeleton.py -i $< -o $@

$(JS_FOLDER)/generated.js: ${JS_DIR}/algorithm_pipeline.js ${JS_DIR}/generator_pipeline.js compile_javascript.py
	python3 compile_javascript.py -i $(JS_DIR) -o $@

clean:
	rm -r $(JS_DIR) $(HTML_DIR) 
	rm $(JS_FOLDER)/generated.js

.PHONY: all clean
