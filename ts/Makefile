TS_FILES := $(wildcard *.ts)
# JS_FILES := $(TS_FILES:.ts=.js)
DEST_DIR=gen
JS_FILES := $(patsubst %.ts,${DEST_DIR}/%.js,$(TS_FILES))

all: $(JS_FILES) gen/pipeline.js gen/index.html gen/counters.html gen/transforms.html

${DEST_DIR}/%.js: %.ts
	npx tsc -p .

gen/string_generators.html: gen_strings.py string_generator.ts
	python3 gen_strings.py -i string_generator.ts -o gen/string_generators.html -j gen/string_generators.js

gen/pipeline.js: ds.ts
	python3 gen_ds_pipeline.py -i ds.ts -o gen/pipeline.js

gen/ds_disable.html: ds.ts gen_ds_html.py
	python3 gen_ds_html.py -i ds.ts

gen/ds_enable.html: ds.ts gen_ds_html.py
	python3 gen_ds_html.py -i ds.ts

gen/index.html: skeleton.html gen/ds_disable.html gen/ds_enable.html gen/counters.html gen/transforms.html gen/string_generators.html
	python3 gen_html.py -i skeleton.html -o gen/index.html

gen/counters.html: gen_counters.py ds.ts
	python3 gen_counters.py -i ds.ts 

gen/counters.js: gen/counters.html
	python3 gen_counters.py -i ds.ts

gen/transforms.html: gen_transform.py ds.ts
	python3 gen_transform.py -i ds.ts -o gen/transforms.html

clean:
	rm -f $(JS_FILES)

.PHONY: all clean
