import template from './template.mod.js'
import copyTypes from './copyTypes.mod.ts'
import config from './build.config.ts'

await template(config).run()
copyTypes.run(config)