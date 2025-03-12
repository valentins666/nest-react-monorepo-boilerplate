# Use PostgreSQL 16 Alpine as the base image for a smaller footprint
FROM postgres:16-alpine

# Add build argument for environment stage
ARG STAGE=dev
ARG DB_PORT=5432
ARG POSTGRES_USER
ARG POSTGRES_PASSWORD
ARG POSTGRES_DB

# Set environment variables
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV POSTGRES_DB=${POSTGRES_DB}

# Copy initialization scripts
COPY apps/backend/src/database/init.sql /docker-entrypoint-initdb.d/

# Set environment variables from the .env file
SHELL ["/bin/sh", "-c"]


# Expose the PostgreSQL port dynamically
EXPOSE ${DB_PORT}

# Set the default command
CMD ["postgres"]
