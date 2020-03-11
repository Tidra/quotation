// miniprogram/pages/details/details.js
var wxCharts = require("../../unit/wxcharts.js");
var db = require("../../unit/db.js");
//定义记录初始屏幕宽度比例，便于初始化
var windowW = 0;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_hide: 'none',
    select_id: 'mh',
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

  // 选择显示图表
  select: function(e) {
    this.setData({
      select_id: e.currentTarget.id
    });
    this.dataLoad(this.data.code, 'day', 20);
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
    wx.navigateTo({
      url: '/pages/seach/seach?seach_value=' + e.detail.value.seach_value,
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

  //数据获取
  dataLoad: function(code, date_unit, num) {
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
        var all_value = res.data.map(function(e) {
          return {
            date: e.date,
            current: e.closingPrice,
            previousClose: e.previousClose,
            quoteChange: e.quoteChange,
            change: e.change,
            openingPrice: e.openingPrice,
            volume: e.volume,
            turnoverRate: e.turnoverRate,
            maxPrice: e.maxPrice,
            minPrice: e.minPrice,
            turnover: e.turnover
          }
        });
        all_value = all_value.sort(function(a, b) {
          if (a.date < b.date) {
            return -1
          } else if (a.date > b.date) {
            return 1
          } else {
            return 0
          }
        });
        console.log(all_value)
        this.setData({
          value,
          all_value
        });
        this.createLine(all_value);
      })
      .catch(err => {
        //请求失败
      });
  },

  //绘图
  createLine: function(value) {
    var type = this.changeUnit(value[0].turnover, 'type');
    //lineCanvas
    new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: value.map(function(e) {
        return e.date
      }),
      animation: true,
      background: '#f5f5f5',
      series: [{
        name: '成交量',
        data: value.map(function(e) {
          return e.turnover / type[0]
        }),
        format: function(val, name) {
          return val.toFixed(2) + type[1];
        }
      }],
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        title: '成交金额 (' + type[1] + '元)',
        format: function(val) {
          return val.toFixed(2);
        },
        min: 0
      },
      width: (375 * windowW + 13.5),
      height: (200),
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.dataLoad(options.code, 'day', 30)

    // 具体数据、屏幕宽度
    this.setData({
      code: options.code,
      imageWidth: wx.getSystemInfoSync().windowWidth
    });
    console.log(this.data.imageWidth);

    //计算屏幕宽度比列
    windowW = this.data.imageWidth * 0.95 / 380;
    console.log(windowW);
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