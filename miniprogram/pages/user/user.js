// miniprogram/pages/user/user.js
var db = require("../../unit/db.js");
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    sort_by: 'comprehensive',
    sort_icon: ['up-down', 'up-down', 'up-down'],
    is_hide: 'none',
    select_id: 'gupiao',
    value: {
      gupiao: [],
      jijin: []
    },
  },

  //跳到主页
  toHome: function() {
    wx.navigateBack({
      delta: 2
    })
  },

  // 显示搜索框
  seachIs: function() {
    var is_hide = 'none';
    if (this.data.is_hide == 'none') {
      is_hide = 'flex';
    }
    this.setData({
      is_hide: is_hide,
    })
  },

  seach: function(e) {
    this.seachIs();
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

  // 选择显示
  select: function(e) {
    this.setData({
      select_id: e.currentTarget.id,
      sort_by: 'comprehensive',
      sort_icon: ['up-down', 'up-down', 'up-down'],
      page: 1
    })
    this.orderSort(e.currentTarget.id, 'comprehensive');
  },

  // 排序
  sort: function(e) {
    console.log(e.currentTarget.id);
    var sort_by = this.data.sort_by;
    var sort_icon = ['up-down', 'up-down', 'up-down'];
    if (e.currentTarget.id == "sort1") {
      if (sort_by == 'comprehensive') {
        return;
      }
      sort_by = 'comprehensive';
    } else if (e.currentTarget.id == "sort2") {
      if (sort_by == 'currentDrop') {
        sort_by = 'currentRise';
        sort_icon[0] = 'up';
      } else {
        sort_by = 'currentDrop';
        sort_icon[0] = 'down';
      }
    } else if (e.currentTarget.id == "sort3") {
      if (sort_by == 'quoteChangeDrop') {
        sort_by = 'quoteChangeRise';
        sort_icon[1] = 'up';
      } else {
        sort_by = 'quoteChangeDrop';
        sort_icon[1] = 'down';
      }
    } else {
      if (sort_by == 'changeDrop') {
        sort_by = 'changeRise';
        sort_icon[2] = 'up';
      } else {
        sort_by = 'changeDrop';
        sort_icon[2] = 'down';
      }
    }
    this.setData({
      sort_by,
      sort_icon,
      page: 1,
    });
    this.orderSort(this.data.select_id, sort_by)
  },

  orderSort: function(group, sort_by) {
    var value = this.data.value;
    var order = sort_by.slice(-4);
    sort_by = sort_by.slice(0, -4);
    if (order == 'Drop') {
      value[group].sort((a, b) => {
        return b[sort_by] - a[sort_by];
      });
    } else if (order == 'Rise') {
      value[group].sort((a, b) => {
        return a[sort_by] - b[sort_by];
      });
    } else {
      value[group].sort((a, b) => {
        return a.code.localeCompare(b.code);
      });
    }
    this.setData({
      value
    });
  },

  //触底添加数据
  // bottomReLoad: function() {
  //   this.orderSort(this.data.select_id, this.data.sort_by);
  // },

  //查询自选
  onQuery: function() {
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('joinquant').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        this.setData({
          queryResult: res.data,
          sort_by: 'comprehensive',
          sort_icon: ['up-down', 'up-down', 'up-down'],
        })
        console.log('[数据库] [查询记录] 成功: ', res)
        this.selectData()
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    })
  },

  //查询单个数据
  selectData: function() {
    this.setData({
      value: {
        gupiao: [],
        jijin: []
      }
    })
    var type = 'gupiao_data';
    var queryResult = this.data.queryResult;
    for (var i in queryResult) {
      db.getData.selectByCode(type, queryResult[i].code, 'day', '1').then(res => {
          //请求成功
          var data = {
            code: res.data[0].code,
            name: res.data[0].name,
            current: res.data[0].closingPrice,
            previousClose: res.data[0].previousClose,
            quoteChange: res.data[0].quoteChange,
            change: res.data[0].change
          };
          var value = this.data.value;
          value.gupiao.push(data);
          this.setData({
            value
          })
        })
        .catch(err => {
          //请求失败
          value.gupiao.push(queryResult[0])
          wx.showToast({
            title: queryResult[0].name + '获取错误',
            icon: 'none'
          })
        });
    }
  },

  onGetOpenid: function() {
    var that = this;
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid);
        app.globalData.openid = res.result.openid;
        that.setData({
          openid: res.result.openid
        });
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      winHeight: wx.getSystemInfoSync().windowHeight - 123
    })
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    } else {
      this.onGetOpenid()
    }
    this.onQuery()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

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
    this.onQuery()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})