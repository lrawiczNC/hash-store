import http from 'http';

const DEBUG = false;

export default class httpRequestApi {

  static http(path, data, options){
    return new Promise(function(resolve, reject){
      let req = http.request({
        path: path,
        host: options.host || window.location.hostname,
        port: options.port || window.location.port,
        method: options.method || 'POST',
        headers: options.headers || {
          'Content-Type': 'application/json'
        }
      }, (res) => {
        let replyData = '';
        if (DEBUG) console.log(`STATUS: ${res.statusCode}`);
        if (DEBUG) console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          if (DEBUG) console.log(`BODY: ${chunk}`);
          replyData += chunk;
        });
        res.on('end', () => {
          if (DEBUG) console.log('No more data in response.');
          resolve(replyData);
        });
      });
      req.on('error', (e) => {
        console.error(`Problem with request: ${e.message}`);
        reject(e);
      });
      if (data) {
        let postData = JSON.stringify(data);
        req.write(postData);
      }
      req.end();
    });
  }
}