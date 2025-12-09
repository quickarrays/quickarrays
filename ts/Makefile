TS_FILES := $(wildcard *.ts)
JS_FILES := $(TS_FILES:.ts=.js)

all: $(JS_FILES) gen/pipeline.js gen/index.html

%.js: %.ts
	npx tsc -p .

gen/pipeline.js: ds.ts
	python3 gen_ds_pipeline.py -i ds.ts -o gen/pipeline.js

gen/ds_disable.html: ds.ts
	python3 gen_ds_html.py -i ds.ts

gen/ds_enable.html: ds.ts
	python3 gen_ds_html.py -i ds.ts

gen/index.html: skeleton.html gen/ds_disable.html gen/ds_enable.html
	python3 gen_html.py -i skeleton.html -o gen/index.html

clean:
	rm -f $(JS_FILES)

.PHONY: all clean
