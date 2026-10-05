FROM python:3.12.11-alpine as builder

WORKDIR /app

RUN apk add --no-cache curl

COPY ./autojudge autojudge
COPY requirements.txt .
COPY entrypoint.sh entrypoint.sh

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8082

RUN chmod +x ./entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
