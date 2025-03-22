FROM public.ecr.aws/docker/library/node:20.11.0-slim

COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 /lambda-adapter /opt/extensions/lambda-adapter
WORKDIR /app

COPY .next/standalone ./
COPY .next/static ./.next/static
RUN mkdir -p .next/cache  # キャッシュディレクトリを明示的に作成

CMD ["node", "server.js"]
