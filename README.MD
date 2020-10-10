## 依赖
uniapp

## 用途

为解决小程序无法异步阻塞第一个页面的渲染，因此若有异步onLauch场景，则需要先设置一个空白页面去等待异步完成再跳转实际页面。
为方便一些schema跳转非首页路由，因此该空白页面可以使用此工具获得全局变量ROUTES_LIST，获取该项目page.json里所有的路由配置，包括path和跳转方法。

## 用法
### 接入
``` js
const webpack = require('webpack')
const PagesJsonConverter = require('./PagesJsonConverter')
const findPages = new PagesJsonConverter({
  methodsName: { isTabBar: 'switchTab', noTabBar: 'redirectTo' },
})
module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        ROUTES_LIST: JSON.stringify(findPages.routes),
      }),
    ],
  },
}
```
### 使用
```js
export default {
  data () {
    return {
      routerList:Object.freeze(ROUTES_LIST)
    }
  }
} 
```

## 属性说明
1. `methodsName`: 小程序的路由分成tabBar页面和非tabBar页面,可以定制两种情况跳转的函数