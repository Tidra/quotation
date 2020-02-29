// miniprogram/pages/index/index.js

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_hide: 'none',
    select_id: 'hushen',
    /**
     * code:代码
     * name:名称
     * current:当前价
     * pre_close:昨收价
     * change_pct:涨幅 (当前-昨收)/昨收
     * change:涨跌 (当前-昨收)
     */
    value_index: {
      hushen: [{
        code: '000001',
        name: '上证指数',
        current: 2880.30,
        pre_close: 2991.33,
        change_pct: -3.71,
        change: -111.03
      }, {
        code: '000906',
        name: '中证800',
        current: 4189.31,
        pre_close: 4363.01,
        change_pct: -3.98,
        change: -173.70
      }, {
        code: '399004',
        name: '深证100R',
        current: 6149.33,
        pre_close: 6412.27,
        change_pct: -4.10,
        change: -262.95
      }, {
        code: '399005',
        name: '中小板指',
        current: 7256.44,
        pre_close: 7597.13,
        change_pct: -4.48,
        change: -340.69
      }],
      concepts: [],
      hongkong: [],
      globle: [],
      others: []
    },
    value: {
      hushen: [{
        code: '688026',
        name: '洁特生物',
        current: 83.15,
        pre_close: 69.30,
        change_pct: 19.99,
        change: 13.85
      }, {
          code: '688396',
          name: '华润微',
          current: 47.80,
          pre_close: 42.01,
          change_pct: 13.78,
          change: 5.79
        }, {
          code: '688298',
          name: '东方生物',
          current: 102.23,
          pre_close: 92.05,
          change_pct: 11.06,
          change: 10.18
        }, {
          code: '399005',
          name: '中小板指',
          current: 7256.44,
          pre_close: 7597.13,
          change_pct: -4.48,
          change: -340.69
        }],
      concepts: [],
      hongkong: [],
      globle: [],
      others: []
    }
  },

  // 选择显示
  select:function(e){
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