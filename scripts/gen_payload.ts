import INDEX from '../worker/src/qa-index.json' with { type: 'json' }
import { buildPrompt } from '../worker/src/retrieve.ts'

const systemPrompt = buildPrompt(INDEX as any)
const payload = {
  model: 'Mistral-medium-latest',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: 'Git 分支如何规范命名？' }
  ],
  stream: true,
  temperature: 0.2,
  max_tokens: 600
}

console.log(JSON.stringify(payload))
