//app.js
const style = require("./unit/setStyle.js")

App({
  onLaunch: function() {
    //获取缓存
    var theme, autoLogined
    try {
      theme = wx.getStorageSync('theme')
      autoLogined = wx.getStorageSync('autoLogined')
      if (theme && theme == 'dark') {
        style.changeStyle(theme, true)
      } else {
        theme = 'light'
      }
    } catch (e) {
      console.log(e)
      theme = 'light'
    }

    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }

    this.globalData = {
      logged: false,
      theme: theme,
      autoLogined: autoLogined
    }
  }
})