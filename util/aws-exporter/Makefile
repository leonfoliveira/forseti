install:
	pip install -r requirements.dev.txt

run:
	python -m aws_exporter

lint:
	black aws_exporter --check
	isort aws_exporter --check-only
	flake8 aws_exporter

format:
	black aws_exporter
	isort aws_exporter
