# Runtime image for the Scale AI / Outlier MCP server.
#
# The server is compiled to dist/ at image build time, so the runtime stage
# carries production dependencies only. The refresh worker re-executes this
# same compiled entry point in a child process.

FROM node:24-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY server ./server
RUN npm run build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production

# Production dependencies only: tsx and TypeScript are build-time tools.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
# The widget template must be present; the server refuses to start without it.
COPY server/public ./server/public

# Render injects PORT at runtime; the server reads process.env.PORT.
EXPOSE 3001

CMD ["npm", "start"]
