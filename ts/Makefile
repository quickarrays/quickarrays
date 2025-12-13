JS_DIR=js
TS_FILES := $(wildcard *.ts)
# JS_FILES := $(TS_FILES:.ts=.js)
JS_FILES := $(patsubst %.ts,${JS_DIR}/%.js,$(TS_FILES))

all: $(JS_FILES) js/pipeline.js gen/index.html gen/counters.html gen/transforms.html

${JS_DIR}/%.js: %.ts
	npx tsc -p .

gen/string_generators.html: gen_strings.py string_generator.ts
	python3 gen_strings.py -i string_generator.ts -o gen/string_generators.html -j js/string_generators.js

js/pipeline.js: algorithm.ts
	python3 gen_ds_pipeline.py -i algorithm.ts -o js/pipeline.js

gen/ds_disable.html: algorithm.ts gen_ds_html.py
	python3 gen_ds_html.py -i algorithm.ts

gen/ds_enable.html: algorithm.ts gen_ds_html.py
	python3 gen_ds_html.py -i algorithm.ts

gen/index.html: skeleton.html gen/ds_disable.html gen/ds_enable.html gen/counters.html gen/transforms.html gen/string_generators.html
	python3 gen_html.py -i skeleton.html -o gen/index.html

gen/counters.html: gen_counters.py algorithm.ts
	python3 gen_counters.py -i algorithm.ts 

js/counters.js: gen/counters.html
	python3 gen_counters.py -i algorithm.ts

gen/transforms.html: gen_transform.py algorithm.ts
	python3 gen_transform.py -i algorithm.ts -o gen/transforms.html

clean:
	rm -f $(JS_FILES)

.PHONY: all clean
