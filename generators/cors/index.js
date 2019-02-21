#! /usr/bin/env node

'use strict'

const fs = require('fs')
const log = require('../../lib/log')
const path = require('path')
const inquirer = require('inquirer')
const chalk = require('chalk')
const { generatePlugin } = require('./generator')
const {
  stop,
  parseArgs,
  isValidFastifyProject
} = require('../../lib/utils')

function showHelp () {
  log('info', fs.readFileSync(path.join(__dirname, '..', '..', 'help', 'plugin.txt'), 'utf8'))
  return module.exports.stop()
}

async function generate (args, cb) {
  let opts = parseArgs(args)
  if (opts.help) {
    return showHelp()
  }

  const dir = opts.directory || process.cwd()
  const pluginPath = path.join(dir, 'app', 'plugins')

  isValidFastifyProject(dir, null, async err => {
    if (err) {
      return cb(err)
    }

    const prompt = inquirer.createPromptModule()
    const answers = await prompt([{
      type: 'checkbox',
      name: 'methods',
      message: 'What methods do you want to enable for cors',
      choices: [
        {
          name: 'DELETE',
          checked: true
        },
        {
          name: 'GET',
          checked: true
        },
        'HEAD',
        'PATCH',
        {
          name: 'POST',
          checked: true
        },
        {
          name: 'PUT',
          checked: true
        },
        'OPTIONS'
      ],
      validate: answers => {
        if (answers.length < 1) {
          return 'You must choose at least one method.'
        }

        return true
      }
    }])

    try {
      await generatePlugin(pluginPath, answers)
    } catch (err) {
      return cb(err)
    }

    log('success', 'CORS plugin correctly configured with given information')
  })
}

function cli (args) {
  generate(args, module.exports.stop)
}

module.exports = { cli, stop, generate }

if (require.main === module) {
  cli(process.argv.slice(2))
}
