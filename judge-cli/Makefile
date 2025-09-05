install:
	pip install -r requirements.dev.txt

.PHONY: build
build:
	pyinstaller --onefile -n judge-cli -p . cli/__main__.py

lint:
	black cli --check
	isort cli --check-only
	flake8 cli

format:
	black cli
	isort cli

.PHONY: test
test:
	python -m pytest
