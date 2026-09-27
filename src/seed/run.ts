import { readFileSync, writeFileSync } from 'node:fs'
import Module from 'node:module'
import { createRequire } from 'node:module'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: '.env.local' })
loadEnv()

process.env.DRIZZLE_AUTO_CREATE = '1'

const require = createRequire(import.meta.url)

type ModuleLoad = (
  this: unknown,
  request: string,
  parent: NodeModule | undefined,
  isMain: boolean,
) => unknown

const nodeModule = Module as typeof Module & { _load: ModuleLoad }
const originalLoad = nodeModule._load
nodeModule._load = function patchedLoad(request, parent, isMain) {
  const loaded = originalLoad.call(this, request, parent, isMain)
  if (request === 'prompts' && typeof loaded === 'function') {
    const autoConfirm = async (questions: unknown, options: unknown) => {
      const list = Array.isArray(questions) ? questions : [questions]
      const answers: Record<string, unknown> = {}
      let allConfirm = list.length > 0
      for (const question of list) {
        const item = question as { type?: string; name?: string }
        if (item?.type === 'confirm' && item.name) {
          answers[item.name] = true
        } else {
          allConfirm = false
        }
      }
      if (allConfirm) {
        console.log('Accepting schema push warnings automatically.')
        return answers
      }
      return loaded(questions, options)
    }
    Object.assign(autoConfirm, loaded)
    return autoConfirm
  }
  return loaded
}

const drizzleApiPath = require.resolve('drizzle-kit/api')
const marker = 'DRIZZLE_AUTO_CREATE'
let drizzleSource = readFileSync(drizzleApiPath, 'utf8')
if (!drizzleSource.includes(marker)) {
  const needle = `function render7(view5) {
      const { stdin, stdout, closable } = (0, readline_1.prepareReadLine)();
      if (view5 instanceof Prompt3) {
        const terminal = new Terminal(view5, stdin, stdout, closable);
        terminal.requestLayout();
        return terminal.result();
      }`
  const replacement = `function render7(view5) {
      const { stdin, stdout, closable } = (0, readline_1.prepareReadLine)();
      if (view5 instanceof Prompt3) {
        if (process.env.${marker} === '1') {
          closable.close();
          return Promise.resolve({ status: "submitted", data: view5.result() });
        }
        const terminal = new Terminal(view5, stdin, stdout, closable);
        terminal.requestLayout();
        return terminal.result();
      }`
  if (!drizzleSource.includes(needle)) {
    throw new Error('Could not patch drizzle-kit prompt renderer')
  }
  writeFileSync(drizzleApiPath, drizzleSource.replace(needle, replacement))
}

const { getPayload } = await import('payload')
const { default: config } = await import('@payload-config')
const { seed, seedIfEmpty } = await import('./index')

const force = process.argv.includes('--force')
const payload = await getPayload({ config })

if (force) {
  payload.logger.info('Force-seeding localized content...')
  await seed(payload)
} else {
  await seedIfEmpty(payload)
}

payload.logger.info('Seed finished.')
process.exit(0)
