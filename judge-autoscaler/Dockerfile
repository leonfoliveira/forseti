FROM python:3.12.11-alpine as builder
WORKDIR /app
RUN apk add --no-cache curl
COPY ./autoscaler autoscaler
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["python", "-m", "autoscaler"]