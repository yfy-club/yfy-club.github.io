/**
 * 六位角色。全部为原创虚构化名，不指代任何真实社员。
 *
 * 要换名字改这一个文件就够了，别处不硬编码。
 * 色值不写在这里，只写令牌名——真值在 src/styles/tokens.css 的角色色板段。
 * 方向中文名取自主站 src/content/tracks.ts 的 nameZh，本站不另立一套叫法。
 */

export type TrackSlug = 'ai' | 'software' | 'database' | 'cloud-iot' | 'industrial'

export type CharacterId = 'navi' | 'oracle' | 'weaver' | 'vault' | 'relay' | 'forge'

/**
 * halo 与道具的造型键。
 * 老版本这里还有 HairVariant——发型随矢量骨架一起作废（spec M8 修正记录），
 * 头发现在在 NovelAI 出的栅格立绘里，不是我们画的 path。
 */
export type HaloVariant = CharacterId
export type PropVariant = CharacterId

export interface Character {
  id: CharacterId
  /** 绑定的技术方向。向导 NAVI 不绑定，为 null。 */
  track: TrackSlug | null
  /** 方向中文名，向导为职能名。 */
  role: string
  name: string
  romaji: string
  codename: string
  halo: HaloVariant
  prop: PropVariant
}

/*
 * 立绘不在这张表里。文件名、三档宽度、实测的发顶 / 颅宽 / 头中线、LQIP
 * 全部由 scripts/build-portraits.ts 量出来写进 src/data/portraits.generated.ts，
 * 按 id 对上。写一条 avatarUrl 在这儿只会多一处能对不上的地方。
 */

/** 每张角色卡角标固定标注这一行，不允许改写成别的说法。 */
export const FICTION_NOTICE = '虚构角色 · 化名'

export const CHARACTERS: readonly Character[] = [
  {
    id: 'navi',
    track: null,
    role: '向导',
    name: '绫濑 云',
    romaji: 'Ayase Kumo',
    codename: 'NAVI',
    halo: 'navi',
    prop: 'navi',
  },
  {
    id: 'oracle',
    track: 'ai',
    role: '人工智能',
    name: '星见 澪',
    romaji: 'Hoshimi Mio',
    codename: 'ORACLE',
    halo: 'oracle',
    prop: 'oracle',
  },
  {
    id: 'weaver',
    track: 'software',
    role: '软工智能',
    name: '白岸 织',
    romaji: 'Shirakishi Ori',
    codename: 'WEAVER',
    halo: 'weaver',
    prop: 'weaver',
  },
  {
    id: 'vault',
    track: 'database',
    role: '数据库',
    name: '深守 蓝',
    romaji: 'Fukamori Ran',
    codename: 'VAULT',
    halo: 'vault',
    prop: 'vault',
  },
  {
    id: 'relay',
    track: 'cloud-iot',
    role: '智能云物联',
    name: '空乃 涟',
    romaji: 'Sorano Ren',
    codename: 'RELAY',
    halo: 'relay',
    prop: 'relay',
  },
  {
    id: 'forge',
    track: 'industrial',
    role: '工业数智化',
    name: '铁川 澄',
    romaji: 'Tetsukawa Sumi',
    codename: 'FORGE',
    halo: 'forge',
    prop: 'forge',
  },
] as const

export const NAVI = CHARACTERS[0]!

export function characterById(id: CharacterId) {
  const found = CHARACTERS.find((c) => c.id === id)
  if (!found) throw new Error(`没有这个角色：${id}`)
  return found
}

export function characterByTrack(track: TrackSlug) {
  const found = CHARACTERS.find((c) => c.track === track)
  if (!found) throw new Error(`方向 ${track} 没有绑定角色`)
  return found
}
