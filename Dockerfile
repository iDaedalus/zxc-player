# Use official Playwright image with all browsers pre-installed
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with pnpm
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm run build

# Install Playwright Chromium (already have deps from base image)
RUN pnpm exec playwright install chromium --with-deps

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the service
CMD ["pnpm", "start"]
```

### 1.10 Create `.dockerignore`
```
