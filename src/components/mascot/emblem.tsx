/**
 * halo 与方向道具。六套，全部按 spec 1.3 的造型描述画。
 *
 * halo 拆上下两段弧：上弧进 .m-halo-back 画在立绘之下，下弧进 .m-halo-front 画在立绘之上。
 * 老骨架靠头发压住上弧来给出纵深；换成栅格立绘后头顶的位置由 layout.ts 实测决定，
 * 环整体浮在发顶之上，压住上弧的改成**呆毛**——呆毛尖普遍高过环上缘 19~48 单位，
 * 穿过环的那一段就是纵深。做不到用头发压：这批立绘是 Q 版比例，
 * 头发要张到环那么宽得下探到眼睛高度，那时候环已经不是 halo 是项圈了。
 *
 * 这里画的是 authoring 坐标系，不是最终坐标系。六个人的头顶位置与颅宽各不相同，
 * 由 layout.ts 的 `placement()` 出一个仿射变换把整组搬过去。
 * 所以下面的 HALO 常量只是"画在哪儿方便"，不要拿它当真实摆位。
 *
 * 环上的装饰要跟着椭圆走，不能直接绕中心转（那样会跑出环外）。
 * 统一做法：先把坐标系压扁成 ry/rx，在圆里转，再让压扁把它变回椭圆。
 * 压扁会连描边一起压，所以环上所有描边都挂 vector-effect="non-scaling-stroke"。
 */

/** halo 的 authoring 空间。真实摆位见 layout.ts，那里按实测发顶与颅宽做仿射。 */
export const HALO = { cx: 240, cy: 88, rx: 78, ry: 20 } as const

/** 把圆坐标系压成 halo 椭圆的变换。装饰画在半径 rx 的圆上即可。 */
const RING_SPACE = `translate(${HALO.cx} ${HALO.cy}) scale(1 ${(HALO.ry / HALO.rx).toFixed(4)})`

/** 椭圆上的点。角度用度，0° 在右，顺时针向下。 */
function ringPoint(deg: number, rx: number = HALO.rx, ry: number = HALO.ry) {
  const rad = (deg * Math.PI) / 180
  return { x: HALO.cx + rx * Math.cos(rad), y: HALO.cy + ry * Math.sin(rad) }
}

/** 上半弧（远端，会被头发压住）。 */
function arcTop(rx: number, ry: number) {
  const a = ringPoint(180, rx, ry)
  const b = ringPoint(0, rx, ry)
  return `M${a.x} ${a.y}A${rx} ${ry} 0 0 1 ${b.x} ${b.y}`
}

/** 下半弧（近端，压在头发上）。 */
function arcBottom(rx: number, ry: number) {
  const a = ringPoint(0, rx, ry)
  const b = ringPoint(180, rx, ry)
  return `M${a.x} ${a.y}A${rx} ${ry} 0 0 1 ${b.x} ${b.y}`
}

/** 环上均分的齿。画在圆空间里，由 RING_SPACE 压成椭圆。 */
function teeth(count: number, r0: number, r1: number) {
  return Array.from({ length: count }, (_, i) => {
    const rad = ((i * 360) / count) * (Math.PI / 180)
    const c = Math.cos(rad)
    const s = Math.sin(rad)
    return `M${(r0 * c).toFixed(1)} ${(r0 * s).toFixed(1)}L${(r1 * c).toFixed(1)} ${(r1 * s).toFixed(1)}`
  }).join('')
}

/** 环上均分的顶点连成的多边形。FORGE 的六角螺母用它。 */
function polygon(count: number, r: number) {
  return (
    Array.from({ length: count }, (_, i) => {
      const rad = ((i * 360) / count - 90) * (Math.PI / 180)
      return `${(r * Math.cos(rad)).toFixed(1)} ${(r * Math.sin(rad)).toFixed(1)}`
    })
      .map((p, i) => (i === 0 ? `M${p}` : `L${p}`))
      .join('') + 'Z'
  )
}

/* ====================================================================== */
/*  halo 后半 —— 头发之下                                                  */
/* ====================================================================== */

export function HaloBack({ variant }: { variant: string }) {
  if (variant === 'vault') {
    // 三层同心圆柱，逐层沉降
    return (
      <g className="halo-ring">
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            className="halo-sink"
            style={{ animationDelay: `${i * 0.32}s` }}
            d={arcTop(HALO.rx - i * 18, HALO.ry - i * 4.5)}
          />
        ))}
      </g>
    )
  }

  if (variant === 'relay') {
    // 三道扩散信号波纹
    return (
      <g className="halo-ring">
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            className="halo-wave"
            style={{ animationDelay: `${i * 0.7}s` }}
            d={arcTop(HALO.rx, HALO.ry)}
          />
        ))}
      </g>
    )
  }

  if (variant === 'weaver') {
    // 双层齿环
    return (
      <g className="halo-ring">
        <path d={arcTop(HALO.rx, HALO.ry)} />
        <path d={arcTop(HALO.rx - 20, HALO.ry - 5)} />
      </g>
    )
  }

  return (
    <g className="halo-ring">
      <path d={arcTop(HALO.rx, HALO.ry)} />
    </g>
  )
}

/* ====================================================================== */
/*  halo 前半 —— 头发之上，发光主体                                         */
/* ====================================================================== */

export function HaloFront({ variant }: { variant: string }) {
  switch (variant) {
    /* 细环 + 一枚缓慢转动的指针 */
    case 'navi':
      return (
        <g className="halo-ring">
          <path d={arcBottom(HALO.rx, HALO.ry)} />
          <g transform={RING_SPACE}>
            <g className="halo-orbit">
              <path className="halo-solid" d="M62 0L82 -13L82 13Z" />
            </g>
          </g>
        </g>
      )

    /* 神经节点环，节点随机点亮 */
    case 'oracle':
      return (
        <g className="halo-ring">
          <path d={arcBottom(HALO.rx, HALO.ry)} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
            const p = ringPoint(deg)
            return (
              <circle
                key={deg}
                className="halo-node"
                // 延迟故意取不整除的步长，八颗点不会同时亮成一圈跑马灯
                style={{ animationDelay: `${(i * 0.37) % 2.2}s` }}
                cx={p.x}
                cy={p.y}
                r={4.5}
              />
            )
          })}
        </g>
      )

    /* 双层齿环，反向咬合旋转 */
    case 'weaver':
      return (
        <g className="halo-ring">
          <path d={arcBottom(HALO.rx, HALO.ry)} />
          <path d={arcBottom(HALO.rx - 20, HALO.ry - 5)} />
          <g transform={RING_SPACE}>
            <g className="halo-spin-cw">
              <path d={teeth(18, HALO.rx - 7, HALO.rx + 7)} />
            </g>
            <g className="halo-spin-ccw">
              <path d={teeth(12, HALO.rx - 27, HALO.rx - 13)} />
            </g>
          </g>
        </g>
      )

    /* 三层同心圆柱，逐层沉降 */
    case 'vault':
      return (
        <g className="halo-ring">
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              className="halo-sink"
              style={{ animationDelay: `${i * 0.32}s` }}
              d={arcBottom(HALO.rx - i * 18, HALO.ry - i * 4.5)}
            />
          ))}
        </g>
      )

    /* 三道扩散信号波纹 */
    case 'relay':
      return (
        <g className="halo-ring">
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              className="halo-wave"
              style={{ animationDelay: `${i * 0.7}s` }}
              d={arcBottom(HALO.rx, HALO.ry)}
            />
          ))}
        </g>
      )

    /* 六角螺母环，带刻度齿 */
    case 'forge':
      return (
        <g className="halo-ring">
          <path d={arcBottom(HALO.rx, HALO.ry)} />
          <g transform={RING_SPACE}>
            <path d={polygon(6, HALO.rx - 14)} />
            <g className="halo-spin-cw">
              <path d={teeth(24, HALO.rx - 5, HALO.rx + 5)} />
            </g>
          </g>
        </g>
      )

    default:
      return (
        <g className="halo-ring">
          <path d={arcBottom(HALO.rx, HALO.ry)} />
        </g>
      )
  }
}

/* ====================================================================== */
/*  方向道具 —— 右上角空域，跟着呼吸微浮                                     */
/* ====================================================================== */

/**
 * 六件道具都画在原点附近的 ±34 方框内，摆位由调用方给。
 *
 * 老代码这里是一张写死的锚点表（五个人 `translate(410 172)`，RELAY 因为双马尾单独让一格）。
 * 那张表是对着老矢量剪影调的。换栅格立绘后改成按实测颅宽外推（layout.ts 的 `prop`），
 * 谁头发大谁的道具就自动往外站，不用再逐人手调。
 */
export function Prop({ variant, at }: { variant: string; at: { x: number; y: number; scale: number } }) {
  return (
    <g className="mascot-prop" transform={`translate(${at.x.toFixed(1)} ${at.y.toFixed(1)}) scale(${at.scale})`}>
      <g className="prop-float">{propBody(variant)}</g>
    </g>
  )
}

function propBody(variant: string) {
  switch (variant) {
    /* 悬浮罗盘：向导指路的那枚 */
    case 'navi':
      return (
        <>
          <circle className="prop-line" cx={0} cy={0} r={24} />
          <path className="prop-line" d="M0 -24V-16M0 24V16M-24 0H-16M24 0H16" />
          <g className="prop-needle">
            <path className="prop-solid" d="M0 -17L6 4L0 0L-6 4Z" />
          </g>
        </>
      )

    /* 悬浮神经节点簇 */
    case 'oracle':
      return (
        <>
          <path className="prop-line" d="M0 -22L19 -11L19 11L0 22L-19 11L-19 -11Z" />
          <path className="prop-line" d="M0 -22L0 22M-19 -11L19 11M-19 11L19 -11" />
          {[
            [0, -22],
            [19, -11],
            [19, 11],
            [0, 22],
            [-19, 11],
            [-19, -11],
          ].map(([x, y], i) => (
            <circle
              key={i}
              className="prop-node"
              style={{ animationDelay: `${(i * 0.29) % 1.7}s` }}
              cx={x}
              cy={y}
              r={3.6}
            />
          ))}
          <circle className="prop-solid" cx={0} cy={0} r={5} />
        </>
      )

    /* 织梭与一根穿过去的线 */
    case 'weaver':
      return (
        <>
          <path className="prop-solid" d="M-26 0C-16 -12 16 -12 26 0C16 12 -16 12 -26 0Z" />
          <path className="prop-line" d="M-34 0H34" />
          <path className="prop-line" d="M-10 -6C-4 0 -4 0 -10 6M10 -6C4 0 4 0 10 6" />
        </>
      )

    /* 三层数据柱 */
    case 'vault':
      return (
        <>
          {[-16, 0, 16].map((dy, i) => (
            <g key={dy} className="prop-stack" style={{ animationDelay: `${i * 0.3}s` }}>
              <ellipse className="prop-line" cx={0} cy={dy} rx={22} ry={7} />
              <path className="prop-line" d={`M-22 ${dy}V${dy + 9}A22 7 0 0 0 22 ${dy + 9}V${dy}`} />
            </g>
          ))}
        </>
      )

    /* 信号塔 */
    case 'relay':
      return (
        <>
          <path className="prop-line" d="M-12 24L-4 -10H4L12 24M-8 6H8" />
          <circle className="prop-solid" cx={0} cy={-16} r={4.5} />
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              className="prop-wave"
              style={{ animationDelay: `${i * 0.45}s` }}
              d={`M${-9 - i * 6} ${-24 - i * 4}A${11 + i * 7} ${11 + i * 7} 0 0 1 ${9 + i * 6} ${-24 - i * 4}`}
            />
          ))}
        </>
      )

    /* 六角扳手 */
    case 'forge':
      return (
        <>
          <path
            className="prop-solid"
            d="M-6 -26L6 -26L6 6L18 14L12 26L-12 26L-18 14L-6 6Z"
          />
          <path className="prop-line" d="M0 10L8 15L5 22L-5 22L-8 15Z" />
        </>
      )

    default:
      return null
  }
}
