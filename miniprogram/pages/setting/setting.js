// miniprogram/pages/menu/menu.js
const app = getApp()
const style = require("../../unit/setStyle.js")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    theme: app.globalData.theme,
    autoLogined: app.globalData.autoLogined
  },

  //主题选择
  themeChange(e) {
    var theme = e.detail.value
    this.setData({
      theme
    })
    app.globalData.theme = theme
    style.changeStyle(theme, true)
    try {
      wx.setStorageSync('theme', theme)
    } catch (e) {
      console.log(e)
    }
  },

  //自动登录选项
  autoLogin: function(e) {
    var autoLogined = e.detail.value
    var that = this
    if (autoLogined) {
      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            that.setData({
              autoLogined
            })
            app.globalData.autoLogined = autoLogined
            try {
              wx.setStorageSync('autoLogined', autoLogined)
            } catch (e) {
              console.log(e)
            }
          } else {
            wx.showModal({
              title: '',
              content: '您尚未授权登录，请登录后再操作',
              success(res) {
                if (res.confirm) {
                  that.setData({
                    is_sidebar: true
                  })
                } else if (res.cancel) {}
                that.setData({
                  autoLogined: false
                })
              }
            })
          }
        }
      })
    } else {
      that.setData({
        autoLogined
      })
      app.globalData.autoLogined = autoLogined
      try {
        wx.setStorageSync('autoLogined', autoLogined)
      } catch (e) {
        console.log(e)
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    style.changeStyle(app.globalData.theme, false)
    this.setData({
      theme: app.globalData.theme,
      autoLogined: app.globalData.autoLogined
    })
  },
})