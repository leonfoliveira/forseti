install:
	pip install -r requirements.dev.txt

run:
	python3 -m autoscaler

lint:
	black autoscaler --check
	isort autoscaler --check-only
	flake8 autoscaler

format:
	black autoscaler
	isort autoscaler

.PHONY: test
test:
	python3 -m pytest
