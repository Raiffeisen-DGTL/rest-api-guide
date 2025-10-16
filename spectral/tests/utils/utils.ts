import * as fs from 'node:fs'
import * as path from 'node:path'
import { Spectral, Document } from '@stoplight/spectral-core'
const { bundleAndLoadRuleset } = require('@stoplight/spectral-ruleset-bundler/with-loader')
import { fetch } from '@stoplight/spectral-runtime'
import Parsers = require('@stoplight/spectral-parsers')

const retrieveRuleset = async (filePath) => {
  return await bundleAndLoadRuleset(path.resolve(filePath), { fs, fetch })
}

export const retrieveDocument = (filePath) => {
  const resolved = path.resolve(filePath)
  const body = fs.readFileSync(resolved, 'utf8')
  return new Document(body, Parsers.Yaml, filePath)
}

export const setupSpectral = async (filePath) => {
  const ruleset = await retrieveRuleset(filePath)
  const spectral = new Spectral()
  spectral.setRuleset(ruleset)
  return spectral
}

module.exports = {
  retrieveDocument,
  setupSpectral,
}
