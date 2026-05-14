import { config } from '@vue/test-utils'

config.global.config.warnHandler = () => {}

const originalWarn = console.warn

console.warn = (...args: unknown[]) => {
	const message = args.map(String).join(' ')
	if (message.includes('[Vue warn]') || message.includes('[Vue Router warn]')) {
		return
	}
	originalWarn(...args)
}