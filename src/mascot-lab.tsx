import { useState } from 'react'
import { Mascot } from '@/components/mascot'
import { MASCOT_STATES, STATE_INTENT, type MascotState } from '@/components/mascot/states'
import { CHARACTERS, FICTION_NOTICE } from '@/data/characters'
import { Rail, Tag, Reticle } from '@/components/hud'
import './mascot-lab.css'

/* -------------------------------------------------------------------------
   M2 验收页。六人 × 七态全部摆出来，肉眼比对 spec 第 3 节。
   M3 起被真正的首屏替换掉。

   M8：立绘换成栅格图后这一页的用途变了。七态不再是七张脸，是七个整体姿态；
   「小卡裁切」那一排仍然是方向卡上会看到的样子，用来核 bust 取景有没有削到头发。
   ------------------------------------------------------------------------- */

export function MascotLab() {
  const [state, setState] = useState<MascotState>('NEUTRAL')
  const [still, setStill] = useState(false)

  return (
    <section className="mlab">
      <Rail />

      <header className="mlab-head">
        <div className="mlab-badges">
          <Reticle size={22} />
          <Tag tone="solid">MILESTONE 02</Tag>
          <Tag tone="ink">立绘 · 差分 · 惯性</Tag>
        </div>
        <h2 className="mlab-title">六位角色 · 七态差分</h2>
        <p className="mlab-sub">
          立绘是六张独立的栅格原画，共用的是 halo、道具与这一整套动效。
          鼠标在页面上移动看惯性，点立绘三下看鼓脸，放着不动二十秒看发呆。
        </p>
      </header>

      <div className="mlab-bar">
        {MASCOT_STATES.map((s) => (
          <button
            key={s}
            className="mlab-key"
            data-on={s === state}
            onClick={() => setState(s)}
            title={STATE_INTENT[s]}
          >
            {s}
          </button>
        ))}
        <button className="mlab-key mlab-key-alt" data-on={still} onClick={() => setStill((v) => !v)}>
          {still ? 'STILL' : 'LIVE'}
        </button>
      </div>

      {/* 六人全身 */}
      <div className="mlab-cast">
        {CHARACTERS.map((c) => (
          <figure key={c.id} className="mlab-cell">
            <div className="mlab-stage">
              <Mascot character={c} state={state} still={still} />
            </div>
            <figcaption>
              <Tag tone="solid">{c.codename}</Tag>
              <span className="mlab-name">{c.name}</span>
              <span className="mlab-romaji">{c.romaji}</span>
              <span className="mlab-role">{c.role}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <Rail ticks={false} />

      {/* 七态矩阵。固定一个人，把七个状态并排，差分对不对一眼就看出来。 */}
      <h3 className="mlab-h3">七态姿态</h3>
      <div className="mlab-matrix">
        {MASCOT_STATES.map((s) => (
          <figure key={s} className="mlab-face">
            <div className="mlab-stage mlab-stage-tight">
              <Mascot character={CHARACTERS[1]!} state={s} crop="bust" still />
            </div>
            <figcaption>
              <span className="mlab-state">{s}</span>
              <span className="mlab-note">{STATE_INTENT[s]}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <Rail ticks={false} />

      {/* 小卡只出头肩，这一排就是方向卡上会看到的样子 */}
      <h3 className="mlab-h3">小卡裁切</h3>
      <div className="mlab-bust">
        {CHARACTERS.slice(1).map((c) => (
          <figure key={c.id} className="mlab-face">
            <div className="mlab-stage mlab-stage-tight">
              <Mascot character={c} state={state} crop="bust" still={still} />
            </div>
            <figcaption>
              <span className="mlab-state">{c.codename}</span>
              <span className="mlab-note">{FICTION_NOTICE}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
