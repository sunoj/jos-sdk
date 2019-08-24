import * as crypto from 'crypto'
import * as util from 'util'
import * as querystring from 'querystring'
import axios from 'axios';
import * as _ from 'lodash'
import { Utils } from './utils'

const defaultConfig = {
  siteId: "280573243",
  format: 'json',
  v: '2.0',
  apiUrl: 'https://router.jd.com/api'
}

const jdParser = {
  goodsInfo: {
    apiParser: 'jd.union.open.goods.promotiongoodsinfo.query',
  },
  commonPromotion: {
    apiParser: 'jd.union.open.promotion.common.get',
  }
}

axios.defaults.headers.post['Content-Type'] = 'application/json';

/**
 * jd client object Constructor method
 * @param config
 * @returns {JDClient}
 * @constructor
 */
export class JDClient {

  public appKey: string
  public appSecret: string
  public apiUrl: string
  public accessToken: string
  public format: string
  public v: string

  constructor (appKey: string, appSecret: string, accessToken: string, format: string = defaultConfig.format, v: string = defaultConfig.v, apiUrl: string = defaultConfig.apiUrl) {
    this.appKey = appKey
    this.appSecret = appSecret
    this.apiUrl = apiUrl
    this.accessToken = accessToken
    this.format = format
    this.v = v
  }

  public async getProductInfo (skuIds: string[]) {
    const ids = {
      skuIds: skuIds.join(',')
    }
    return await this.handleAPI(jdParser.goodsInfo, ids) || []
  }

  public async commonPromotion (params?: { ids: string[], url?: string, siteId?: string }) {
    params.siteId = params.siteId ? params.siteId : defaultConfig.siteId

    const result = await this.handleAPI(jdParser.commonPromotion, params)
    return result
  }

  /**
   * return the parameter of signature
   * @param {String} method, method name
   * @param {Object} appParam, method parameter
   */
  private signUrl (method: string, appParam: object) {
    let params = []
    let sysParam = {
      access_token: this.accessToken,
      app_key: this.appKey,
      format: this.format,
      v: this.v,
      method: method,
      sign_method: 'md5',
      timestamp: Utils.formatTime(new Date(),'YYYY-MM-DD HH:mm:ss'),
      param_json: JSON.stringify(appParam)
    }
    let sign = this.appSecret
    _.keys(sysParam).forEach((key) => {
      let param = key + sysParam[key]
      params.push(param)
    })
    params.sort()
    for (let i = 0; i < params.length; i++) {
      sign += params[i]
    }
    sign += this.appSecret
    sign = crypto.createHash('md5').update(sign, 'utf8').digest('hex').toUpperCase()
    sysParam = Object.assign(sysParam, {
      sign: sign
    })
    return this.apiUrl + '?' + querystring.stringify(sysParam)
  }

  /**
   * Invoke an api by method name.
   * @param parser
   * @param appParam
   * @returns {Promise<any>}
   */
  private async handleAPI (parser?: { apiParser: string }, appParam?: object) {
    const url = this.signUrl(parser.apiParser, appParam)
    let returnResult = []
    try {
      const response = await axios.post(url, appParam)
      returnResult = response.data.data
    } catch (e) {
      console.error(e)
      throw new Error('解析京东api数据出现错误，详情请查看log！')
    }
    return returnResult
  }
}
