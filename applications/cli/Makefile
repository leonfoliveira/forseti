install:
	pip install -r requirements.dev.txt

.PHONY: build
build:
	@python3 generate_config.py \
		$(if $(VERSION),--version $(VERSION),--version latest) \
		$(if $(API_URL),--api-url $(API_URL))
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
