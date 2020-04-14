// miniprogram/pages/index/index.js
var db = require('../../unit/db.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    lock: false,
    avatarUrl: '../../icon/user-unlogin.png',
    nickName: '点击登录',
    logged: false,
    showLoading: false,
    is_seach: false,
    is_sidebar: false,
    select_id: 'hushen',
    select_index: '上证',
    select_fund: '国内',
    sort_by: 'comprehensive',
    sort_icon: ['up-down', 'up-down', 'up-down'],
    page: 1,
    /**
     * code:代码
     * name:名称
     * current:当前价
     * previousClose:昨收价
     * quoteChange:涨幅 (当前-昨收)/昨收
     * change:涨跌 (当前-昨收)
     */
    value_index: {
      hushen: [{
        code: '000001',
        name: '上证指数',
        current: '-',
        previousClose: '-',
        quoteChange: '-',
        change: '-'
      }, {
        code: '000906',
        name: '中证800',
        current: '-',
        quoteChange: '-',
        change: '-'
      }, {
        code: '399004',
        name: '深证100R',
        current: '-',
        quoteChange: '-',
        change: '-'
      }, {
        code: '399005',
        name: '中小板指',
        current: '-',
        quoteChange: '-',
        change: '-'
      }],
      uss: [],
      others: []
    },
    value: {
      hushen: [],
      uss: [],
      fund: [],
      index: [],
      others: []
    }
  },

  //去详细页
  toDetail: function(e) {
    if (this.data.lock) {
      //开锁
      setTimeout(() => {
        this.setData({
          lock: false
        });
      }, 50);
    } else {
      if (this.data.select_id == 'fund') {
        wx.navigateTo({
          url: '/pages/fund/fund?code=' + e.currentTarget.id + '&type=' + this.data.select_id,
        })
      } else {
        wx.navigateTo({
          url: '/pages/details/details?code=' + e.currentTarget.id + '&type=' + this.data.select_id,
        })
      }
    }
  },

  //显示添加自选按钮
  showAddOption: function() {
    this.setData({
      lock: true
    });
    console.log('aaa')
  },

  // 排序
  sort: function(e) {
    console.log(e.currentTarget.id);
    var id = e.currentTarget.id;
    var arr = ['closingPrice', 'quoteChange', 'change'];
    if (this.data.select_id == 'fund' && this.data.select_fund == '国内')
      arr = ['unitNetWorth', 'cumulativeNetWorth', 'growthRate'];
    else if (this.data.select_id == 'fund' && this.data.select_fund == '国外')
      arr = ['closingPrice', 'change', 'growthRate'];
    var i = arr.indexOf(id);
    var sort_by = this.data.sort_by;
    var sort_icon = ['up-down', 'up-down', 'up-down'];
    if (id == "comprehensive") {
      if (sort_by == id) {
        return;
      }
      sort_by = id;
    } else {
      if (sort_by == id + 'Drop') {
        console.log(sort_by)
        sort_by = id + 'Rise';
        sort_icon[i] = 'up';
      } else {
        sort_by = id + 'Drop';
        sort_icon[i] = 'down';
      }
    };
    this.setData({
      sort_by,
      sort_icon,
      page: 1,
      reset_scroll: 0
    });
    if (this.data.select_id == 'index') {
      this.dataLoad(this.data.select_id, this.data.sort_by, 1, this.data.select_index);
    } else {
      this.dataLoad(this.data.select_id, sort_by, 1);
    }
  },

  // 指数选择显示
  selectIndex: function(e) {
    this.setData({
      select_index: e.currentTarget.id,
      reset_scroll: 0
    });
    this.dataLoad(this.data.select_id, 'comprehensive', 1, e.currentTarget.id);
  },

  // 基金显示
  selectFund: function(e) {
    this.setData({
      select_fund: e.currentTarget.id,
      reset_scroll: 0
    });
    this.dataLoad(this.data.select_id, 'comprehensive', 1);
  },

  // 选择显示
  select: function(e) {
    this.setData({
      select_id: e.currentTarget.id,
      sort_by: 'comprehensive',
      sort_icon: ['up-down', 'up-down', 'up-down'],
      page: 1,
      reset_scroll: 0
    })
    if (e.currentTarget.id == 'index') {
      this.dataLoad(e.currentTarget.id, 'comprehensive', 1, this.data.select_index);
      return;
    }
    this.dataLoad(e.currentTarget.id, 'comprehensive', 1)
    this.loadIndex(e.currentTarget.id);
  },

  // 显示搜索框
  showSeach: function() {
    this.setData({
      is_seach: true
    })
  },

  //显示侧边栏
  showSidebar: function() {
    this.setData({
      is_sidebar: true
    })
  },

  //显示更多
  showMore: function() {
    var that = this;
    if (this.data.logged) {
      that.closeAll();
      wx.navigateTo({
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

  //关闭所有
  closeAll: function() {
    this.setData({
      is_sidebar: false,
      is_seach: false
    })
  },

  seach: function(e) {
    this.closeAll();
    var seach_value = "";
    if (typeof(e.detail.value) == 'string') {
      seach_value = e.detail.value;
    } else {
      seach_value = e.detail.value.seach_value;
    }
    wx.navigateTo({
      url: '/pages/seach/seach?seach_value=' + seach_value,
    })
  },

  //数据获取
  dataLoad: function(type, order, page, other) {
    this.setData({
      showLoading: true
    })
    if (page == 'max1') {
      return;
    }
    // 显示加载图标
    // wx.showLoading({
    //   title: '玩命加载中',
    // })
    if (other == undefined)
      other = '';

    var ttype = 'other';
    if (type == 'hushen')
      ttype = 'gupiao_data';
    else if (type == 'uss')
      ttype = 'USA_stock_data';
    else if (type == 'fund' && this.data.select_fund == '国内')
      ttype = 'jijin_data';
    else if (type == 'fund' && this.data.select_fund == '国外')
      ttype = 'USA_fund_data';
    else if (type == 'index')
      ttype = 'shangzheng_shenzheng_data';

    db.getData.selectAll(ttype, order, page, other).then(res => {
        //请求成功
        console.log(res, typeof(res.data))
        var value = this.data.value;
        var newValue;
        if (ttype == 'jijin_data') {
          newValue = res.data.map(function(e) {
            return {
              code: e.code,
              name: e.fundName,
              unitNetWorth: e.unitNetWorth.toFixed(3),
              cumulativeNetWorth: e.cumulativeNetWorth.toFixed(3),
              growthRate: e.growthRate.toFixed(2)
            }
          });
        } else if (ttype == 'USA_fund_data'){
          newValue = res.data.map(function (e) {
            return {
              code: e.code,
              name: e.fundName,
              closingPrice: e.closingPrice,
              change: e.change,
              growthRate: e.growthRate.toFixed(2)
            }
          });
        } else {
          newValue = res.data.map(function(e) {
            return {
              code: e.code,
              name: e.name,
              current: e.closingPrice,
              previousClose: e.previousClose,
              quoteChange: e.quoteChange,
              change: e.change
            }
          });
        }
        if (page == 1) {
          value[type] = newValue;
        } else {
          value[type] = value[type].concat(newValue);
        }
        if (newValue.length == 0) {
          page = 'max'
        }

        // 隐藏加载框
        // wx.hideLoading();

        this.setData({
          value,
          page,
          showLoading: false
        });
      })
      .catch(err => {
        //请求失败
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 2000 //持续的时间
        });
        that.setData({
          showLoading: false
        })
      });
    // setTimeout(function() {
    //   wx.hideLoading()
    // }, 5000)
  },

  //指数栏加载
  loadIndex: function(type) {
    var value_index = this.data.value_index;
    value_index[type] = [];
    this.setData({
      value_index
    });

    var code = [];
    if (type == 'hushen') {
      code = ['000001', '000906', '399004', '399005'];
    }
    for (var i in code) {
      db.getData.selectByCode('shangzheng_shenzheng_data', code[i], 'day', 1, 1).then(res => {
        var value = {
          code: res.data[0].code,
          name: res.data[0].name,
          current: res.data[0].closingPrice,
          change: res.data[0].change,
          quoteChange: res.data[0].quoteChange
        }
        value_index = this.data.value_index;
        value_index[type].push(value);
        this.setData({
          value_index
        });
      }).catch(err => {
        //请求失败
      });
    }
  },

  //触底添加数据
  bottomReLoad: function() {
    if (this.data.select_id == 'index') {
      this.dataLoad(this.data.select_id, this.data.sort_by, this.data.page + 1, this.data.select_index);
    } else {
      this.dataLoad(this.data.select_id, this.data.sort_by, this.data.page + 1);
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.dataLoad('hushen', 'comprehensive', 1);
    this.loadIndex('hushen');
    this.setData({
      winHeight: wx.getSystemInfoSync().windowHeight - 196
    })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        nickName: e.detail.userInfo.nickName
      });
      this.onGetOpenid();
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid);
        app.globalData.openid = res.result.openid;
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000 //持续的时间
        });
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    if (this.data.select_id == 'index') {
      this.dataLoad(this.data.select_id, this.data.sort_by, 1, this.data.select_index);
    } else {
      this.loadIndex(this.data.select_id);
      this.dataLoad(this.data.select_id, this.data.sort_by, 1);
    }
    setTimeout(function() {
      // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
    }, 500)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})