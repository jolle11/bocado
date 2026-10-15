FROM public.ecr.aws/docker/library/node:22-alpine

WORKDIR /worker
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund
COPY src ./src

CMD ["node", "src/index.js"]
