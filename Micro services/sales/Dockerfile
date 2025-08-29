# Use official lightweight Python base image
FROM python:3.10-slim

# Set working directory inside container
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy rest of the code
COPY . .

# Expose port (same as Flask app)
EXPOSE 5052

# Run the Flask service
CMD ["python", "salesapp.py"]