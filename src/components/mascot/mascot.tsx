import { useEffect, useMemo, useRef, useState } from 'react'
import type { Character } from '@/data/characters'
import { PORTRAITS, portraitSrc, portraitSrcSet } from '@/data/portraits.generated'
import { HaloBack, HaloFront, Prop } from './emblem'
import type { MascotFx } from './fx'
import { CROP_BOX, placement, viewBoxOf, type MascotCrop } from './layout'
import type { MascotState } from './states'
import { useMascotInertia } from './use-inertia'
import { useMascotState } from './use-mascot-state'
import './mascot.css'

export type { MascotCrop }

/**
 * 角色立绘。
 *
 * 结构（自下而上，即 z 序）：
 *   svg.m-halo-back    halo 远端弧
 *   img.m-portrait     栅格立绘
 *   svg.m-halo-front   halo 近端弧 + 发光主体 + 方向道具
 *
 * **为什么立绘是 HTML `<img>` 而不是 SVG `<image>`。**
 * 前一版把立绘塞在 `<image href>` 里，那样拿不到 srcset / sizes / loading / fetchpriority
 * 这四样——六张图共 800 KB，五张在首屏之下，而 spec 7.3 记着 LCP 已经 2.87s 不达标。
 * 换成 `<img>` 后：Hero 的 NAVI 走 fetchpriority=high 并在 index.html 预载，
 * 其余五张 loading=lazy，且各展示位按 sizes 各取所需档位（256/512/800）。
 *
 * 立绘与两层 SVG 靠同一套 viewBox 数字对齐：SVG 用 `viewBox`，
 * `<img>` 用把 viewBox 单位折成百分比的 CSS 变量。两边同一个坐标系，改一处两边一起动。
 */

interface MascotProps {
  character: Character
  /** 页面决定的状态。滚动进区、悬停卡片这些结论由调用方算好传进来。 */
  state?: MascotState
  /** full 出整幅，bust 收到头肩——方向小卡与挂件用后者。 */
  crop?: MascotCrop
  /** 关掉惯性与 halo 自转。静态截图和低端设备走这条。 */
  still?: boolean
  /**
   * 联动特效（spec 3.4）。谁在悬停、当前在哪个展台这些结论由调用方算好传进来。
   * 传 null 就是没特效，此时反向播放回默认态，不留残留。
   */
  fx?: MascotFx | null
  /**
   * 这张是不是首屏 LCP 元素。只有 Hero 的 NAVI 传 true：
   * 它 eager + fetchpriority=high，其余一律 lazy。
   */
  priority?: boolean
  className?: string
}

/**
 * `sizes`。浏览器据此从 srcset 挑档，写大了就白拉大图，写小了就糊。
 *
 * 数字是按栅格算出来的，不是拍的。内容区 1320 − 2×88 = 1144，12 栏 24 gutter，
 * 单栏 73.3：
 *   Hero      clamp(340px, 48vw, 700px)，1440 视口下 691
 *   大卡      span 5 = 463，立绘占 60% → 278
 *   小卡      span 4 = 365 / span 3 = 268，立绘占 40% → 107~146
 *   dock 挂件 104（视口 < 1360 直接不显示）
 *
 * 一个 crop 只能给一条 sizes，同一 crop 的几个展示位取最大的那个：
 *   full 取 Hero；bust 取最大的小卡，且要乘上取景放大——
 *   bust 的窗口只有 360 单位宽，而图是 400 单位，所以 `<img>` 比容器还宽 11%。
 *   146 × 400/360 ≈ 162，取 170 收个整。2× 屏下 340 → 512w 档，1× 下 → 256w 档。
 */
const SIZES: Record<MascotCrop, string> = {
  full: '(max-width: 768px) 46vw, min(48vw, 700px)',
  bust: '(max-width: 768px) 46vw, 170px',
}

export function Mascot({
  character,
  state: base = 'NEUTRAL',
  crop = 'full',
  still = false,
  fx = null,
  priority = false,
  className,
}: MascotProps) {
  const root = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const alive = !still && !reduced

  const { state, poke } = useMascotState(base, alive)
  useMascotInertia(root, alive)

  const place = useMemo(() => placement(character.id), [character.id])
  const frame = CROP_BOX[crop]
  const asset = PORTRAITS[character.id]

  // viewBox 单位 → 相对取景框的百分比。SVG 与 <img> 因此共用一套坐标。
  const pct = (v: number, span: number) => `${((v / span) * 100).toFixed(4)}%`

  return (
    <div
      ref={root}
      className={['mascot', className].filter(Boolean).join(' ')}
      data-char={character.id}
      data-state={state}
      data-crop={crop}
      data-alive={alive}
      /*
       * 整棵子树都是装饰：立绘、halo、道具没有一样承载信息，
       * 角色名与方向由外层卡片的真实文本负责。
       * 挂在根上而不是逐层挂——逐层挂的话往里加一层就漏一层。
       */
      aria-hidden="true"
      // 联动特效两个通道。没传 fx 时属性不在，CSS 里那几条规则自然不命中。
      data-fx-halo={fx?.halo}
      onPointerDown={poke}
      style={
        {
          '--frame-w': frame.w,
          '--frame-h': frame.h,
          '--img-x': pct(place.img.x - frame.x, frame.w),
          '--img-y': pct(place.img.y - frame.y, frame.h),
          '--img-w': pct(place.img.w, frame.w),
          ...(fx ? { '--fx-tone': fx.tone } : {}),
        } as React.CSSProperties
      }
    >
      <div className="m-parallax">
        <svg className="m-layer m-halo m-halo-back" viewBox={viewBoxOf(crop)}>
          <g transform={haloTransform(place)}>
            <HaloBack variant={character.halo} />
          </g>
        </svg>

        {/* 状态姿态与呼吸拆两层：姿态是状态切换时的一次性位移，呼吸是常驻循环。
            写在同一个元素上后者会被前者整条覆盖（transform 不叠加）。 */}
        <div className="m-pose">
          <div className="m-breathe">
            <img
              className="m-portrait"
              src={portraitSrc(character.id)}
              srcSet={portraitSrcSet(character.id)}
              sizes={SIZES[crop]}
              width={asset.width}
              height={asset.height}
              alt=""
              draggable={false}
              decoding="async"
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              // 图没到之前先铺 20px 的 LQIP，避免小卡在滚动中露出空洞。
              style={{ backgroundImage: `url(${asset.lqip})` }}
            />
          </div>
        </div>

        <svg className="m-layer m-halo m-halo-front" viewBox={viewBoxOf(crop)}>
          <g transform={haloTransform(place)}>
            <HaloFront variant={character.halo} />
          </g>
          {/* 道具锚在颅宽之外，bust 的取景框容不下它，只在 full 出。 */}
          {crop === 'full' && <Prop variant={character.prop} at={place.prop} />}
        </svg>
      </div>
    </div>
  )
}

const haloTransform = (p: ReturnType<typeof placement>) =>
  `translate(${p.halo.x.toFixed(2)} ${p.halo.y.toFixed(2)}) scale(${p.halo.scale.toFixed(4)})`

/** 规格第 6 节：reduce 下必须能关掉立绘惯性。这不是可选项。 */
export function usePrefersReducedMotion() {
  const query = useMemo(
    () =>
      typeof window === 'undefined' ? null : window.matchMedia('(prefers-reduced-motion: reduce)'),
    [],
  )
  const [reduced, setReduced] = useState(() => query?.matches ?? false)

  useEffect(() => {
    if (!query) return
    const on = () => setReduced(query.matches)
    query.addEventListener('change', on)
    return () => query.removeEventListener('change', on)
  }, [query])

  return reduced
}
