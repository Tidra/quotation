// miniprogram/pages/user/user.js
var db = require("../../unit/db.js")
const app = getApp()
const style = require("../../unit/setStyle.js")
var queryResult = []

Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: 'light',
    openid: '',
    sort_by: 'comprehensive',
    sort_icon: ['up-down', 'up-down', 'up-down'],
    is_hide: false,
    select_id: 'gupiao_data',
    value: {},
  },

  //跳到主页
  toSide: function() {
    this.setData({
      is_sidebar: true
    })
  },

  // 显示搜索框
  seachIs: function() {
    this.setData({
      is_hide: true,
    })
  },

  // 选择显示
  select: function(e) {
    this.setData({
      select_id: e.currentTarget.id,
      sort_by: 'comprehensive',
      sort_icon: ['up-down', 'up-down', 'up-down'],
      reset_scroll: 0
    })
    this.orderSort(e.currentTarget.id, 'comprehensive')
  },

  // 排序
  sort: function(e) {
    // console.log(e.currentTarget.id)
    var id = e.currentTarget.id
    var arr = ['closingPrice', 'quoteChange', 'change']
    if (this.data.select_id == 'jijin_data')
      arr = ['unitNetWorth', 'cumulativeNetWorth', 'growthRate']
    var i = arr.indexOf(id)
    var sort_by = this.data.sort_by
    var sort_icon = ['up-down', 'up-down', 'up-down']
    if (id == "comprehensive") {
      if (sort_by == id) {
        return
      }
      sort_by = id
    } else {
      if (sort_by == id + 'Drop') {
        // console.log(sort_by)
        sort_by = id + 'Rise'
        sort_icon[i] = 'up'
      } else {
        sort_by = id + 'Drop'
        sort_icon[i] = 'down'
      }
    }
    this.setData({
      sort_by,
      sort_icon
    })
    this.orderSort(this.data.select_id, sort_by)
  },

  orderSort: function(group, sort_by) {
    var value = this.data.value
    if (!value[group]) {
      return
    }
    var order = sort_by.slice(-4)
    sort_by = sort_by.slice(0, -4)
    if (order == 'Drop') {
      value[group].sort((a, b) => {
        return b[sort_by] - a[sort_by]
      })
    } else if (order == 'Rise') {
      value[group].sort((a, b) => {
        return a[sort_by] - b[sort_by]
      })
    } else {
      value[group].sort((a, b) => {
        return a.code.localeCompare(b.code)
      })
    }
    this.setData({
      value,
      reset_scroll: 0
    })
  },

  //去详细页
  toDetail: function(e) {
    if (this.data.lock) {
      //开锁
      setTimeout(() => {
        this.setData({
          lock: false
        })
      }, 50)
    } else {
      if (this.data.select_id == 'jijin_data' || this.data.select_id == 'USA_fund_data') {
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

  // 长按删除
  showAddOption: function(e) {
    this.setData({
      lock: true
    })
    var that = this
    wx.showModal({
      title: '',
      content: '是否删除自选股票',
      success(res) {
        if (res.confirm) {
          that.onDelete(e.currentTarget.id)
        } else if (res.cancel) {}
      }
    })
  },
  // 删除数据库数据
  onDelete: function(id) {
    var _id
    var value = this.data.value
    var type = this.data.select_id
    for (var i in queryResult) {
      if (queryResult[i].code == id && queryResult[i].type == type) {
        _id = queryResult[i]._id
        queryResult.splice(i, 1)
        break
      }
    }
    for (var i in value[type]) {
      if (value[type][i].code == id) {
        value[type].splice(i, 1)
        break
      }
    }
    if (_id) {
      const db = wx.cloud.database()
      db.collection('joinquant').doc(_id).remove({
        success: res => {
          wx.showToast({
            title: '删除成功',
          })
          this.setData({
            value,
          })
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '删除失败',
          })
          console.error('[数据库] [删除记录] 失败：', err)
        }
      })
    } else {
      wx.showToast({
        title: '错误股票数据，请重试',
      })
    }
  },

  //查询自选
  onQuery: function() {
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('joinquant').where({
      _openid: this.data.openid
    }).count().then(countResult => {
      const total = countResult.total
      // 计算需分几次取
      const batchTimes = Math.ceil(total / 20)
      // 承载所有读操作的 promise 的数组
      for (let i = 0; i < batchTimes; i++) {
        db.collection('joinquant').where({
          _openid: this.data.openid
        }).skip(i * 20).limit(20).get().then(promise => {
          // console.log(promise)
          queryResult = queryResult.concat(promise.data)
          if (i == 0) {
            this.setData({
              value: {}
            })
          }
          this.selectData(promise.data)
        })
      }

      this.setData({
        sort_by: 'comprehensive',
        sort_icon: ['up-down', 'up-down', 'up-down'],
      })
    }).catch(err => {
      wx.showToast({
        icon: 'none',
        title: '查询记录失败'
      })
    })
  },

  //查询单个数据
  selectData: function(res) {
    var type
    for (var i in res) {
      db.getData.selectByCode(res[i].type, res[i].code, 'day', 1, 1, res[i]).then(res => {
        //请求成功
        var data
        var type = res.data[0].type
        if (type == 'jijin_data') {
          data = {
            code: res.data[0].code,
            name: res.data[0].fundName,
            unitNetWorth: res.data[0].unitNetWorth.toFixed(3),
            cumulativeNetWorth: res.data[0].cumulativeNetWorth.toFixed(3),
            growthRate: res.data[0].growthRate.toFixed(2),
            type: type
          }
        } else if (type == 'USA_fund_data') {
          data = {
            code: res.data[0].code,
            name: res.data[0].fundName,
            closingPrice: res.data[0].closingPrice,
            change: res.data[0].change,
            growthRate: res.data[0].growthRate.toFixed(2),
            type: type
          }
        } else {
          data = {
            code: res.data[0].code,
            name: res.data[0].name,
            closingPrice: res.data[0].closingPrice,
            previousClose: res.data[0].previousClose,
            quoteChange: res.data[0].quoteChange,
            change: res.data[0].change,
            type: type
          }
        }
        var value = this.data.value
        if (value[type] == undefined) {
          value[type] = [data]
        } else {
          value[type].push(data)
        }
        // console.log(value)

        this.setData({
          value
        })
      }).catch((err) => {
        //请求失败
        var value = this.data.value
        if (value[err[1].type] == undefined) {
          value[err[1].type] = [err[1]]
        } else {
          value[err[1].type].push(err[1])
        }

        this.setData({
          value
        })

        wx.showToast({
          title: err[1].name + '获取错误',
          icon: 'none'
        })
      })
    }
  },

  onGetOpenid: function() {
    var that = this
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        that.setData({
          openid: res.result.openid
        })
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000 //持续的时间
        })
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
    style.changeStyle(app.globalData.theme, false)
    this.setData({
      theme: app.globalData.theme,
      winHeight: wx.getSystemInfoSync().windowHeight - 128
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
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (app.globalData.theme != this.data.theme) {
      style.changeStyle(app.globalData.theme, false)
      this.setData({
        theme: app.globalData.theme
      })
    }
  }
})