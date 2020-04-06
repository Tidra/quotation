// miniprogram/pages/details/details.js
var db = require("../../unit/db.js");
var time = require("../../unit/date.js");
import * as echarts from '../../ec-canvas/echarts';
import '../../ec-canvas/darkin';
const app = getApp();

let chart = null;

var upColor = '#ec0000';
var upBorderColor = '#8A0000';
var downColor = '#00da3c';
var downBorderColor = '#008F28';
var globalData = {
  "categoryData": [],
  "values": [],
  "volumes": []
};

function setOption(chart, data, name) {
  var option = {
    dataset: {
      source: data
    },
    legend: {
      top: 30,
      left: 'center',
      data: [name, 'MA5', 'MA10', 'MA20', 'MA30'],
    },
    title: {
      text: '最近' + data.categoryData.length + name[0] + '数据'
    },
    graphic: [{
      type: 'text',
      id: 'text_c',
      bottom: 100,
      left: '2%',
      style: {
        text: '成交量',
        fill: '#fff',
        shadowColor: '#e1e1e1'
      }
    }],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        animation: true,
        type: 'cross'
      }
    },
    toolbox: {
      feature: {
        myTool1: {
          show: true,
          title: '放大图表',
          icon: 'path://M31.258 146.356c0-66.102 54.083-120.185 120.185-120.185h721.114c66.102 0 120.185 54.083 120.185 120.185V867.47c0 66.102-54.083 120.186-120.185 120.186H151.443c-66.102 0-120.185-54.084-120.185-120.186V146.356z m60.093 0V867.47c0 30.047 24.037 60.093 60.092 60.093h721.114c30.046 0 60.092-24.037 60.092-60.093V146.356c0-30.046-24.037-60.093-60.092-60.093H151.443c-36.055 0-60.092 24.037-60.092 60.093z M271.629 506.913c0-18.028 12.018-30.047 30.046-30.047h420.65c18.028 0 30.046 12.019 30.046 30.047s-12.018 30.046-30.046 30.046h-420.65c-18.028 0-30.046-12.018-30.046-30.046z M512 266.542c18.028 0 30.046 12.018 30.046 30.046v420.65c0 18.027-12.018 30.046-30.046 30.046s-30.046-12.019-30.046-30.046v-420.65c0-18.028 12.018-30.046 30.046-30.046z',
          onclick: function() {
            var start = chart._model.option.dataZoom[0].start;
            var end = chart._model.option.dataZoom[0].end;
            var newStart = start < end - 5 ? start + 5 : start;
            var newEnd = end > newStart + 5 ? end - 5 : end;
            chart.dispatchAction({
              type: 'dataZoom',
              dataZoomIndex: [0, 1],
              start: newStart,
              end: newEnd
            });
          }
        },
        myTool2: {
          show: true,
          title: '缩小图表',
          icon: 'path://M904 64c30.9 0 56 25.1 56 56v784c0 30.9-25.1 56-56 56H120c-30.9 0-56-25.1-56-56V120c0-30.9 25.1-56 56-56h784m0-64H120C53.7 0 0 53.7 0 120v784c0 66.3 53.7 120 120 120h784c66.3 0 120-53.7 120-120V120c0-66.3-53.7-120-120-120z M736 480H288c-17.7 0-32 14.3-32 32s14.3 32 32 32h448c17.7 0 32-14.3 32-32s-14.3-32-32-32z',
          onclick: function() {
            var start = chart._model.option.dataZoom[0].start;
            var end = chart._model.option.dataZoom[0].end;
            var newStart = start > 5 ? start - 5 : 0;
            var newEnd = end < 95 ? end + 5 : 100;
            chart.dispatchAction({
              type: 'dataZoom',
              dataZoomIndex: [0, 1],
              start: newStart,
              end: newEnd
            });
          }
        },
        dataZoom: {
          yAxisIndex: false
        },
        restore: {
          show: true
        }
      }
    },
    grid: [{
        // left: '13%',
        top: 75,
        // left: '5%',
        // right: '5%',
        left: '0',
        right: '0',
        bottom: 150
      },
      {
        // left: '13%',
        // left: '5%',
        // right: '5%',
        left: '0',
        right: '0',
        height: 80,
        bottom: 40
      }
    ],
    xAxis: [{
        type: 'category',
        data: data.categoryData,
        scale: true,
        // boundaryGap: false,
        // inverse: true,
        axisLine: {
          onZero: false
        },
        splitLine: {
          show: false
        },
        splitNumber: 20,
        min: 'dataMin',
        max: 'dataMax'
      },
      {
        type: 'category',
        gridIndex: 1,
        data: data.categoryData,
        scale: true,
        // boundaryGap: false,
        position: 'top',
        axisLine: {
          onZero: false
        },
        // axisTick: {show: false},
        splitLine: {
          show: false
        },
        axisLabel: {
          show: false
        },
        splitNumber: 20,
        min: 'dataMin',
        max: 'dataMax',
        axisPointer: {
          type: 'shadow',
        }
      }
    ],
    yAxis: [{
        scale: true,
        splitArea: {
          show: true
        },
        axisLabel: {
          inside: true,
          formatter: '{value}\n'
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
      },
      {
        // name: '成交量',
        // nameLocation: 'center',
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        // splitLine: {show: false}
      }
    ],
    dataZoom: [{
        type: 'inside',
        xAxisIndex: [0, 1],
        start: 0,
        end: 100,
        minValueSpan: 5,
      },
      {
        show: true,
        xAxisIndex: [0, 1],
        type: 'slider',
        bottom: 5,
        start: 0,
        end: 100,
        minValueSpan: 5,
        handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
        handleSize: '105%'
      }
    ],
    visualMap: {
      show: false,
      seriesIndex: 5,
      dimension: 2,
      pieces: [{
        value: 1,
        color: upColor
      }, {
        value: -1,
        color: downColor
      }]
    },
    series: [{
        type: 'candlestick',
        name: name,
        data: data.values,
        itemStyle: {
          color: upColor,
          color0: downColor,
          borderColor: upBorderColor,
          borderColor0: downBorderColor
        },
      },
      {
        name: 'MA5',
        type: 'line',
        data: calculateMA(5, data.values),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'MA10',
        type: 'line',
        data: calculateMA(10, data.values),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'MA20',
        type: 'line',
        data: calculateMA(20, data.values),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'MA30',
        type: 'line',
        data: calculateMA(30, data.values),
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'Volumn',
        type: 'bar',
        data: data.volumes,
        xAxisIndex: 1,
        yAxisIndex: 1,
        large: true,
      },
      {
        name: 'MA5',
        type: 'line',
        data: calculateMA(5, data.volumes),
        xAxisIndex: 1,
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1
        }
      },
      {
        name: 'MA10',
        type: 'line',
        data: calculateMA(10, data.volumes),
        xAxisIndex: 1,
        yAxisIndex: 1,
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 1
        }
      },
    ]
  };

  try {
    chart.setOption(option);
    chart.dispatchAction({
      type: 'dataZoom',
      dataZoomIndex: [0, 1],
      start: 10,
      end: 100
    });
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

  setOption(chart, globalData, '日K')

  return chart;
}

function calculateMA(dayCount, data) {
  var result = [];
  for (var i = 0, len = data.length; i < len; i++) {
    if (i < dayCount) {
      result.push('-');
      continue;
    }
    var sum = 0;
    for (var j = 0; j < dayCount; j++) {
      sum += data[i - j][1];
    }
    result.push((sum / dayCount).toFixed(3));
  }
  return result;
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
    dialogShow: false,
    buttons: [{
      text: '取消'
    }, {
      text: '确定'
    }],
    date: {
      start: '2020-01-02',
      end: '2020-03-01',
      min: '2016-01-01',
      max: '2020-04-02'
    },
    is_hide: 'none',
    select_id: 'dk',
    more_data: false,
    /**
     * code:代码
     * name:名称
     * date:日期
     * current:当前价
     * previousClose:昨收价
     * quoteChange:涨幅 (当前-昨收)/昨收
     * change:涨跌 (当前-昨收)
     * openingPrice:今开盘
     * volume:成交量
     * turnoverRate:换手率
     * maxPrice:最高
     * minPrice:最低
     * turnover:成交额 (买入成交额+卖出成交额)
     * sell:内盘
     * buy:外盘
     * totalMarketCapitaliza:总市值(亿元)
     * pe:市盈率
     * amplitude:振幅 （当日最高点的价格－当日最低点的价格）/前收价
     * marketCapitalization:流通市值
     */
    value: '',
    all_value: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var type = 'other';
    if (options.type == 'hushen')
      type = 'gupiao_data';
    else if (options.type == 'uss')
      type = 'USA_stock_data';
    else if (options.type == 'index')
      type = 'shangzheng_shenzheng_data';
    else
      type = options.type;

    this.dataLoad(type, options.code, 'day', 1, 100);

    if (app.globalData.openid) {
      this.onQuery(options.code, type);
    }

    var date = {
      start: time.getMonths(1),
      end: time.getMonths(0),
      min: time.getYears(3),
      max: time.getYears(0)
    }

    this.setData({
      code: options.code,
      type,
      date
    });
  },

  //显示更多数据
  moreData: function() {
    this.setData({
      more_data: !this.data.more_data
    })
  },

  // 查询是否存在
  onQuery: function(code, type) {
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
  deleteMy: function() {
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
        } else if (res.cancel) {}
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
        type: that.data.type,
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
    if (e.currentTarget.id == "zx") {
      this.setData({
        dialogShow: true
      });
      return;
    }
    if (this.data.select_id == e.currentTarget.id) {
      return;
    }

    if (e.currentTarget.id == "fd") {
      this.dataLoad(this.data.type, this.data.code, 'day', 1, 5);
    } else if (e.currentTarget.id == "dk") {
      this.dataLoad(this.data.type, this.data.code, 'day', 1, 100);
    } else if (e.currentTarget.id == "wk") {
      this.dataLoad(this.data.type, this.data.code, 'week', 1, 5 * 30);
    } else if (e.currentTarget.id == "mk") {
      this.dataLoad(this.data.type, this.data.code, 'month', 1, 31 * 30);
    }

    this.setData({
      select_id: e.currentTarget.id
    });
  },

  // 自选显示框
  tapDialogButton(e) {
    if (e.detail.item.text == '确定') {
      var page = this.data.date.start + '/' + this.data.date.end + '/' + 1;
      this.dataLoad(this.data.type, this.data.code, 'day', page, 40000);
      this.setData({
        select_id: 'zx'
      });
    }
    this.setData({
      dialogShow: false
    })
  },
  // 日期选择
  bindDateChange: function(e) {
    var date = this.data.date;
    date[e.currentTarget.id] = e.detail.value;
    if (e.currentTarget.id == 'start' && date.start > date.end) {
      date.end = date.start;
    }
    this.setData({
      date
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

  //单位转化
  changeUnit: function(num, type) {
    if (num == undefined) {
      return ''
    }
    if (Math.floor(num / 1000000000000) > 0) {
      var newNum = (num / 1000000000000).toFixed(2) + '万亿';
      return newNum;
    }
    if (Math.floor(num / 100000000) > 0) {
      var newNum = (num / 100000000).toFixed(2) + '亿';
      return newNum;
    }
    if (Math.floor(num / 10000) > 0) {
      var newNum = (num / 10000).toFixed(2) + '万';
      return newNum;
    }
    return num
  },

  /**
   * 单位化数据
   */
  mathOS: function(arr, type) {
    var sum = 0;
    var max = arr[0];
    var min = arr[0];
    var frist = arr[0];
    var last;
    for (var i = 0; i < arr.length; i++) {
      last = arr[i];
      if (max < arr[i]) {
        max = arr[i];
      }
      if (min > arr[i]) {
        min = arr[i];
      }
      sum += arr[i];
    }
    if (type == "sum") {
      return sum;
    } else if (type == "max") {
      return max;
    } else if (type == "min") {
      return min;
    } else if (type == "frist") {
      return frist;
    } else if (type == "last") {
      return last;
    }
    return Math.round(sum / arr.length * 100) / 100;
  },
  //各单位
  getTypeData: function(data, type) {
    var name = '日K';
    var newData = {};
    var typeFunc = function(date) {
      return date
    };
    if (type == "week") {
      name = '周K';
      typeFunc = function(date) {
        let d1 = new Date(date);
        let d2 = new Date(date);
        d2.setMonth(0);
        d2.setDate(1);
        let rq = d1 - d2;
        let days = Math.ceil(rq / (24 * 60 * 60 * 1000));
        let num = Math.ceil(days / 7);
        return date.substring(0, 4) + (Array(2).join("0") + num).slice(-2);
      }
    } else if (type == "month") {
      name = '月K';
      typeFunc = function(date) {
        date = date.split("-");
        return date[0] + "-" + date[1];
      }
    }

    for (var i in data) {
      var num = typeFunc(data[i].date);
      if (newData.hasOwnProperty(num)) {
        newData[num].openingPrice.push(data[i].openingPrice);
        newData[num].closingPrice.push(data[i].closingPrice);
        newData[num].maxPrice.push(data[i].maxPrice);
        newData[num].minPrice.push(data[i].minPrice);
        newData[num].volume.push(data[i].volume);
      } else {
        newData[num] = {
          openingPrice: [data[i].openingPrice],
          closingPrice: [data[i].closingPrice],
          maxPrice: [data[i].maxPrice],
          minPrice: [data[i].minPrice],
          volume: [data[i].volume]
        }
      }
    }

    var all_value = {
      categoryData: (newData => {
        var arr = [];
        for (var i in newData) {
          arr.push(i);
        }
        return arr;
      })(newData),
      values: (newData => {
        var arr = [];
        for (var i in newData) {
          var e = newData[i];
          var openingPrice = this.mathOS(e.openingPrice, 'frist');
          var closingPrice = this.mathOS(e.closingPrice, 'last');
          var minPrice = this.mathOS(e.minPrice, 'min');
          var maxPrice = this.mathOS(e.maxPrice, 'max');
          arr.push([openingPrice, closingPrice, minPrice, maxPrice]);
        }
        return arr;
      })(newData),
      volumes: (newData => {
        var arr = [];
        for (var i in newData) {
          var e = newData[i];
          var volume = this.mathOS(e.volume, 'sum');
          var color = this.mathOS(e.openingPrice, 'frist') > this.mathOS(e.closingPrice, 'last') ? -1 : 1;
          arr.push([i, volume, color]);
        }
        return arr;
      })(newData)
    };

    globalData = all_value;
    try {
      setOption(chart, globalData, name);
    } catch (e) {
      console.log(e)
    }

    return all_value;
  },


  //数据获取
  dataLoad: function(type, code, date_unit, page, num) {
    // 显示加载图标
    wx.showLoading({
      title: '玩命加载中',
    })
    db.getData.selectByCode(type, code, date_unit, page, num).then(res => {
        //请求成功
        if (res.data[0] == undefined) {
          wx.showToast({
            title: '没有数据',
            icon: 'none',
            duration: 2000 //持续的时间
          });
          return;
        }
        var changeUnit = this.changeUnit;
        var size = 75;
        var len = (res.data[0].name || res.data[0].fundName).replace(/[\u0391-\uFFE5]/g, "aa").length;
        if (len > 16) {
          size = 55;
        } else if (len > 10) {
          size = 75 - (len - 10) * 4;
        }
        var value = {
          code: res.data[0].code,
          name: res.data[0].name,
          size: size,
          date: res.data[0].date,
          current: res.data[0].closingPrice,
          previousClose: res.data[0].previousClose,
          quoteChange: res.data[0].quoteChange,
          change: res.data[0].change,
          openingPrice: res.data[0].openingPrice,
          volume: changeUnit(res.data[0].volume),
          turnoverRate: res.data[0].turnoverRate,
          maxPrice: res.data[0].maxPrice,
          minPrice: res.data[0].minPrice,
          turnover: changeUnit(res.data[0].turnover),
          totalMarketCapitaliza: changeUnit(res.data[0].totalMarketCapitalization),
          pe: res.data[0].per,
          qrr: res.data[0].qrr,
          pbr: res.data[0].pbr,
          ttm: res.data[0].ttm > 0 ? res.data[0].ttm.toString().replace(/(\d{4})(\d{2})(\d{2})/g, '$1-$2-$3') : null,
          eps: res.data[0].eps ? res.data[0].eps.toFixed(3) : '',
          navps: res.data[0].navps ? res.data[0].navps.toFixed(3) : '',
          amplitude: res.data[0].amplitude || ((res.data[0].maxPrice - res.data[0].minPrice) / res.data[0].previousClose).toFixed(2),
          marketCapitalization: changeUnit(res.data[0].marketCapitalization)
        };
        var all_value = this.getTypeData(res.data.reverse(), date_unit);
        console.log(all_value);
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
  onReady: function() {},

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
    this.dataLoad(this.data.type, this.data.code, 'day', 1, 100);
    this.onQuery(this.data.code, this.data.type);

    this.setData({
      select_id: 'dk'
    });
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
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})