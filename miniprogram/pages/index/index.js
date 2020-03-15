// miniprogram/pages/index/index.js
var db = require('../../unit/db.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_seach: false,
    is_sidebar: false,
    select_id: 'hushen',
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
        current: 2880.30,
        previousClose: 2991.33,
        quoteChange: -3.71,
        change: -111.03
      }, {
        code: '000906',
        name: '中证800',
        current: 4189.31,
        previousClose: 4363.01,
        quoteChange: -3.98,
        change: -173.70
      }, {
        code: '399004',
        name: '深证100R',
        current: 6149.33,
        previousClose: 6412.27,
        quoteChange: -4.10,
        change: -262.95
      }, {
        code: '399005',
        name: '中小板指',
        current: 7256.44,
        previousClose: 7597.13,
        quoteChange: -4.48,
        change: -340.69
      }],
      concepts: [],
      hongkong: [],
      globle: [],
      others: []
    },
    value: {
      hushen: [],
      concepts: [],
      hongkong: [],
      globle: [],
      others: []
    }
  },

  //显示更多
  showMore: function() {
    this.closeAll();
    wx.navigateTo({
      url: '/pages/user/user',
    })
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
      if (sort_by == 'closingPriceDrop') {
        console.log(sort_by)
        sort_by = 'closingPriceRise';
        sort_icon[0] = 'up';
      } else {
        sort_by = 'closingPriceDrop';
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
    this.dataLoad(this.data.select_id, sort_by, 1)
  },

  // 选择显示
  select: function(e) {
    this.setData({
      select_id: e.currentTarget.id,
      sort_by: 'comprehensive',
      sort_icon: ['up-down', 'up-down', 'up-down'],
      page: 1
    })
    this.dataLoad(e.currentTarget.id, 'comprehensive', 1)
  },

  // 显示搜索框
  showSeach: function() {
    this.setData({
      is_seach: true
    })
  },

  //显示侧边栏
  showSidebar: function(){
    this.setData({
      is_sidebar: true
    })
  },

  //关闭所有
  closeAll: function(){
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
  dataLoad: function(type, order, page) {
    // 显示加载图标
    wx.showLoading({
      title: '玩命加载中',
    })
    db.getData.selectAll(order, page).then(res => {
        //请求成功
        console.log(res, typeof(res.data))
        var value = this.data.value;
        var newValue = res.data.map(function(e) {
          return {
            code: e.code,
            name: e.name,
            current: e.closingPrice,
            previousClose: e.previousClose,
            quoteChange: e.quoteChange,
            change: e.change
          }
        });

        if (page == 1) {
          value[type] = newValue;
        } else {
          value[type] = value[type].concat(newValue);
        }

        // 隐藏加载框
        wx.hideLoading();

        this.setData({
          value,
          page
        });
      })
      .catch(err => {
        //请求失败
      });
    setTimeout(function() {
      wx.hideLoading()
    }, 5000)
  },

  //触底添加数据
  bottomReLoad: function() {
    this.dataLoad(this.data.select_id, this.data.sort_by, this.data.page + 1);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.dataLoad('hushen', 'comprehensive', 1)
    this.setData({
      winHeight: wx.getSystemInfoSync().windowHeight - 194
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
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();

    var type = this.data.select_id;
    var order = this.data.sort_by;
    var page = 1;
    db.getData.selectAll(order, page).then(res => {
        //请求成功
        console.log(res, typeof(res.data))
        var value = this.data.value;
        value[type] = res.data.map(function(e) {
          return {
            code: e.code,
            name: e.name,
            current: e.closingPrice,
            previousClose: e.previousClose,
            quoteChange: e.quoteChange,
            change: e.change
          }
        });

        // 隐藏导航栏加载框
        wx.hideNavigationBarLoading();
        // 停止下拉动作
        wx.stopPullDownRefresh();

        this.setData({
          value,
          page
        });
      })
      .catch(err => {
        //请求失败
      });
    setTimeout(function() {
      // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
    }, 5000)
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