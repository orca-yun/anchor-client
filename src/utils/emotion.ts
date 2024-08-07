const EMOTIONS_MAP: {[key: number]: string} = {
  0: '微笑',
  1: '撇嘴',
  2: '色',
  3: '发呆',
  4: '得意',
  5: '流泪',
  6: '害羞',
  7: '闭嘴',
  8: '睡',
  9: '大哭',
  10: '尴尬',
  11: '发怒',
  12: '调皮',
  13: '呲牙',
  14: '惊讶',
  15: '难过',
  16: '酷',
  17: '冷汗',
  18: '抓狂',
  19: '吐',
  20: '偷笑',
  21: '可爱',
  22: '白眼',
  23: '傲慢',
  24: '饥饿',
  25: '困',
  26: '惊恐',
  27: '流汗',
  28: '憨笑',
  29: '大兵',
  30: '奋斗',
  31: '咒骂',
  32: '疑问',
  33: '嘘',
  34: '晕',
  35: '折磨',
  36: '衰',
  37: '骷髅',
  38: '敲打',
  39: '再见',
  40: '擦汗',
  41: '抠鼻',
  42: '鼓掌',
  43: '糗大了',
  44: '坏笑',
  45: '左哼哼',
  46: '右哼哼',
  47: '哈欠',
  48: '鄙视',
  49: '委屈',
  50: '快哭了',
  51: '阴险',
  52: '亲亲',
  53: '吓',
  54: '可怜',
  55: '菜刀',
  56: '西瓜',
  57: '啤酒',
  58: '篮球',
  59: '乒乓',
  60: '咖啡',
  61: '饭',
  62: '猪头',
  63: '玫瑰',
  64: '凋谢',
  65: '示爱',
  66: '爱心',
  67: '心碎',
  68: '蛋糕',
  69: '闪电',
  70: '炸弹',
  71: '刀',
  72: '足球',
  73: '瓢虫',
  74: '便便',
  75: '月亮',
  76: '太阳',
  77: '礼物',
  78: '拥抱',
  79: '强',
  80: '弱',
  81: '握手',
  82: '胜利',
  83: '抱拳',
  84: '勾引',
  85: '拳头',
  86: '差劲',
  87: '爱你',
  88: 'NO',
  89: 'OK',
  90: '爱情',
  91: '飞吻',
  92: '跳跳',
  93: '发抖',
  94: '怄火',
  95: '转圈',
  96: '磕头',
  97: '回头',
  98: '跳绳',
  99: '挥手',
  100: '激动',
  101: '街舞',
  102: '献吻',
  103: '左太极',
  104: '右太极'
}

const emotionsBaseUrl = 'https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/'
const silent = true

export interface configInterface {
  emotionsMap: {},
  emotionsBaseUrl: string,
  silent: boolean
}

export class WxEmotions {
  private configValue: configInterface = {
    emotionsMap: EMOTIONS_MAP,
    emotionsBaseUrl: emotionsBaseUrl,
    silent: silent
  }

  constructor (config?: configInterface) {
    if (config) {
      this.configValue = Object.assign(this.configValue, config)
    }
  }

  public config (config?: {}): configInterface {
    if (config) {
      this.configValue = Object.assign(this.configValue, config)
      return this.configValue
    } else {
      return this.configValue
    }
  }

  public get emotionsIds (): number[] {
    return Object.keys(EMOTIONS_MAP).map(Number)
  }

  public get emotionsCount (): number {
    return this.emotionsIds.length
  }

  public get textToIdMap (): Map<string, number> {
    let map = new Map()
    this.emotionsIds.forEach((id) => {
      map.set(EMOTIONS_MAP[id], id)
    })
    return map
  }

  public get idToTextMap () {
    let map = new Map()
    this.emotionsIds.forEach((id) => {
      map.set(id, EMOTIONS_MAP[id])
    })
    return map
  }

  public get emotionSrcList (): string[] {
    return this.emotionsIds.map((id) => {
      return `${this.configValue.emotionsBaseUrl}${id}.gif`
    })
  }

  private static handleId (id: string | number): string {
    if (typeof id === 'string') {
      id = Number.parseInt(id)
    }

    if (id >= 0 && id <= 105) {
      return id + ''
    } else {
      return 'invalid'
    }
  }

  private static hasEmotionsPattern (message: string) {
    let openIndex = message.indexOf('[')
    let closeIndex = message.indexOf(']')

    return (openIndex > -1 && closeIndex > openIndex)
  }

  /**
   * 把字符串中的表情文字替换成表情图片
   * @param message
   * @returns {*}
   */
  public parse (message: string): string {
    if (!message) {
      if (this.configValue.silent) {
        return ''
      } else {
        throw new Error('message must be string')
      }
    }

    if (WxEmotions.hasEmotionsPattern(message)) {
      this.emotionsIds.forEach((id) => {
        let emotionText = EMOTIONS_MAP[id]
        let regex = new RegExp('\\[' + emotionText + '\\]', 'g')
        let replacement = `<img class="wx-orca-emoji__img" src="${this.configValue.emotionsBaseUrl}${id}.gif" alt="['${emotionText}']">`
        message = message.replace(regex, replacement)
      })
    }
    return message
  }

  public textToImage (text: string): string | never {
    if (!text) {
      if (this.configValue.silent) {
        return ''
      } else {
        throw new Error('text must be string')
      }
    }

    let id = this.textToIdMap.get(text)

    if (id) {
      return `<img src="${this.configValue.emotionsBaseUrl}${id}.gif" alt="[${text}]">`
    } else {
      if (this.configValue.silent) {
        return ''
      } else {
        throw new Error('not emotion text')
      }
    }
  }

  public idToText (id: string | number): string | never {
    id = WxEmotions.handleId(id)
    if (id === 'invalid') {
      if (this.configValue.silent) {
        return 'invalid id'
      } else {
        throw new Error('invalid id')
      }
    } else {
      return `[${this.idToTextMap.get(Number(id))}]`
    }
  }
}
