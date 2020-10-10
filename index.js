const path = require('path')
const CONFIG = {
  includes: ['path', 'name', 'pagePath'],
}
const rootPath = path.resolve(process.cwd(), 'node_modules')

/** 解析绝对路径
 * @param {Object} dir
 */
function resolvePath(dir) {
  return path.resolve(rootPath, dir)
}

class PagesJsonConverter {
  constructor(config) {
    config = {
      ...CONFIG,
      ...config,
    }
    this.CONFIG = { includes: config.includes }
    this.METHOD = config.methodsName || {}
    this.uniPagesJSON = require(resolvePath(
      '@dcloudio/uni-cli-shared/lib/pages.js'
    ))
    this.routes = this.getPagesRoutes().concat(this.getsSubPackagesRoutes())
    this.switchTabs = this.getPagesRoutes({
      pages: this.pagesJson.tabBar.list,
      type: 'pagePath',
    }).concat(this.getsSubPackagesRoutes())
    this.routes.forEach((route) => {
      const isMatchRoute = this.switchTabs.some(
        (switchTab) => route.path === switchTab.pagePath
      )
      if (isMatchRoute) {
        route.routerMethod = this.METHOD.isTabBar || 'switchTab'
      } else {
        route.routerMethod = this.METHOD.noTabBar || 'navigateTo'
      }
    })
    // eslint-disable-next-line no-console
    console.log('注入全局变量ROUTES_LIST:\n', this.routes)
  }

  // 获取pages.json下的内容 返回json
  get pagesJson() {
    return this.uniPagesJSON.getPagesJson()
  }

  // 通过读取pages.json文件 生成直接可用的routes
  getPagesRoutes({
    pages = this.pagesJson.pages,
    rootPath = null,
    type = 'path', // 区分pages里的路由和tabBar里的路由
  } = {}) {
    const routes = []
    for (let i = 0; i < pages.length; i++) {
      const item = pages[i]
      const route = {}
      for (let j = 0; j < this.CONFIG.includes.length; j++) {
        const key = this.CONFIG.includes[j]
        let value = item[key]
        if (key === type) {
          value = rootPath ? `/${rootPath}/${value}` : `/${value}`
        }
        if (value !== undefined && value !== null) {
          route[key] = value
        }
      }
      routes.push(route)
    }
    return routes
  }

  // 解析小程序分包路径
  getsSubPackagesRoutes() {
    const { subPackages } = this.pagesJson
    let routes = []
    if (!subPackages || subPackages.length === 0) {
      return []
    }
    for (let i = 0; i < subPackages.length; i++) {
      const subPages = subPackages[i].pages
      const root = subPackages[i].root
      const subRoutes = this.getPagesRoutes({ pages: subPages, rootPath: root })
      routes = routes.concat(subRoutes)
    }
    return routes
  }
}

module.exports = PagesJsonConverter