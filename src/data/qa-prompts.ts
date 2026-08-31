/**
 * 问答面板的预设问题。规格 3.6（M9 新增）。
 *
 * 两类，视觉上必须分开——它们决定了访客对这个助手能力边界的第一印象：
 *
 *   concept  技术概念。模型用自己的知识答，与档案库无关。
 *   archive  档案库里怎么规定的。**只回答「这条在第几篇的哪一节」**，
 *            不复述条款原文——代理端只把篇名与节标题喂给模型，它没有正文，
 *            让它讲条款内容就是让它编。
 *
 * 这个分野不是实现细节，是要写在界面上的：archive 类答完固定附篇目链接，
 * 让人点进去读原文。链接由代理按标题算好，模型不许输出 URL。
 */

export type QaPromptKind = 'concept' | 'archive'

export interface QaPrompt {
  kind: QaPromptKind
  text: string
}

/** 空态里列出来的四条。改这里就够，面板不硬编码文案。 */
export const QA_PROMPTS: readonly QaPrompt[] = [
  { kind: 'concept', text: '介绍一下 Java 的概念' },
  { kind: 'concept', text: '什么是 REST 接口' },
  { kind: 'archive', text: '分支与提交讲了什么' },
  { kind: 'archive', text: '第一周该做什么' },
]

/** 两类各一句说明，标在空态标题下面。 */
export const QA_KIND_NOTE: Record<QaPromptKind, string> = {
  concept: '技术概念我直接讲',
  archive: '档案库的规矩我只能指路',
}
