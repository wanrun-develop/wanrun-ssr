// Lambda@Edge 関数 - Next.js サーバーサイドレンダリング用
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Next.js アプリケーションの初期化
// Lambda@Edge 環境では NODE_ENV は 'production' に設定
const app = next({ dev: false });
const handle = app.getRequestHandler();

// Lambda@Edge ハンドラー関数
exports.handler = async (event, context) => {
  // CloudFront リクエストを取得
  const request = event.Records[0].cf.request;
  const uri = request.uri;
  
  // Next.js アプリケーションの準備
  await app.prepare();
  
  // リクエストの URL を解析
  const parsedUrl = parse(uri, true);
  
  try {
    // 静的アセットのリクエストは S3 にリダイレクト
    if (uri.startsWith('/_next/static/') || uri.startsWith('/static/')) {
      // S3 バケットへのリクエストをそのまま通す
      return request;
    }
    
    // Next.js サーバーでリクエストを処理
    return new Promise((resolve) => {
      // 仮想的な HTTP サーバーを作成
      const server = createServer((req, res) => {
        // CloudFront リクエストヘッダーを設定
        req.headers = request.headers;
        req.method = request.method;
        req.url = uri;
        
        // レスポンスを収集
        let body = '';
        let statusCode = 200;
        let headers = {};
        
        // レスポンスをインターセプト
        res.writeHead = (status, responseHeaders) => {
          statusCode = status;
          headers = { ...headers, ...responseHeaders };
        };
        
        res.write = (chunk) => {
          body += chunk.toString();
        };
        
        res.end = (chunk) => {
          if (chunk) {
            body += chunk.toString();
          }
          
          // CloudFront レスポンスを構築
          const response = {
            status: statusCode.toString(),
            statusDescription: 'OK',
            headers: {
              'content-type': [
                {
                  key: 'Content-Type',
                  value: headers['content-type'] || 'text/html; charset=utf-8'
                }
              ],
              'cache-control': [
                {
                  key: 'Cache-Control',
                  value: headers['cache-control'] || 'public, max-age=0, s-maxage=31536000'
                }
              ]
            },
            body: body
          };
          
          resolve(response);
        };
        
        // Next.js にリクエストを処理させる
        handle(req, res, parsedUrl);
      });
      
      // 仮想サーバーにリクエストを送信
      server.emit('request', {}, {});
    });
  } catch (error) {
    // エラーハンドリング
    return {
      status: '500',
      statusDescription: 'Internal Server Error',
      headers: {
        'content-type': [
          {
            key: 'Content-Type',
            value: 'text/html; charset=utf-8'
          }
        ]
      },
      body: `<html><body><h1>エラーが発生しました</h1><p>${error.message}</p></body></html>`
    };
  }
}; 
