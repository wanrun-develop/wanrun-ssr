FROM public.ecr.aws/docker/library/node:20.11.0-slim as builder
WORKDIR /app
COPY . .
RUN yarn install --frozen-lockfile
RUN yarn lint && yarn check-format
RUN yarn build

FROM public.ecr.aws/docker/library/node:20.11.0-slim as runner
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 /lambda-adapter /opt/extensions/lambda-adapter
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

CMD node server.js
