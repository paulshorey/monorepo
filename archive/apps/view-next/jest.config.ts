import { type Config } from 'jest'
import { createNextJestConfig } from '@lib/config/jest/next-app'

export default createNextJestConfig() as () => Promise<Config>
