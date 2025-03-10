FROM node:20

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 /lambda-adapter /opt/extensions/lambda-adapter
ENV PORT=3000 NODE_ENV=production
ENV AWS_LWA_ENABLE_COMPRESSION=true
WORKDIR /app
COPY server.js package.json .env ./
COPY .next/ ./.next/
COPY node_modules/ ./node_modules/

CMD node server.js
