install:
	pip install -r requirements.txt

run:
	python3 -m autojudge

lint:
	isort autojudge --check-only
	flake8 autojudge
	black autojudge --check

format:
	isort autojudge
	black autojudge
	flake8 autojudge

test:
	python3 -m pytest
