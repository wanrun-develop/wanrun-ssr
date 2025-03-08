const next = require("next");
const { parse } = require("url");

const app = next({ dev: false });
const handle = app.getRequestHandler();

exports.handler = async function(event, context) {
  await app.prepare();

  const { request } = event.Records[0].cf;
  const { uri } = request;
  const parsedUrl = parse(uri, true);

  try {
    // Next.js の SSR を実行
    const html = await app.renderToHTML({ url: uri }, {}, parsedUrl);

    return {
      status: "200",
      statusDescription: "OK",
      headers: {
        "content-type": [{ key: "Content-Type", value: "text/html" }],
      },
      body: html,
    };
  } catch (error) {
    return {
      status: "500",
      statusDescription: "Internal Server Error",
      headers: {
        "content-type": [{ key: "Content-Type", value: "text/html" }],
      },
      body: `<html><body><h1>エラー</h1><p>${error.message}</p></body></html>`,
    };
  }
};
