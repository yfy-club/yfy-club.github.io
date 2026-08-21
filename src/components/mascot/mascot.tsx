import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { Character } from '@/data/characters'
import { HAIR } from './hair'
import { HaloBack, HaloFront, Prop } from './emblem'
import {
  BLINK_SHUT,
  CHEEK_PUFF,
  EXPRESSIONS,
  type Expression,
  type EyeShape,
  type MascotState,
} from './expressions'
import {
  BLUSH,
  BODY,
  CLAVICLE,
  COLLAR,
  COLLAR_TRIM,
  EAR,
  EAR_INNER,
  EYE_COVER,
  EYE_FLICK,
  EYE_LASH,
  EYE_SHADE,
  EYE_SOCKET,
  FACE,
  INNER,
  IRIS,
  MIRROR,
  NECK,
  NECK_SHADE,
  NOSE,
  PUPIL,
  SCARF_KNOT,
  SCARF_TAIL,
  VIEW_H,
  VIEW_W,
} from './geometry'
import { useMascotInertia } from './use-inertia'
import { useMascotState } from './use-mascot-state'
import './mascot.css'

/**
 * 半身矢量看板娘。
 *
 * 图层顺序严格照 spec 3.2，z 序即绘制序，不要重排：
 *   halo-back → hair-back → body → face-base → blush → eyes → brows
 *   → mouth → hair-front → halo-front → prop → fx
 *
 * 六人共用这一个组件。人与人的差别只有三处：色板令牌、发型 path、halo 与道具变体。
 * 想加第七个人，去 src/data/characters.ts 加一行，再去 hair.ts 加一套剪影，别动这里。
 */

export type MascotCrop = 'full' | 'bust'

interface MascotProps {
  character: Character
  /** 页面决定的状态。滚动进区、悬停卡片这些结论由调用方算好传进来。 */
  state?: MascotState
  /** full 出到胸口，bust 只出头肩——方向小卡用后者。 */
  crop?: MascotCrop
  /** 关掉惯性与 halo 自转。静态截图和低端设备走这条。 */
  still?: boolean
  className?: string
}

/** bust 裁到头肩。上缘留出呆毛与 halo，下缘切在锁骨。 */
const CROP_BOX: Record<MascotCrop, string> = {
  full: `0 0 ${VIEW_W} ${VIEW_H}`,
  bust: '78 32 324 372',
}

/** 眼睛的三种开合。CSS 靠它决定固定睫毛与眼球要不要淡出。 */
const eyeMode = (eye: EyeShape) => (eye.shut ? 'shut' : eye.lid ? 'lid' : 'open')

export function Mascot({
  character,
  state: base = 'NEUTRAL',
  crop = 'full',
  still = false,
  className,
}: MascotProps) {
  const svg = useRef<SVGSVGElement>(null)
  const uid = useId().replace(/:/g, '')
  const reduced = usePrefersReducedMotion()
  const alive = !still && !reduced

  const { state, blinking, poke } = useMascotState(base, alive)
  const layers = useCrossfade(state)
  useMascotInertia(svg, alive)

  const hair = HAIR[character.hair] ?? HAIR['navi']!
  const expr = EXPRESSIONS[state]

  return (
    <svg
      ref={svg}
      className={['mascot', className].filter(Boolean).join(' ')}
      viewBox={CROP_BOX[crop]}
      data-char={character.id}
      data-state={state}
      data-eye-l={eyeMode(expr.eye)}
      data-eye-r={eyeMode(expr.eyeRight ?? expr.eye)}
      data-alive={alive}
      // 装饰性图形，屏幕阅读器不该念。角色信息由外层卡片的真实文本承担。
      aria-hidden="true"
      onPointerDown={poke}
      style={{ '--iris-scale': expr.irisScale } as React.CSSProperties}
    >
      <defs>
        {/* 瞳被裁在眼窝里，放大和跟随都跑不出去。右眼在镜像坐标系里复用同一个裁剪。 */}
        <clipPath id={`${uid}-socket`}>
          <path d={EYE_SOCKET} />
        </clipPath>
      </defs>

      <g className="m-parallax">
        {/* ------------------------------------------------ halo 后半 */}
        <g className="m-halo m-halo-back">
          <HaloBack variant={character.halo} />
        </g>

        {/* -------------------------------------------------- 后发 */}
        <g className="m-hair-back">
          <path className="hair-mass" d={hair.back} />
          {hair.backStrands.map((d, i) => (
            <path key={i} className="hair-mass strand-b" d={d} />
          ))}
        </g>

        {/* ------------------------------------ 脖 / 肩胸 / 衣领 / 领巾 */}
        {/* 下巴投影画在这里而不是画在脸上：脸随后覆盖它的上半截，只留下巴以下那一弯 */}
        <g className="m-body">
          <path className="skin" d={NECK} />
          <path className="skin-shade" d={NECK_SHADE} />
          <path className="cloth" d={BODY} />
          <path className="cloth-line" d={CLAVICLE} />
          <path className="cloth-sunk" d={INNER} />
          <path className="cloth" d={COLLAR} />
          <path className="trim" d={COLLAR_TRIM} />
          <g className="scarf">
            <path className="trim-fill" d={SCARF_TAIL} />
            <path className="trim-fill" d={SCARF_KNOT} />
          </g>
        </g>

        {/* -------------------------------------------------- 脸与耳 */}
        <g className="m-face">
          <path className="skin" d={EAR} />
          <path className="skin-line" d={EAR_INNER} />
          <g transform={MIRROR}>
            <path className="skin" d={EAR} />
            <path className="skin-line" d={EAR_INNER} />
          </g>
          <path className="skin" d={FACE} />
        </g>

        {/* ---------------------------------------------------- 眼球 */}
        {/* 眼白、瞳、固定睫毛都是固定件。闭眼时眼球淡出，压睑时睫毛淡出， */}
        {/* 位置由差分层里的睑缘线接手——这就是交叉淡入，不做硬切。 */}
        <g className="m-eyes">
          <g className="eye-unit" data-side="l">
            <Eyeball clip={`${uid}-socket`} />
          </g>
          <g className="eye-unit" data-side="r" transform={MIRROR}>
            <Eyeball clip={`${uid}-socket`} />
          </g>
        </g>

        {/*
          眨眼是叠加层不是状态，自己 90ms 闭 60ms 张，不掺进差分。
          位置必须在差分之前：它要盖住睫毛，但不能盖住眉和嘴。
        */}
        <g className="m-blink" data-on={blinking && !expr.eye.shut}>
          <path className="skin-flat" d={EYE_COVER} />
          <path className="lid-line" d={BLINK_SHUT} />
          <g transform={MIRROR}>
            <path className="skin-flat" d={EYE_COVER} />
            <path className="lid-line" d={BLINK_SHUT} />
          </g>
        </g>

        {/* -------------------------------------------------- 鼻 */}
        <path className="skin-line" d={NOSE} />

        {/* ------------------------------ 差分五组：睑 / 眉 / 嘴 / 腮红 */}
        {/* 交叉淡入靠两层并存，不做硬切。旧层淡出的同时新层淡入。 */}
        {layers.map((layer) => (
          <g key={layer.key} className="m-diff" data-phase={layer.out ? 'out' : 'in'}>
            <Differential expr={EXPRESSIONS[layer.value]} clip={`${uid}-socket`} />
          </g>
        ))}

        {/* -------------------------------------------- 前发 + 呆毛 */}
        {/* 鬓发先画：它的上端要塞进刘海底下，否则脸侧会裂出一道缝 */}
        <g className="m-hair-front">
          {hair.frontStrands.map((d, i) => (
            <path key={i} className="hair-mass strand-f" d={d} />
          ))}
          <path className="hair-mass" d={hair.front} />
          <path className="hair-mass ahoge" d={hair.ahoge} />
          {hair.ornament && <path className="ornament" d={hair.ornament} />}
        </g>

        {/* ------------------------------------------------ halo 前半 */}
        <g className="m-halo m-halo-front">
          <HaloFront variant={character.halo} />
        </g>

        {/* ---------------------------------------------------- 道具 */}
        <Prop variant={character.prop} />
      </g>

      {/* M6 的粒子 Canvas 覆盖层锚在这里，现在是空的。 */}
      <g className="m-fx" />
    </svg>
  )
}

/* ====================================================================== */

/** 眼白 + 内阴影 + 瞳 + 高光 + 固定睫毛。左右同一份，右眼靠镜像坐标系。 */
function Eyeball({ clip }: { clip: string }) {
  return (
    <>
      <g className="eyeball">
        <path className="sclera" d={EYE_SOCKET} />
        <g clipPath={`url(#${clip})`}>
          <path className="sclera-shade" d={EYE_SHADE} />
          <g className="iris">
            <ellipse className="iris-body" cx={IRIS.cx} cy={IRIS.cy} rx={IRIS.rx} ry={IRIS.ry} />
            {/* 瞳底的一圈亮，让扁平色块也有点球感。这是规格允许的两处渐变之一。 */}
            <ellipse className="iris-glow" cx={IRIS.cx} cy={IRIS.cy + 9} rx={IRIS.rx - 4} ry={8} />
            <ellipse className="pupil" cx={PUPIL.cx} cy={PUPIL.cy} rx={PUPIL.rx} ry={PUPIL.ry} />
            <circle className="shine" cx={IRIS.cx - 7} cy={IRIS.cy - 11} r={5.5} />
            <circle className="shine shine-sub" cx={IRIS.cx + 7} cy={IRIS.cy + 10} r={3} />
          </g>
        </g>
        <path className="socket-line" d={EYE_SOCKET} />
      </g>
      <g className="lashes">
        <path className="lash" d={EYE_LASH} />
        <path className="lash-flick" d={EYE_FLICK} />
      </g>
    </>
  )
}

/** 差分五组。同一份表情数据渲染左右，只有写了 *Right 的才不对称。 */
function Differential({ expr, clip }: { expr: Expression; clip: string }) {
  const right = expr.eyeRight ?? expr.eye

  return (
    <>
      {/* 腮红 */}
      <g className="d-blush" style={{ opacity: expr.blush }}>
        <ellipse className="blush" cx={BLUSH.cx} cy={BLUSH.cy} rx={BLUSH.rx} ry={BLUSH.ry} />
        <ellipse
          className="blush"
          cx={VIEW_W - BLUSH.cx}
          cy={BLUSH.cy}
          rx={BLUSH.rx}
          ry={BLUSH.ry}
        />
      </g>

      {/* 鼓脸。只有 POUT 有。 */}
      {expr.puff && (
        <g className="d-puff">
          <path className="skin" d={CHEEK_PUFF} />
          <g transform={MIRROR}>
            <path className="skin" d={CHEEK_PUFF} />
          </g>
        </g>
      )}

      {/* 眼睑 */}
      <g className="d-lid">
        <Lid eye={expr.eye} clip={clip} />
        <g transform={MIRROR}>
          <Lid eye={right} clip={clip} />
        </g>
      </g>

      {/* 眉 */}
      <g className="d-brow">
        <path className="brow" d={expr.brow} />
        {expr.browRight ? (
          <path className="brow" d={expr.browRight} />
        ) : (
          <g transform={MIRROR}>
            <path className="brow" d={expr.brow} />
          </g>
        )}
      </g>

      {/* 嘴 */}
      <path className={expr.mouthFilled ? 'mouth mouth-open' : 'mouth'} d={expr.mouth} />
    </>
  )
}

/** 单眼的睑。皮肤色块裁在眼窝里，睑缘线不裁——它要挑出眼窝一点才像睫毛。 */
function Lid({ eye, clip }: { eye: EyeShape; clip: string }) {
  return (
    <>
      {eye.lid && (
        <g clipPath={`url(#${clip})`}>
          <path className="skin-flat" d={eye.lid} />
        </g>
      )}
      {eye.lidLine && <path className="lid-line" d={eye.lidLine} />}
      {eye.shut && <path className="lid-line" d={eye.shut} />}
    </>
  )
}

/* ====================================================================== */

interface Layer {
  key: number
  value: MascotState
  out: boolean
}

/**
 * 交叉淡入。规格 3.3：120ms，opacity + 3px 位移，不允许硬切。
 * 做法是让旧状态和新状态同时在场，旧的淡出新的淡入，时长一到再摘掉旧的。
 */
function useCrossfade(value: MascotState): Layer[] {
  const [layers, setLayers] = useState<Layer[]>([{ key: 0, value, out: false }])
  const seq = useRef(0)
  const mounted = useRef(false)

  useEffect(() => {
    // 首次挂载不需要淡入淡出，直接就位
    if (!mounted.current) {
      mounted.current = true
      return
    }
    seq.current += 1
    const key = seq.current
    setLayers((prev) => [
      ...prev.filter((l) => !l.out).map((l) => ({ ...l, out: true })),
      { key, value, out: false },
    ])
    const id = setTimeout(() => setLayers((prev) => prev.filter((l) => !l.out)), 240)
    return () => clearTimeout(id)
  }, [value])

  return layers
}

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
