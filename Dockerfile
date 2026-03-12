# builder stage ------------------------------------------------------------
FROM node:20-alpine AS builder
ENV NODE_ENV=development
WORKDIR /app

# copy package files first for cache
COPY package*.json tsconfig.json ./

# install all deps (dev+prod)
RUN npm install

# copy source & prisma schema
COPY index.ts ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# generate Prisma client + compile
RUN npx prisma generate
RUN npm run build

# runtime stage ------------------------------------------------------------
FROM node:20-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 4000
CMD ["npm", "run", "dev"]