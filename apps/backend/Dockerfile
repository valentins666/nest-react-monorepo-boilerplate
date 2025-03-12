FROM node:20-alpine

WORKDIR /app

ARG STAGE=dev
ARG PORT=3000

# Copy package files
COPY apps/backend ./
COPY nx.json ./
COPY tsconfig*.json ./
COPY apps/backend/dist/package*.json ./

# Copy the appropriate environment file
RUN if [ "$STAGE" = "local" ]; then \
        ls -l; \
        cp -r .env /tmp/.env; \
    else \
        cp -r .env.${STAGE} /tmp/.env; \
    fi

# Install only production dependencies
RUN npm install
RUN npm install pg

# Set environment variables
ENV NODE_ENV=production
ENV PORT=${PORT}

RUN set -a && . /tmp/.env && set +a && \
    # Remove the .env file for security
    rm /tmp/.env

# Expose the port your app runs on
EXPOSE ${PORT}

# Start the application
CMD ["node", "dist/main.js"] 