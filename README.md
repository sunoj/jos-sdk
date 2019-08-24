# jos-open
京东开放API nodejs sdk

[![npm status](https://nodei.co/npm/jos-open.svg?downloads=true&stars=true&downloadRank=true)](https://www.npmjs.com/package/jos-sdk)

## 安装使用

### Install

```
$ npm install jos-open
```

### Use Example (获取商品详情)

```
  var jdConfig = {
    accessToken: 'your access token',
    appKey: 'you app key',
    appSecret: 'your app secret'
    format: 'json',
    v: '2.0'
  };
  const client = new JDClient(jdConfig.appKey, jdConfig.appSecret, jdConfig.accessToken)
  const params = ['1090817274', '11024717589']
  // get product info method
  const results = await client.getProductInfo(params)
```

## 开发调试

Install dependencies:

```shell
$ npm install
```
Run em!