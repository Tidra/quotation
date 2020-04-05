// miniprogram/pages/fund/fund.js
var db = require("../../unit/db.js");
import * as echarts from '../../ec-canvas/echarts';
import '../../ec-canvas/darkin';
const app = getApp();

let chart = null;
var globalData = {
  "categoryData": [],
  "values": []
};

function setOption(chart, data, name) {
  var option = {
    dataset: {
      source: data
    },
    // legend: {
    //   top: 30,
    //   left: 'center',
    //   data: [name, 'MA5', 'MA10', 'MA20', 'MA30'],
    // },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        animation: false,
        type: 'cross'
      }
    },
    grid: [{
      top: 15,
      bottom: 25,
      right: '5%'
    }],
    xAxis: [{
      type: 'category',
      data: data.categoryData,
      scale: true,
      axisLine: {
        onZero: false
      },
      splitLine: {
        show: false
      },
      splitNumber: 20,
      min: 'dataMin',
      max: 'dataMax'
    }],
    yAxis: [{
      scale: true,
    }],
    series: [{
      type: 'line',
      name: name,
      symbol: 'none',
      data: data.values,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
          offset: 0,
          color: 'rgba(128, 128, 128, 0.5)'
        }, {
          offset: 1,
          color: 'rgba(128, 128, 128, 0)'
        }])
      },
    }]
  };

  try {
    chart.setOption(option);
  } catch (e) {
    console.log(e);
  }
}

function initChart(canvas, width, height, dpr) {
  var that = this;
  chart = echarts.init(canvas, 'darkin', {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart);

  setOption(chart, globalData, '增长率');

  return chart;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ec: {
      onInit: initChart
    },
    addOrDelete: true,
    is_hide: 'none',
    select_id: 'growthRate',
    value: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.dataLoad('jijin_data', options.code, 'day', 100);
    if (app.globalData.openid) {
      this.onQuery(options.code, 'jijin_data');
    }

    this.setData({
      code: options.code
    });
  },

  // 查询是否存在
  onQuery: function (code, type) {
    const db = wx.cloud.database()
    // 查询当前用户的 counters
    db.collection('joinquant').where({
      _openid: app.globalData.openid,
      code: code,
      type: type
    }).get({
      success: res => {
        console.log('[数据库] [查询记录] 成功: ', res)
        if (res.data.length != 0) {
          this.setData({
            addOrDelete: false,
            _id: res.data[0]._id
          })
        }
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

  // 删除自选
  deleteMy: function () {
    var that = this;
    wx.showModal({
      title: '',
      content: '是否删除该自选股票',
      success(res) {
        if (res.confirm) {
          const db = wx.cloud.database()
          db.collection('joinquant').doc(that.data._id).remove({
            success: res => {
              that.setData({
                addOrDelete: true
              })
              wx.showToast({
                title: '删除成功',
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
        } else if (res.cancel) { }
      }
    })
  },

  //加入自选
  addMy: function() {
    var that = this;
    if (app.globalData.openid) {
      wx.showModal({
        title: '',
        content: '是否确定加入到自选股票',
        success(res) {
          if (res.confirm) {
            that.onAdd();
          } else if (res.cancel) {}
        }
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '您尚未登录',
      })
    }
  },
  //加入到数据库
  onAdd: function() {
    const db = wx.cloud.database();
    var that = this;
    db.collection('joinquant').add({
      data: {
        type: 'jijin_data',
        code: that.data.code,
        name: that.data.value.name,
        date: that.data.value.date
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        this.setData({
          _id: res._id,
          addOrDelete: false,
          counterId: res._id,
        })
        wx.showToast({
          title: '添加成功',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '添加失败'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  },

  // 选择显示图表
  select: function(e) {
    if (this.data.select_id == e.currentTarget.id) {
      return;
    }
    this.setData({
      select_id: e.currentTarget.id
    });
    globalData.values = this.data.all_value[e.currentTarget.id];
    setOption(chart, globalData, e.currentTarget.id);
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

  //数据获取
  dataLoad: function(type, code, date_unit, num) {
    // 显示加载图标
    wx.showLoading({
      title: '玩命加载中',
    })
    db.getData.selectByCode(type, code, date_unit, 1, num).then(res => {
        //请求成功
        var size = 75;
        var len = (res.data[0].name || res.data[0].fundName).replace(/[\u0391-\uFFE5]/g, "aa").length;
        if (len > 16) {
          size = 55;
        } else if (len > 10) {
          size = 75 - (len - 10) * 4;
        }
        var value = {
          name: res.data[0].fundName,
          code: res.data[0].code,
          size: size,
          date: res.data[0].date,
          unitNetWorth: res.data[0].unitNetWorth,
          cumulativeNetWorth: res.data[0].cumulativeNetWorth,
          growthRate: res.data[0].growthRate.toFixed(4)
        }

        var all_value = {
          date: [],
          unitNetWorth: [],
          cumulativeNetWorth: [],
          growthRate: []
        };
        len = res.data.length;
        for (var i in res.data) {
          all_value.date.push(res.data[len - i - 1].date);
          all_value.unitNetWorth.push(res.data[len - i - 1].unitNetWorth);
          all_value.cumulativeNetWorth.push(res.data[len - i - 1].cumulativeNetWorth);
          all_value.growthRate.push(res.data[len - i - 1].growthRate.toFixed(4));
        }
        console.log(all_value);
        globalData = {
          "categoryData": all_value.date,
          "values": all_value.growthRate
        }

        setOption(chart, globalData, '增长率');
        console.log(globalData)
        this.setData({
          value,
          all_value
        });
        // 隐藏加载框
        wx.hideLoading();
      })
      .catch(err => {
        //请求失败
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 2000 //持续的时间
        })
      });
    setTimeout(function() {
      wx.hideLoading()
    }, 10000)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.dataLoad('jijin_data', this.data.code, 'day', 100);
    this.onQuery(this.data.code, 'jijin_data');

    this.setData({
      select_id: 'growthRate'
    });
    setTimeout(function() {
      // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
    }, 500)
  }
})