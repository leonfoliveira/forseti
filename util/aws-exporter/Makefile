install:
	pip install -r requirements.dev.txt

run:
	python -m auto_scaler

lint:
	black auto_scaler --check
	isort auto_scaler --check-only
	flake8 auto_scaler

format:
	black auto_scaler
	isort auto_scaler
