JS_DIR=js
HTML_DIR=html
TS_FILES := $(wildcard *.ts)
# JS_FILES := $(TS_FILES:.ts=.js)
JS_FILES := $(patsubst %.ts,${JS_DIR}/%.js,$(TS_FILES))
JS_FOLDER=../js/

all: $(JS_FILES) ${HTML_DIR}/index.html $(JS_FOLDER)/generated.js

$(JS_FILES): $(TS_FILES)
	npx tsc -p .

${JS_DIR}/algorithm_pipeline.js: algorithm.py algorithm.ts
	python3 algorithm.py

${JS_DIR}/generator_pipeline.js: generator.py generator.ts
	python3 generator.py

${HTML_DIR}/index.html: ${JS_DIR}/algorithm_pipeline.js ${JS_DIR}/generator_pipeline.js skeleton.html
	python3 skeleton.py -i $< -o $@

$(JS_FOLDER)/generated.js: ${JS_DIR}/algorithm_pipeline.js ${JS_DIR}/generator_pipeline.js compile_javascript.py
	python3 compile_javascript.py -i $(JS_DIR) -o $@

clean:
	rm -f $(JS_FILES)

.PHONY: all clean
