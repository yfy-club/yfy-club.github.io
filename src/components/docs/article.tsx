/**
 * 长文渲染。src/data/docs.ts 的块结构 → DOM。
 *
 * 段落与三级标题带 data-focus-unit，交给 use-focus-scroll 做虚焦聚焦。
 * 表格、代码块、摘要不参与：它们含 --ink-600 与等宽小字，
 * 在 opacity .7 下只有 3.32:1，过不了 AA。见 spec 4.4 的 M5 修正记录一。
 */
import { Fragment } from 'react'
import type { DocBlock, DocInline } from '@/data/docs'

export function DocBlocks({ blocks }: { blocks: readonly DocBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </>
  )
}

function Block({ block }: { block: DocBlock }) {
  switch (block.kind) {
    case 'h3':
      return (
        <h3 className="doc-h3" id={block.id} data-focus-unit="">
          {block.text}
        </h3>
      )

    case 'para':
      return (
        <p className="doc-para" data-focus-unit="">
          {block.lines.map((line, i) => (
            // 一段里的每个自然行单独占一行。成稿里三条禁令写成三行，连成一句会变成绕口令。
            <span className="doc-line" key={i}>
              <Runs runs={line} />
            </span>
          ))}
        </p>
      )

    case 'code':
      return (
        <div className="doc-code">
          {block.lang && <span className="doc-code-lang">{block.lang.toUpperCase()}</span>}
          {/*
           * html 是 scripts/build-docs.ts 构建期产出的，只含 tk-k / tk-s / tk-c 三个 class，
           * 尖括号与 & 已在那边转义。运行时不做任何高亮。
           */}
          <pre className="doc-pre">
            <code dangerouslySetInnerHTML={{ __html: block.html }} />
          </pre>
        </div>
      )

    case 'table':
      return (
        <div className="doc-table-wrap">
          <table className="doc-table">
            <thead>
              <tr>
                {block.head.map((cell, i) => (
                  <th key={i} scope="col">
                    <Runs runs={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>
                      <Runs runs={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

function Runs({ runs }: { runs: readonly DocInline[] }) {
  return (
    <>
      {runs.map((run, i) => {
        if (run.t === 'code') return <code key={i}>{run.v}</code>
        if (run.t === 'strong') return <strong key={i}>{run.v}</strong>
        return <Fragment key={i}>{run.v}</Fragment>
      })}
    </>
  )
}
