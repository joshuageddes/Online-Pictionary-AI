FROM python:3.9.5
EXPOSE 5000/tcp
COPY . /app
COPY templates /app
COPY static /app
WORKDIR /app
RUN pip install --no-cache-dir -r requirements.txt
ENTRYPOINT ["python", "app.py"]
