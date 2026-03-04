VENV = .venv
PYTHON = $(VENV)/bin/python
PIP = $(VENV)/bin/pip

.DEFAULT_GOAL := help

help:
	@echo "Available commands:"
	@echo "  make setup    - Create virtual environment and install dependencies"
	@echo "  make build    - Build the forseti executable"
	@echo "  make lint     - Check code formatting and style"
	@echo "  make format   - Format code with black and isort"
	@echo "  make test     - Run tests with pytest"
	@echo "  make clean    - Remove the virtual environment and generated files"

$(VENV)/bin/activate:
	python3 -m venv $(VENV)

setup: $(VENV)/bin/activate
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.dev.txt
	chmod +x $(VENV)/bin/activate
	$(VENV)/bin/activate

build: setup
	@$(PYTHON) generate_config.py \
		$(if $(VERSION),--version $(VERSION),--version latest)
	$(PYTHON) -m PyInstaller --onefile -n forseti -p . cli/__main__.py
	rm -f ./cli/_config.py

lint: setup
	$(PYTHON) -m black cli --check
	$(PYTHON) -m isort cli --check-only
	$(PYTHON) -m flake8 cli

format: setup
	$(PYTHON) -m black cli
	$(PYTHON) -m isort cli

test: setup
	$(PYTHON) -m pytest

clean:
	rm -rf $(VENV)
	rm -rf build/ dist/ *.spec
	rm -f ./cli/_config.py
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name "htmlcov" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -name "*.pyc" -delete

.PHONY: help setup install build lint format test clean
