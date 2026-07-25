FROM python:3.11-slim

WORKDIR /app

RUN pip install --no-cache-dir hatch

COPY pyproject.toml .
# We can't install dependencies yet if there is no src/ or package.
# But hatch will handle this if we configure it correctly, or we can just pip install.
RUN pip install .

COPY . .

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
