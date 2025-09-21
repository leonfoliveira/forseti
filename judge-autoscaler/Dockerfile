FROM python:3.12.11-alpine as builder

WORKDIR /app

RUN apk add --no-cache curl

COPY ./autoscaler autoscaler
COPY requirements.txt .
COPY entrypoint.sh entrypoint.sh

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 7000

RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]