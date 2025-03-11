FROM public.ecr.aws/docker/library/node:20.11.0-slim

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 /lambda-adapter /opt/extensions/lambda-adapter
WORKDIR /app
COPY server.js package.json .env ./
COPY .next/ ./.next/
COPY node_modules/ ./node_modules/

CMD node server.js
