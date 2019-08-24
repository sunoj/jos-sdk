import * as crypto from 'crypto'
import * as util from 'util'
import * as querystring from 'querystring'
import axios from 'axios';
import * as _ from 'lodash'
import { Utils } from './utils'

const defaultConfig = {
  siteId: "280573243",
  format: 'json',
  v: '1.0',
  apiUrl: 'https://router.jd.com/api'
}

const jdParser = {
  goodsInfo: {
    apiParser: 'jd.union.open.goods.promotiongoodsinfo.query',
    responseParser: 'jd_union_open_goods_promotiongoodsinfo_query_response',
  },
  commonPromotion: {
    apiParser: 'jd.union.open.promotion.common.get',
    responseParser: 'jd_union_open_promotion_common_get_response',
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

  constructor (appKey: string, appSecret: string, accessToken?: string, format: string = defaultConfig.format, v: string = defaultConfig.v, apiUrl: string = defaultConfig.apiUrl) {
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

  public async commonPromotion (params?: { materialId?: string, siteId?: string }) {
    params.siteId = params.siteId ? params.siteId : defaultConfig.siteId

    const result = await this.handleAPI(jdParser.commonPromotion, {
      promotionCodeReq: params
   })
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
      if (_.isEmpty(sysParam[key])) return;
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
  private async handleAPI (parser?: { apiParser: string, responseParser: string }, appParam?: object) {
    const url = this.signUrl(parser.apiParser, appParam)
    let returnResult
    try {
      const response = await axios.post(url, appParam)
      const parsedJson = response.data
      if (parsedJson.error_response) {
        console.error(parsedJson.error_response)
      }
      returnResult = JSON.parse(parsedJson[parser.responseParser].result).data;
    } catch (e) {
      console.error(e)
      throw new Error('解析京东api数据出现错误，详情请查看log！')
    }
    return returnResult
  }
}
