TS_FILES := $(wildcard *.ts)
JS_FILES := $(TS_FILES:.ts=.js)

all: $(JS_FILES) gen/pipeline.js

%.js: %.ts
	npx tsc -p .

gen/pipeline.js: ds.ts
	python3 gen_ds_pipeline.py -i ds.ts -o gen/pipeline.js

clean:
	rm -f $(JS_FILES)

.PHONY: all clean
