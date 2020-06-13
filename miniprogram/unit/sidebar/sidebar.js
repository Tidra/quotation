// unit/sidebar/sidebar.js
const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    itemName: {
      type: String,
      value: 'hq'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    theme: 'light',
    avatarUrl: '/icon/user-unlogin.png',
    nickName: '点击登录'
  },

  pageLifetimes: {
    show: function() {
      var theme = app.globalData.theme
      if (app.globalData.autoLogined == true && !app.globalData.avatarUrl && !app.globalData.nickName) {
        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  console.log(res)
                  this.onGetOpenid(true);
                  app.globalData.avatarUrl = res.userInfo.avatarUrl
                  app.globalData.nickName = res.userInfo.nickName
                  app.globalData.logged = true

                  this.setData({
                    avatarUrl: res.userInfo.avatarUrl,
                    nickName: res.userInfo.nickName
                  })
                }
              })
            }
          }
        })
      }
      var avatarUrl = app.globalData.avatarUrl ? app.globalData.avatarUrl : '/icon/user-unlogin.png'
      var nickName = app.globalData.nickName ? app.globalData.nickName : '点击登录'
      this.setData({
        theme,
        avatarUrl,
        nickName
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //行情页
    showHq: function() {
      wx.redirectTo({
        url: '/pages/index/index',
      })
    },

    //显示更多
    showMore: function() {
      var that = this;
      if (app.globalData.logged) {
        that.closeAll();
        wx.redirectTo({
          url: '/pages/user/user',
        })
      } else {
        //登录提示
        wx.showModal({
          title: '',
          content: '您尚未登录，请登录后再操作',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定');
            } else if (res.cancel) {
              that.closeAll();
              console.log('用户点击取消');
            }
          }
        })
      }
    },

    //跳转到设置页
    showSet: function() {
      wx.navigateTo({
        url: '/pages/setting/setting',
      })
    },

    //关闭所有
    closeAll: function() {
      this.setData({
        show: false
      })
    },

    onGetUserInfo: function(e) {
      if (!app.globalData.logged && e.detail.userInfo) {
        app.globalData.logged = true
        app.globalData.avatarUrl = e.detail.userInfo.avatarUrl
        app.globalData.nickName = e.detail.userInfo.nickName
        this.setData({
          avatarUrl: e.detail.userInfo.avatarUrl,
          nickName: e.detail.userInfo.nickName
        });
        this.onGetOpenid();
      }
    },

    onGetOpenid: function(reset) {
      // 调用云函数
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('[云函数] [login] user openid: ', res.result.openid);
          app.globalData.openid = res.result.openid;
          if (!reset) {
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 2000 //持续的时间
            });
          }
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
        }
      })
    },
  }
})