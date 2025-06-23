FROM python:3.13.5-alpine
COPY . .
RUN apk add --no-cache gcc musl-dev libffi-dev openssl-dev \
    && pip install --no-cache-dir -r requirements.txt
CMD ["python", "-m", "aws_exporter"]