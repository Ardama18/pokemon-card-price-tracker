interface PokemonTCGCard {
  id: string
  name: string
  set: {
    id: string
    name: string
    series: string
    releaseDate: string
  }
  number: string
  rarity?: string
  types?: string[]
  supertype: string
  subtypes?: string[]
  images: {
    small: string
    large: string
  }
  tcgplayer?: {
    url: string
    updatedAt: string
    prices: {
      holofoil?: {
        low: number
        mid: number
        high: number
        market: number
        directLow?: number
      }
      reverseHolofoil?: {
        low: number
        mid: number
        high: number
        market: number
        directLow?: number
      }
      normal?: {
        low: number
        mid: number
        high: number
        market: number
        directLow?: number
      }
      unlimited?: {
        low: number
        mid: number
        high: number
        market: number
        directLow?: number
      }
    }
  }
  cardmarket?: {
    url: string
    updatedAt: string
    prices: {
      averageSellPrice: number
      lowPrice: number
      trendPrice: number
      germanProLow?: number
      suggestedPrice?: number
      reverseHoloSell?: number
      reverseHoloLow?: number
      reverseHoloTrend?: number
      lowPriceExPlus?: number
      avg1?: number
      avg7?: number
      avg30?: number
      reverseHoloAvg1?: number
      reverseHoloAvg7?: number
      reverseHoloAvg30?: number
    }
  }
}

interface PokemonTCGResponse {
  data: PokemonTCGCard[]
  page: number
  pageSize: number
  count: number
  totalCount: number
}

interface PokemonTCGSet {
  id: string
  name: string
  series: string
  printedTotal: number
  total: number
  legalities: {
    unlimited: string
    standard?: string
    expanded?: string
  }
  releaseDate: string
  updatedAt: string
  images: {
    symbol: string
    logo: string
  }
}

export class PokemonTCGAPI {
  private baseUrl = 'https://api.pokemontcg.io/v2'
  private apiKey?: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey
  }

  private async request<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (this.apiKey) {
      headers['X-Api-Key'] = this.apiKey
    }

    console.log('Pokemon TCG API request URL:', url.toString())

    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 3600 } // Cache for 1 hour
    })

    if (!response.ok) {
      console.error('Pokemon TCG API error details:', await response.text())
      throw new Error(`Pokemon TCG API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async searchCards(query: string, options?: {
    page?: number
    pageSize?: number
    orderBy?: string
  }): Promise<PokemonTCGResponse> {
    // 日本語から英語への変換マップ
    const jpToEn: Record<string, string> = {
      // 御三家
      'フシギダネ': 'bulbasaur',
      'フシギソウ': 'ivysaur',
      'フシギバナ': 'venusaur',
      'ヒトカゲ': 'charmander',
      'リザード': 'charmeleon',
      'リザードン': 'charizard',
      'ゼニガメ': 'squirtle',
      'カメール': 'wartortle',
      'カメックス': 'blastoise',
      
      // 人気ポケモン
      'ピカチュウ': 'pikachu',
      'ピカチュー': 'pikachu',
      'ライチュウ': 'raichu',
      'イーブイ': 'eevee',
      'シャワーズ': 'vaporeon',
      'サンダース': 'jolteon',
      'ブースター': 'flareon',
      'エーフィ': 'espeon',
      'ブラッキー': 'umbreon',
      'リーフィア': 'leafeon',
      'グレイシア': 'glaceon',
      'ニンフィア': 'sylveon',
      
      // 伝説・幻のポケモン
      'ミュウツー': 'mewtwo',
      'ミュウ': 'mew',
      'ルギア': 'lugia',
      'ホウオウ': 'ho-oh',
      'セレビィ': 'celebi',
      'カイオーガ': 'kyogre',
      'グラードン': 'groudon',
      'レックウザ': 'rayquaza',
      'ディアルガ': 'dialga',
      'パルキア': 'palkia',
      'ギラティナ': 'giratina',
      'アルセウス': 'arceus',
      'レシラム': 'reshiram',
      'ゼクロム': 'zekrom',
      'キュレム': 'kyurem',
      'ゼルネアス': 'xerneas',
      'イベルタル': 'yveltal',
      'ジガルデ': 'zygarde',
      
      // その他人気ポケモン
      'カビゴン': 'snorlax',
      'ガルーラ': 'kangaskhan',
      'ラプラス': 'lapras',
      'カイリュー': 'dragonite',
      'バンギラス': 'tyranitar',
      'メタグロス': 'metagross',
      'ガブリアス': 'garchomp',
      'ルカリオ': 'lucario',
      'ゾロアーク': 'zoroark',
      'ゲンガー': 'gengar',
      'フーディン': 'alakazam',
      'カイリキー': 'machamp',
      'ゴローニャ': 'golem',
      
      // セット名
      'ポケモンカード151': '151',
      'ポケモン151': '151',
      'ポケカ151': '151',
      '151': '151',
      'スカーレット': 'scarlet',
      'バイオレット': 'violet',
      '黒炎の支配者': 'obsidian',
      'クレイバースト': 'clay',
      'スノーハザード': 'snow',
      '白熱のアルカナ': 'incandescent',
      
      // カードタイプ
      'ex': 'ex',
      'EX': 'ex',
      'GX': 'gx',
      'V': 'v',
      'VMAX': 'vmax',
      'VSTAR': 'vstar'
    }

    // 日本語クエリを英語に変換
    let searchQuery = query.toLowerCase().trim()
    
    console.log('Original search query:', query)
    
    // 日本語キーワードを英語に変換
    let converted = false
    for (const [jp, en] of Object.entries(jpToEn)) {
      if (query.includes(jp)) {
        searchQuery = en
        console.log(`Converted ${jp} to ${en}`)
        converted = true
        break
      }
    }

    // まだ日本語が残っていて変換されていない場合
    if (!converted && /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(query)) {
      // 英語でそのまま検索を試行（一部のカード名は英語のまま）
      searchQuery = query.toLowerCase().trim()
      console.log('Japanese characters detected, trying as-is first')
    }
    
    console.log('Final search query:', searchQuery)

    const params: Record<string, string> = {
      q: `name:*${searchQuery}*`,
      page: (options?.page || 1).toString(),
      pageSize: (options?.pageSize || 20).toString(),
    }

    if (options?.orderBy) {
      params.orderBy = options.orderBy
    }

    return this.request<PokemonTCGResponse>('/cards', params)
  }

  async searchCardsBySet(setName: string, options?: {
    page?: number
    pageSize?: number
  }): Promise<PokemonTCGResponse> {
    const params: Record<string, string> = {
      q: `set.name:"${setName}"`,
      page: (options?.page || 1).toString(),
      pageSize: (options?.pageSize || 20).toString(),
    }

    return this.request<PokemonTCGResponse>('/cards', params)
  }

  async getCardById(id: string): Promise<{ data: PokemonTCGCard }> {
    return this.request<{ data: PokemonTCGCard }>(`/cards/${id}`)
  }

  async getSets(options?: {
    page?: number
    pageSize?: number
    orderBy?: string
  }): Promise<{ data: PokemonTCGSet[] }> {
    const params: Record<string, string> = {
      page: (options?.page || 1).toString(),
      pageSize: (options?.pageSize || 20).toString(),
    }

    if (options?.orderBy) {
      params.orderBy = options.orderBy
    }

    return this.request<{ data: PokemonTCGSet[] }>('/sets', params)
  }

  async getSetById(id: string): Promise<{ data: PokemonTCGSet }> {
    return this.request<{ data: PokemonTCGSet }>(`/sets/${id}`)
  }

  // Convert Pokemon TCG API card to our internal format
  convertToInternalCard(card: PokemonTCGCard): {
    name: string
    setName: string
    setNumber: string
    rarity?: string
    cardType?: string
    series?: string
    imageUrl?: string
    tcgplayerPrices?: any
    cardmarketPrices?: any
  } {
    return {
      name: card.name,
      setName: card.set.name,
      setNumber: card.number,
      rarity: card.rarity,
      cardType: card.supertype,
      series: card.set.series,
      imageUrl: card.images.large,
      tcgplayerPrices: card.tcgplayer?.prices,
      cardmarketPrices: card.cardmarket?.prices,
    }
  }

  // Extract price data from Pokemon TCG API response
  extractPrices(card: PokemonTCGCard): Array<{
    source: string
    price: number
    currency: string
    condition?: string
    productUrl?: string
  }> {
    const prices: Array<{
      source: string
      price: number
      currency: string
      condition?: string
      productUrl?: string
    }> = []

    // TCGPlayer prices
    if (card.tcgplayer?.prices) {
      const tcgPrices = card.tcgplayer.prices
      
      if (tcgPrices.holofoil?.market) {
        prices.push({
          source: 'TCGPlayer',
          price: tcgPrices.holofoil.market,
          currency: 'USD',
          condition: 'holofoil',
          productUrl: card.tcgplayer.url
        })
      }
      
      if (tcgPrices.normal?.market) {
        prices.push({
          source: 'TCGPlayer',
          price: tcgPrices.normal.market,
          currency: 'USD',
          condition: 'normal',
          productUrl: card.tcgplayer.url
        })
      }
      
      if (tcgPrices.reverseHolofoil?.market) {
        prices.push({
          source: 'TCGPlayer',
          price: tcgPrices.reverseHolofoil.market,
          currency: 'USD',
          condition: 'reverse_holofoil',
          productUrl: card.tcgplayer.url
        })
      }
    }

    // CardMarket prices
    if (card.cardmarket?.prices) {
      const cmPrices = card.cardmarket.prices
      
      if (cmPrices.averageSellPrice) {
        prices.push({
          source: 'CardMarket',
          price: cmPrices.averageSellPrice,
          currency: 'EUR',
          condition: 'average',
          productUrl: card.cardmarket.url
        })
      }
      
      if (cmPrices.trendPrice) {
        prices.push({
          source: 'CardMarket',
          price: cmPrices.trendPrice,
          currency: 'EUR',
          condition: 'trend',
          productUrl: card.cardmarket.url
        })
      }
    }

    return prices
  }
}

export const pokemonTCGAPI = new PokemonTCGAPI(process.env.POKEMON_TCG_API_KEY)