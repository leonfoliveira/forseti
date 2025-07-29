FROM python:3.13.5-alpine as builder
WORKDIR /app
RUN apk add --no-cache curl
COPY ./auto_scaler auto_scaler
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["python", "-m", "auto_scaler"]