FROM python:3.11-slim

# Set environment variables for Hugging Face Spaces
ENV PORT=7860
ENV HF_HOME=/app/cache

# Create a non-root user (required by Hugging Face Spaces)
RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

# Copy requirements first for better caching
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY --chown=user . .

# Create cache directory with correct permissions
RUN mkdir -p /app/cache

EXPOSE 7860

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "7860"]
