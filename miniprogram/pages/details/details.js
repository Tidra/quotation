// miniprogram/pages/details/details.js
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
     * current:当前价
     * pre_close:昨收价
     * change_pct:涨幅 (当前-昨收)/昨收
     * change:涨跌 (当前-昨收)
     * open:今开盘
     * volume:成交量
     * turnover_ratio:换手率
     * high:最高
     * low:最低
     * sum_amount:成交额 (买入成交额+卖出成交额)
     * sell:内盘
     * buy:外盘
     * market_cap:总市值(亿元)
     * pe:市盈率
     * amplitude:振幅 （当日最高点的价格－当日最低点的价格）/前收价
     * circulating_market_cap:流通市值
     */
    value: {}
  },

  // 选择显示图表
  select: function (e) {
    this.setData({
      select_id: e.currentTarget.id
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
    wx.navigateTo({
      url: '/pages/seach/seach?seach_value=' + e.detail.value.seach_value,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var value = {
      code: options.code,
      name: '中关村',
      current: 15.85,
      pre_close: 14.41,
      change_pct: 99.9,
      change: 1.44,
      open: 14.25,
      volume: 49.23,
      turnover_ratio: 9.77,
      high: 15.85,
      low: 14.05,
      sum_amount: 7.44,
      sell: 23.85,
      buy: 25.58,
      market_cap: 103,
      pe: 777.85,
      amplitude: 12.49,
      circulating_market_cap: 80.3
    };
    this.setData({
      value: value
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