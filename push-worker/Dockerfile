FROM public.ecr.aws/docker/library/node:22-alpine

WORKDIR /worker
COPY package.json ./
RUN npm install --omit=dev
COPY src ./src

CMD ["npm", "start"]
