import next from "next";
import serverless from "serverless-http";

// const dev = process.env.NODE_ENV !== "production";
const app = next({ dev: false });
const handle = app.getRequestHandler();

exports.handler = async (event, context) => {
  console.log("event", event);
  await app.prepare();
  const handler = serverless((req, res) => {
    console.log("req", req);
    return handle(req, res);
  });
  return handler(event, context);
};
