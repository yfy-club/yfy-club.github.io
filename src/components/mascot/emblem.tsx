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

/** 环上具有梯形/方块厚度的齿轮齿。画在圆空间里。 */
function gearTeeth(count: number, r0: number, r1: number, halfWidthDeg: number = 6) {
  return Array.from({ length: count }, (_, i) => {
    const centerDeg = (i * 360) / count
    const rad1 = ((centerDeg - halfWidthDeg) * Math.PI) / 180
    const rad2 = ((centerDeg + halfWidthDeg) * Math.PI) / 180
    const c1 = Math.cos(rad1)
    const s1 = Math.sin(rad1)
    const c2 = Math.cos(rad2)
    const s2 = Math.sin(rad2)
    return `M${(r0 * c1).toFixed(1)} ${(r0 * s1).toFixed(1)}L${(r1 * c1).toFixed(1)} ${(r1 * s1).toFixed(1)}A${r1} ${r1} 0 0 1 ${(r1 * c2).toFixed(1)} ${(r1 * s2).toFixed(1)}L${(r0 * c2).toFixed(1)} ${(r0 * s2).toFixed(1)}`
  }).join('')
}

/** 环上均分的顶点连成的多边形。FORGE 的六角螺母用它。 */
function polygon(count: number, r: number, offsetDeg: number = -90) {
  return (
    Array.from({ length: count }, (_, i) => {
      const rad = ((i * 360) / count + offsetDeg) * (Math.PI / 180)
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
            style={{ animationDelay: `${i * 0.35}s` }}
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
        <path d={arcTop(HALO.rx, HALO.ry)} />
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
        <path d={arcTop(HALO.rx - 22, HALO.ry - 5.6)} />
      </g>
    )
  }

  if (variant === 'navi') {
    // 旗舰向导光环：双重浮空星轨（远端部分）
    return (
      <g className="halo-ring">
        <path d={arcTop(HALO.rx, HALO.ry)} />
        <path d={arcTop(HALO.rx - 16, HALO.ry - 4.1)} />
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
    /* 细环 + 外环旋转星轨与向导星标阵列 */
    case 'navi':
      return (
        <g className="halo-ring">
          <path d={arcBottom(HALO.rx, HALO.ry)} />
          <path d={arcBottom(HALO.rx - 16, HALO.ry - 4.1)} />
          {/* 左右与下方象限标尺短刻度 */}
          <path
            d={`M${HALO.cx - HALO.rx - 4} ${HALO.cy}H${HALO.cx - HALO.rx + 4}M${HALO.cx + HALO.rx - 4} ${HALO.cy}H${HALO.cx + HALO.rx + 4}M${HALO.cx} ${HALO.cy + HALO.ry - 3}V${HALO.cy + HALO.ry + 4}`}
          />
          <g transform={RING_SPACE}>
            <g className="halo-orbit">
              {/* 外环 4 组巡航星翼导轨与航向刻度（中心完全镂空，不穿呆毛） */}
              {[30, 120, 210, 300].map((deg) => {
                const rad0 = (deg * Math.PI) / 180
                const rad1 = ((deg + 30) * Math.PI) / 180
                const x0 = (92 * Math.cos(rad0)).toFixed(1)
                const y0 = (92 * Math.sin(rad0)).toFixed(1)
                const x1 = (92 * Math.cos(rad1)).toFixed(1)
                const y1 = (92 * Math.sin(rad1)).toFixed(1)
                const midRad = ((deg + 15) * Math.PI) / 180
                const mx0 = (92 * Math.cos(midRad)).toFixed(1)
                const my0 = (92 * Math.sin(midRad)).toFixed(1)
                const mx1 = (97 * Math.cos(midRad)).toFixed(1)
                const my1 = (97 * Math.sin(midRad)).toFixed(1)
                return (
                  <g key={deg}>
                    <path d={`M${x0} ${y0}A92 92 0 0 1 ${x1} ${y1}`} />
                    <path d={`M${mx0} ${my0}L${mx1} ${my1}`} />
                  </g>
                )
              })}
              {/* 北向领航罗盘星标 */}
              <path className="halo-solid" d="M0 -88L7 -74L0 -78L-7 -74Z" />
              {/* 南向对向巡航菱形尾羽 */}
              <path className="halo-solid" d="M0 88L5 77L0 80L-5 77Z" />
              {/* 东向与西向伴飞导航卫星菱晶 */}
              <path className="halo-solid" d="M78 -4L83 0L78 4L73 0Z" />
              <path className="halo-solid" d="M-78 -4L-73 0L-78 4L-83 0Z" />
            </g>
          </g>
        </g>
      )

    /* 神经节点环，节点随机点亮 */
    case 'oracle':
      return (
        <g className="halo-ring">
          <path d={arcBottom(HALO.rx, HALO.ry)} />
          <path d={arcBottom(HALO.rx - 16, HALO.ry - 4.1)} strokeDasharray="4 6" />
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
          <path d={arcBottom(HALO.rx - 22, HALO.ry - 5.6)} />
          <g transform={RING_SPACE}>
            {/* 外层顺时针齿轮：8 齿清晰几何块 */}
            <g className="halo-spin-cw">
              <path d={gearTeeth(8, HALO.rx - 6, HALO.rx + 6, 7)} />
              <path d={teeth(8, HALO.rx - 8, HALO.rx - 5)} />
            </g>
            {/* 内层逆时针齿轮：6 齿咬合结构 */}
            <g className="halo-spin-ccw">
              <path d={gearTeeth(6, HALO.rx - 28, HALO.rx - 16, 9)} />
            </g>
          </g>
        </g>
      )

    /* 三层同心圆柱，逐层沉降 */
    case 'vault':
      return (
        <g className="halo-ring">
          <path d={arcBottom(HALO.rx, HALO.ry)} />
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              className="halo-sink"
              style={{ animationDelay: `${i * 0.35}s` }}
              d={arcBottom(HALO.rx - i * 18, HALO.ry - i * 4.5)}
            />
          ))}
          {/* 纵向数据总线连接筋与分片刻度 */}
          {[45, 90, 135].map((deg) => {
            const p0 = ringPoint(deg, HALO.rx, HALO.ry)
            const p2 = ringPoint(deg, HALO.rx - 36, HALO.ry - 9)
            return (
              <path
                key={deg}
                className="halo-sink"
                style={{ animationDelay: `${(deg / 180) * 0.35}s` }}
                d={`M${p0.x.toFixed(1)} ${p0.y.toFixed(1)}L${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`}
              />
            )
          })}
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
          {/* 三向广播偶极子发射天线与节点 */}
          <g transform={RING_SPACE}>
            {[30, 150, 270].map((deg) => {
              const rad = (deg * Math.PI) / 180
              const c = Math.cos(rad)
              const s = Math.sin(rad)
              return (
                <g key={deg}>
                  <path d={`M${(64 * c).toFixed(1)} ${(64 * s).toFixed(1)}L${(84 * c).toFixed(1)} ${(84 * s).toFixed(1)}`} />
                  <circle
                    className="halo-node"
                    cx={(84 * c).toFixed(1)}
                    cy={(84 * s).toFixed(1)}
                    r={3.5}
                  />
                </g>
              )
            })}
          </g>
        </g>
      )

    /* 六角螺母环，带刻度齿 */
    case 'forge':
      return (
        <g className="halo-ring">
          <path d={arcBottom(HALO.rx, HALO.ry)} />
          <g transform={RING_SPACE}>
            {/* 六角螺母外廓 */}
            <path d={polygon(6, HALO.rx - 8)} />
            {/* 内层旋转刻度表盘 */}
            <circle cx={0} cy={0} r={HALO.rx - 24} />
            <g className="halo-spin-cw">
              <path d={gearTeeth(6, HALO.rx - 26, HALO.rx - 16, 8)} />
            </g>
            {/* 四向游标卡尺精度刻度线 */}
            <path
              d="M68 -4H76M68 0H80M68 4H76M-4 68V76M0 68V80M4 68V76M-68 -4H-76M-68 0H-80M-68 4H-76M-4 -68V-76M0 -68V-80M4 -68V-76"
            />
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
    /* 悬浮向导光标 / 瞄准准星导航浮标 */
    case 'navi':
      return (
        <>
          {/* 准星四角 HUD 锁定边框 [ + ] */}
          <path className="prop-line" d="M-22 -14V-22H-14M14 -22H22V-14M22 14V22H14M-14 22H-22V14" />
          {/* 精密同心刻度环 */}
          <circle className="prop-line" cx={0} cy={0} r={15} />
          {/* 四向瞄准十字刻度 */}
          <path className="prop-line" d="M0 -22V-17M0 22V17M-22 0H-17M22 0H17" />
          {/* 45° 辅助定位点 */}
          <circle className="prop-solid" cx={-10.6} cy={-10.6} r={1.5} />
          <circle className="prop-solid" cx={10.6} cy={-10.6} r={1.5} />
          <circle className="prop-solid" cx={10.6} cy={10.6} r={1.5} />
          <circle className="prop-solid" cx={-10.6} cy={10.6} r={1.5} />
          {/* 中心慢转罗盘指针 */}
          <g className="prop-needle">
            <path className="prop-solid" d="M0 -13L4.5 2.5L0 0L-4.5 2.5Z" />
            <path className="prop-solid" d="M0 9L2.5 4.5L0 3L-2.5 4.5Z" />
            <circle className="prop-solid" cx={0} cy={0} r={2.5} />
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

    /* 代码括号 / 语法晶体浮件 */
    case 'weaver':
      return (
        <>
          {/* 左侧代码括号 < */}
          <path className="prop-line" d="M-24 -15L-33 0L-24 15" />
          <path className="prop-line" d="M-33 0H-37" />
          <circle className="prop-solid" cx={-26} cy={-6} r={1.5} />
          {/* 右侧代码括号 > */}
          <path className="prop-line" d="M24 -15L33 0L24 15" />
          <path className="prop-line" d="M33 0H37" />
          <circle className="prop-solid" cx={26} cy={6} r={1.5} />
          {/* 中心菱形语法晶体与编译晶格 */}
          <path className="prop-line" d="M0 -22L16 0L0 22L-16 0Z" />
          <path className="prop-line" d="M0 -13L9 0L0 13L-9 0Z" />
          {/* 语法斜杠 / */}
          <path className="prop-line" d="M4 -8L-4 8" />
          {/* 晶体编译呼吸节点 */}
          <circle className="prop-node" style={{ animationDelay: '0s' }} cx={0} cy={-22} r={3} />
          <circle className="prop-node" style={{ animationDelay: '0.85s' }} cx={0} cy={22} r={3} />
          {/* 核心能量核 */}
          <circle className="prop-solid" cx={0} cy={0} r={2.5} />
        </>
      )

    /* 数据分片 / 拓扑晶格柱 */
    case 'vault':
      return (
        <>
          {/* 顶部数据分片六角盖板 */}
          <path className="prop-line" d="M0 -25L20 -15L20 -10L0 0L-20 -10L-20 -15Z" />
          <path className="prop-line" d="M0 -25L20 -15L0 -5L-20 -15Z" />
          {/* 底部数据基座 */}
          <path className="prop-line" d="M0 3L20 13L20 18L0 28L-20 18L-20 13Z" />
          <path className="prop-line" d="M0 3L20 13L0 23L-20 13Z" />
          {/* 纵向分布式总线立柱 */}
          <path className="prop-line" d="M-20 -10V13M0 0V23M20 -10V13" />
          {/* 中层悬浮数据切片（带沉降呼吸） */}
          <g className="prop-stack">
            <path className="prop-line" d="M0 -11L15 -3L0 5L-15 -3Z" />
            <circle className="prop-solid" cx={0} cy={-3} r={3} />
          </g>
          {/* 分布式共识拓扑节点 */}
          <circle className="prop-node" style={{ animationDelay: '0s' }} cx={0} cy={-25} r={3} />
          <circle className="prop-node" style={{ animationDelay: '0.4s' }} cx={-20} cy={-15} r={3} />
          <circle className="prop-node" style={{ animationDelay: '0.8s' }} cx={20} cy={-15} r={3} />
          <circle className="prop-node" style={{ animationDelay: '1.2s' }} cx={0} cy={28} r={3} />
        </>
      )

    /* 无线通信节点 / 卫星环形天线 */
    case 'relay':
      return (
        <>
          {/* 倾斜双轨道卫星环（天球陀螺仪） */}
          <ellipse cx={0} cy={0} rx={26} ry={9} transform="rotate(-25)" className="prop-line" />
          <ellipse cx={0} cy={0} rx={26} ry={9} transform="rotate(35)" className="prop-line" />
          {/* 轨道中继节点 */}
          <circle className="prop-node" style={{ animationDelay: '0.3s' }} cx={22} cy={-10} r={3.2} />
          <circle className="prop-node" style={{ animationDelay: '0.9s' }} cx={-20} cy={14} r={3.2} />
          {/* 垂直偶极子天线主桅 */}
          <path className="prop-line" d="M0 -8.5V-26M0 8.5V26" />
          <circle className="prop-solid" cx={0} cy={-26} r={2.5} />
          <circle className="prop-solid" cx={0} cy={26} r={2.5} />
          {/* 中心通信信标核心 */}
          <circle className="prop-solid" cx={0} cy={0} r={5.5} />
          <circle className="prop-line" cx={0} cy={0} r={8.5} />
          {/* 顶部向上扩散的射频无线电波 */}
          {[0, 1].map((i) => (
            <path
              key={i}
              className="prop-wave"
              style={{ animationDelay: `${i * 0.65}s` }}
              d={`M${-8 - i * 5} ${-28 - i * 4}A${10 + i * 6} ${10 + i * 6} 0 0 1 ${8 + i * 5} ${-28 - i * 4}`}
            />
          ))}
        </>
      )

    /* 工业数智化微控六角核心 / 视觉标定仪 */
    case 'forge':
      return (
        <g transform="translate(-4 0)">
          {/* 外围轻盈 HUD 取景框：大间隙悬浮卡角 */}
          <path
            className="prop-line"
            d="M-21 -14V-21H-14M14 -21H21V-14M21 14V21H14M-14 21H-21V14"
          />
          {/* 中心通透利落的工业六角螺母机械构件 */}
          <path className="prop-line" d={polygon(6, 12, 0)} />
          {/* 左右两侧工业通信现场总线导轨 */}
          <path className="prop-line" d="M-21 0H-14M14 0H21" />
          {/* 上下两颗 SCADA 状态呼吸脉冲灯 */}
          <circle className="prop-node" style={{ animationDelay: '0s' }} cx={0} cy={-13.5} r={2.5} />
          <circle className="prop-node" style={{ animationDelay: '0.8s' }} cx={0} cy={13.5} r={2.5} />
          {/* 内层伺服圆环与核心微控能量点 */}
          <circle className="prop-line" cx={0} cy={0} r={6.5} />
          <circle className="prop-solid" cx={0} cy={0} r={3} />
        </g>
      )

    default:
      return null
  }
}
