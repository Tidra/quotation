// miniprogram/pages/details/details.js
import uCharts from '../../unit/u-charts.js';
var db = require("../../unit/db.js");
const app = getApp()

//定义记录初始屏幕宽度比例，便于初始化
var _self;
var canvaColumn = null;
var canvaLine = null;
var canvaCandle = null;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    itemCount: 20,
    count: 20,
    is_hide: 'none',
    select_id: 'dk',
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
    _self = this;
    this.cWidth = wx.getSystemInfoSync().windowWidth;
    this.cHeight = 250;

    this.dataLoad(options.code, 'day', 30);

    // 具体数据、屏幕宽度
    this.setData({
      code: options.code,
    });
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
            console.log('用户点击确定');
          } else if (res.cancel) {
            console.log('用户点击取消');
          }
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
        code: that.data.code,
        name: that.data.value.name,
        date: that.data.value.date
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        this.setData({
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
    if (e.currentTarget.id == "fd") {
      this.dataLoad(this.data.code, 'day', 5);
    } else if (e.currentTarget.id == "dk") {
      this.dataLoad(this.data.code, 'day', 30);
    } else if (e.currentTarget.id == "wk") {
      this.dataLoad(this.data.code, 'week', 5 * 30);
    } else if (e.currentTarget.id == "mk") {
      this.dataLoad(this.data.code, 'month', 31 * 30);
    } else if (e.currentTarget.id == "mh") {
      this.dataLoad(this.data.code, 'day', 5);
    }
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
    if (parseInt(parseInt(num / 100000000) / 10000) > 0) {
      if (type == 'type') {
        return [1000000000000, '万亿']
      }
      var newNum = (num / 1000000000000).toFixed(2) + '万亿';
      return newNum;
    }
    if (parseInt(num / 100000000) > 0) {
      if (type == 'type') {
        return [100000000, '亿']
      }
      var newNum = (num / 100000000).toFixed(2) + '亿';
      return newNum;
    }
    if (parseInt(num / 10000) > 0) {
      if (type == 'type') {
        return [10000, '万']
      }
      var newNum = (num / 10000).toFixed(2) + '万';
      return newNum;
    }
    if (type == 'type') {
      return [1, '']
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
    var newData = {};
    var typeFunc = function(date) {
      return date
    };
    if (type == "week") {
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

    return {
      categories: (newData => {
        var arr = [];
        for (var i in newData) {
          arr.push(i);
        }
        return arr;
      })(newData),
      seriesCandle: [{
        name: data[0].name,
        data: (newData => {
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
        })(newData)
      }],
      seriesColumn: [{
        name: data[0].name,
        data: (newData => {
          var arr = [];
          for (var i in newData) {
            var e = newData[i];
            var volume = this.mathOS(e.volume, 'sum');
            arr.push(volume);
          }
          return arr;
        })(newData)
      }]
    };
  },


  //数据获取
  dataLoad: function(code, date_unit, num) {
    // 显示加载图标
    wx.showLoading({
      title: '玩命加载中',
    })
    db.getData.selectByCode(code, date_unit, num).then(res => {
        //请求成功
        var changeUnit = this.changeUnit;
        var value = {
          code: res.data[0].code,
          name: res.data[0].name,
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
          sell: '23.85万',
          buy: '25.58万',
          totalMarketCapitaliza: changeUnit(res.data[0].totalMarketCapitalization),
          pe: 777.85,
          amplitude: ((res.data[0].maxPrice - res.data[0].minPrice) / res.data[0].previousClose).toFixed(2),
          marketCapitalization: changeUnit(res.data[0].marketCapitalization)
        };
        var all_value = res.data.reverse();

        all_value = this.getTypeData(all_value, date_unit);
        console.log(all_value)
        // 隐藏加载框
        wx.hideLoading()
        this.chartsItemCount = all_value.categories.length;

        this.setData({
          value,
          all_value,
          itemCount: all_value.categories.length,
          count: all_value.categories.length
        });
        _self.showCandle("canvasCandle", all_value);
        _self.showColumn("canvasColumn", all_value);
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
    }, 5000)
  },

  /**
   * 柱形图
   */
  showColumn(canvasId, chartData) {
    canvaColumn = new uCharts({
      $this: _self,
      canvasId: canvasId,
      type: 'column',
      legend: false,
      fontSize: 11,
      background: '#0e0e0e',
      pixelRatio: 1,
      animation: true,
      enableScroll: true,
      categories: chartData.categories,
      series: chartData.seriesColumn,
      xAxis: {
        disable: true,
        disableGrid: true,
        itemCount: chartData.categories.length,
        scrollShow: true,
        scrollAlign: 'right',
        labelCount: 4,
      },
      yAxis: {
        //disabled:true
        // gridType: 'dash',
        disableGrid: true,
        showTitle: true,
        splitNumber: 3,
        data: [{
          title: '成交量(万手)',
          format: (val) => {
            var val = val / 10000;
            if (val < 100) {
              return val.toFixed(2);
            }
            return val.toFixed(0)
          }
        }]
      },
      dataLabel: false,
      width: _self.cWidth,
      height: _self.cHeight / 1.5,
      extra: {
        column: {
          type: 'group',
          width: _self.cWidth / chartData.categories.length
        },
        tooltip: {
          activeBgColor: '#fff'
        }
      }
    });

  },
  touchEndColumn(e) {
    if (e.touches.length == 0) {
      canvaColumn.scrollEnd(e);
      canvaCandle.scrollEnd(e);
      canvaColumn.showToolTip(e, {
        format: function(item, category) {
          if (typeof item.data === 'object') {
            return category + ' ' + item.name + ':' + item.data.value
          } else {
            return category + ' ' + item.name + ':' + item.data
          }
        }
      });
    } else {
      this.setData({
        count: this.chartsItemCount
      })
    }
  },

  /**
   *  K线图
   */
  showCandle(canvasId, chartData) {
    canvaCandle = new uCharts({
      $this: _self,
      canvasId: canvasId,
      type: 'candle',
      fontSize: 11,
      legend: true,
      background: '#0e0e0e',
      pixelRatio: 1,
      categories: chartData.categories,
      series: chartData.seriesCandle,
      animation: true,
      enableScroll: true,
      xAxis: {
        disableGrid: true,
        itemCount: chartData.categories.length,
        // scrollShow: true,
        scrollAlign: 'right',
        labelCount: 4,
      },
      yAxis: {
        //disabled:true
        gridType: 'dash',
        splitNumber: 5,
        format: (val) => {
          if (val < 100) {
            return val.toFixed(2)
          } else if (val < 1000) {
            return val.toFixed(1)
          }
          return val.toFixed(0)
        }
      },
      width: _self.cWidth,
      height: _self.cHeight,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        candle: {
          color: {
            upLine: '#ff0000',
            upFill: '#ff0000',
            downLine: '#00ff00',
            downFill: '#00ff00'
          },
          average: {
            show: true,
            name: ['MA5', 'MA10', 'MA20'],
            day: [5, 10, 20],
            color: ['#1890ff', '#2fc25b', '#facc14']
          }
        },
        tooltip: {
          bgColor: '#000000',
          bgOpacity: 0.7,
          gridType: 'dash',
          dashLength: 5,
          gridColor: '#1890ff',
          fontColor: '#FFFFFF',
          horizentalLine: true,
          xAxisLabel: true,
          yAxisLabel: true,
          labelBgColor: '#DFE8FF',
          labelBgOpacity: 0.95,
          labelAlign: 'left',
          labelFontColor: '#666666'
        }
      },
    });
  },
  touchCandle(e) {
    if (e.touches.length == 1) {
      canvaCandle.scrollStart(e);
      canvaColumn.scrollStart(e);
    } else if (e.touches.length == 2) {
      this.touchNum = Math.floor(Math.abs(e.touches[0].x - e.touches[1].x));
    }
    this.lastMoveTime = Date.now();
  },
  moveCandle(e) {
    let currMoveTime = Date.now();
    let duration = currMoveTime - this.lastMoveTime;
    if (duration < Math.floor(1000 / 60)) return;
    this.lastMoveTime = currMoveTime;
    if (e.touches.length == 1) {
      canvaCandle.scroll(e);
      canvaColumn.scroll(e);
    } else if (e.touches.length == 2) {
      var len = Math.abs(e.touches[0].x - e.touches[1].x);
      if (Math.abs(len - this.touchNum) < 10) return;
      this.chartsItemCount = this.chartsItemCount + Math.floor((this.touchNum - len) / 10);
      if (this.chartsItemCount < 5) {
        this.chartsItemCount = 5;
      } else if (this.chartsItemCount > this.data.itemCount) {
        this.chartsItemCount = this.data.itemCount;
      }
      setTimeout(() => {
        this.zoomCandle(this.chartsItemCount);
      }, 200);
      this.touchNum = len;
    }
  },
  touchEndCandle(e) {
    console.log(e)
    if (e.touches.length == 0) {
      canvaColumn.scrollEnd(e);
      canvaCandle.scrollEnd(e);
      //下面是toolTip事件，如果滚动后不需要显示，可不填写
      canvaCandle.showToolTip(e, {
        format: function(item, category) {
          return category + ' ' + item.name + ':' + item.data
        }
      });
    } else {
      this.setData({
        count: this.chartsItemCount
      })
    }
  },
  changeCount(e) {
    var count = this.data.count;
    if (e.currentTarget.id == 'jia'){
      if(count == this.data.itemCount){
        return;
      }
      count += 1;
    }else{
      if (count == 5) {
        return;
      }
      count -= 1;
    }
    this.setData({
      count
    });
    _self.zoomCandle(count);
  },
  zoomCandle(val) {
    canvaCandle.zoom({
      itemCount: val
    });
    canvaColumn.zoom({
      itemCount: val
    });
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