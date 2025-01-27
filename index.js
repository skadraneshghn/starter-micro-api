const fetch = require('node-fetch');

const subLink = 'https://raw.githubusercontent.com/mahdibland/ShadowsocksAggregator/master/sub/sub_merge.txt';

module.exports = {
  async fetch(request) {
    let url = new URL(request.url);
    let realhostname = url.pathname.split('/')[1];
    let realpathname = url.pathname.split('/')[2];
    if (url.pathname.startsWith('/sub')) {
      let newConfigs = '';
      let resp = await fetch(subLink);
      let subConfigs = await resp.text();
      subConfigs = subConfigs.split('\n');
      for (let subConfig of subConfigs) {
        if (subConfig.search('vmess') != -1) {
          subConfig = subConfig.replace('vmess://', '');
          subConfig = Buffer.from(subConfig, 'base64').toString('utf-8');
          subConfig = JSON.parse(subConfig);
          if (subConfig.sni && !isIp(subConfig.sni) && subConfig.net == 'ws' && subConfig.port == 443) {
            var configNew = new Object();
            configNew.v = '2';
            configNew.ps = 'Node-' + subConfig.sni;
            if (realpathname == '') {
              configNew.add = url.hostname;
            } else {
              configNew.add = realpathname;
            };
            configNew.port = subConfig.port;
            configNew.id = subConfig.id;
            configNew.net = subConfig.net;
            configNew.host = url.hostname;
            configNew.path = '/' + subConfig.sni + subConfig.path;
            configNew.tls = subConfig.tls;
            configNew.sni = url.hostname;
            configNew.aid = '0';
            configNew.scy = 'auto';
            configNew.type = 'auto';
            configNew.fp = 'chrome';
            configNew.alpn = 'http/1.1';
            configNew = 'vmess://' + Buffer.from(JSON.stringify(configNew)).toString('base64');
            newConfigs = newConfigs + configNew + '\n';
          }
        }
      }
      return new Response(newConfigs);
    } else {
      const url = new URL(request.url);
      const splitted = url.pathname.replace(/^\/*/, '').split('/');
      const address = splitted[0];
      url.pathname = splitted.slice(1).join('/');
      url.hostname = address;
      url.protocol = 'https';
      return fetch(new Request(url, request));
    }
  },
};

function isIp(ipstr) {
  try {
    if (ipstr == "" || ipstr == undefined) return false;
    if (!/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])(\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])){2}\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-4])$/.test(ipstr)) {
      return false;
    }
    var ls = ipstr.split('.');
    if (ls == null || ls.length != 4 || ls[3] == "0" || parseInt(ls[3]) === 0) {
      return false;
    }
    return true;
  } catch (ee) { }
  return false;
}
