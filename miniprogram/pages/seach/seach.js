// miniprogram/pages/seach/seach.js
var db = require("../../unit/db.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_hide: 'none',
    sort_by: 'comprehensive',
    sort_icon: ['up-down', 'up-down', 'up-down'],
  },

  // 排序
  sort: function(e) {
    console.log(e.currentTarget.id);
    var sort_by = this.data.sort_by;
    var sort_icon = ['up-down', 'up-down', 'up-down'];
    if (e.currentTarget.id == "sort1") {
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
      sort_icon
    });
    this.dataLoad('gupiao_data', this.data.seach_value, sort_by, 1)
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

  seach: function (e) {
    var seach_value = "";
    if (typeof (e.detail.value) == 'string') {
      seach_value = e.detail.value;
    } else {
      seach_value = e.detail.value.seach_value;
    }
    this.setData({
      seach_value,
      sort_by: 'comprehensive',
      sort_icon: ['up-down', 'up-down', 'up-down']
    });
    this.seachIs();
    this.dataLoad('gupiao_data', seach_value, 'comprehensive', 1)
  },

  //数据获取
  dataLoad: function(type, data, order, start) {
    db.getData.selectFuzzy(type, data, order, start).then(res => {
        //请求成功
        console.log(res, typeof(res.data))
        var value = this.data.value;
        value = res.data.map(function(e) {
          return {
            code: e.code,
            name: e.name,
            current: e.closingPrice,
            previousClose: e.previousClose,
            quoteChange: e.quoteChange,
            change: e.change
          }
        });
        console.log(value)
        this.setData({
          value
        })
      })
      .catch(err => {
        //请求失败
      });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    this.setData({
      seach_value: options.seach_value,
    })
    this.dataLoad('gupiao_data', options.seach_value, 'comprehensive', 1)
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