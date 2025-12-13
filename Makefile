# Define the subdirectories to process
SUBDIRS := ts

# Target to run make in each subdirectory
all: $(SUBDIRS)

$(SUBDIRS):
	$(MAKE) -C $@ all

# A common target to clean all subdirectories
clean:
	for dir in $(SUBDIRS); do \
		$(MAKE) -C $$dir clean; \
	done

.PHONY: all clean $(SUBDIRS)
