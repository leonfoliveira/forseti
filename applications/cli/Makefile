install:
	pip install -r requirements.dev.txt

.PHONY: build
build:
	@if [ -z "$(VERSION)" ]; then \
		python3 generate_version.py --version latest; \
	else \
		python3 generate_version.py --version $(VERSION); \
	fi
	pyinstaller --onefile -n forseti -p . cli/__main__.py

lint:
	black cli --check
	isort cli --check-only
	flake8 cli

format:
	black cli
	isort cli

.PHONY: test
test:
	python3 -m pytest
