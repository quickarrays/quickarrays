TS_FILES := $(wildcard *.ts)
JS_FILES := $(TS_FILES:.ts=.js)

all: $(JS_FILES)

%.js: %.ts
	npx tsc -p .

clean:
	rm -f $(JS_FILES)

.PHONY: all clean
