/**
 * 联网搜索模块（零配置 DuckDuckGo + 可选 Brave Search API）。
 *
 * 特性：
 * 1. 优先使用 DuckDuckGo 免费搜索源（无需 API Key，无次数限制）。
 * 2. 支持通过 BRAVE_API_KEY 环境变量无缝切换至 Brave Search 结构化接口。
 * 3. 严格 3.5 秒超时与静默降级（搜索失败不影响正常问答，兜底返回空）。
 */

export interface SearchResult {
  title: string
  snippet: string
  url: string
}

const SEARCH_TIMEOUT_MS = 3500

/**
 * 判断问题是否需要触发联网搜索。
 * 社团内部事务、基础编程常识优先走本地知识库；前沿动态、最新版本、外部未知技术触发联网。
 */
export function shouldSearchWeb(question: string): boolean {
  const q = question.toLowerCase().trim()
  if (!q) return false

  // 1. 社团专属词汇与档案库词汇 -> 本地优先，不联网
  const clubKeywords = [
    '云飞扬', '社团', '工作室', '科技园', '陈可', '招新', '向导', 'navi',
    '智光耀城', 'zgyc', '智学伴', 'intellibuddy', '矩阵计算器',
    '打卡', '考勤', '师徒', '值日', '工位', '规范', '分支', '评审', '出处',
    '入门', '路线', '第一周', '契约', '测试', 'git flow'
  ]
  if (clubKeywords.some((kw) => q.includes(kw))) {
    return false
  }

  // 2. 包含最新、搜索、版本号、外部前沿资讯特征 -> 触发联网
  const searchTriggers = [
    '最新', '今天', '最近', '版本', '发布', '新闻', '官网', '搜', '查一下',
    '202', '更新', '特性', 'release', 'whats new', 'changelog', 'vs',
    '区别', '哪个好', '怎么用', '报错', '如何解决'
  ]
  if (searchTriggers.some((kw) => q.includes(kw))) {
    return true
  }

  // 3. 较长或具体的外部技术疑问，默认辅助联网
  return q.length >= 8
}

/**
 * 执行联网搜索，获取前 3 条精简摘要。
 */
export async function searchWeb(
  query: string,
  braveApiKey?: string,
): Promise<SearchResult[]> {
  const ctl = new AbortController()
  const timer = setTimeout(() => ctl.abort(), SEARCH_TIMEOUT_MS)

  try {
    if (braveApiKey && braveApiKey.trim().length > 0) {
      return await searchBrave(query, braveApiKey.trim(), ctl.signal)
    }
    return await searchDuckDuckGo(query, ctl.signal)
  } catch (err) {
    console.warn(`[search] error searching for "${query}":`, err)
    return []
  } finally {
    clearTimeout(timer)
  }
}

/* -------------------------------------------------------- DuckDuckGo 搜索 */

async function searchDuckDuckGo(query: string, signal: AbortSignal): Promise<SearchResult[]> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
    signal,
  })

  if (!res.ok) return []
  const html = await res.text()
  return parseDuckDuckGoHtml(html).slice(0, 3)
}

function parseDuckDuckGoHtml(html: string): SearchResult[] {
  const results: SearchResult[] = []

  // 匹配 result__title 和 result__snippet
  const resultBlocks = html.split(/class="result\s+results_links/i).slice(1)

  for (const block of resultBlocks) {
    const titleMatch = block.match(/class="result__a"[^>]*>([\s\S]*?)<\/a>/i)
    const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i)
    const urlMatch = block.match(/href="([^"]*uddg=([^"&]+)[^"]*)"/i)

    if (titleMatch && snippetMatch) {
      const cleanTitle = cleanHtml(titleMatch[1]!)
      const cleanSnippet = cleanHtml(snippetMatch[1]!)
      let rawUrl = ''
      if (urlMatch && urlMatch[2]) {
        try {
          rawUrl = decodeURIComponent(urlMatch[2])
        } catch {
          rawUrl = urlMatch[1]!
        }
      }

      if (cleanTitle && cleanSnippet) {
        results.push({
          title: cleanTitle,
          snippet: cleanSnippet,
          url: rawUrl,
        })
      }
    }
  }

  return results
}

/* ---------------------------------------------------------- Brave Search */

async function searchBrave(
  query: string,
  apiKey: string,
  signal: AbortSignal,
): Promise<SearchResult[]> {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=3`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'X-Subscription-Token': apiKey,
    },
    signal,
  })

  if (!res.ok) return []
  const data = (await res.json()) as {
    web?: { results?: { title?: string; description?: string; url?: string }[] }
  }
  const items = data.web?.results || []

  return items.slice(0, 3).map((item) => ({
    title: item.title || '',
    snippet: item.description || '',
    url: item.url || '',
  }))
}

/* ------------------------------------------------------------- 辅助清洗 */

function cleanHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}
