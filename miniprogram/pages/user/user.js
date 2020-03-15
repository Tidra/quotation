// miniprogram/pages/user/user.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sort_by: 'comprehensive',
    sort_icon: ['up-down', 'up-down', 'up-down'],
    is_hide: 'none',
    select_id: 'gupiao',
    value: {
      gupiao:[],
      jijin:[]
    },
  },

  // 显示搜索框
  seachIs: function () {
    var is_hide = 'none';
    if (this.data.is_hide == 'none') {
      is_hide = 'flex';
    }
    this.setData({
      is_hide: is_hide,
    })
  },

  seach: function (e) {
    this.seachIs();
    var seach_value = "";
    if (typeof (e.detail.value) == 'string') {
      seach_value = e.detail.value;
    } else {
      seach_value = e.detail.value.seach_value;
    }
    wx.navigateTo({
      url: '/pages/seach/seach?seach_value=' + seach_value,
    })
  },

  // 选择显示
  select: function (e) {
    this.setData({
      select_id: e.currentTarget.id,
      sort_by: 'comprehensive',
      sort_icon: ['up-down', 'up-down', 'up-down'],
      page: 1
    })
    // this.dataLoad(e.currentTarget.id, 'comprehensive', 1)
  },

  // 排序
  sort: function (e) {
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
    // this.dataLoad(this.data.select_id, sort_by, 1)
  },

  //触底添加数据
  bottomReLoad: function () {
    // this.dataLoad(this.data.select_id, this.data.sort_by, this.data.page + 1);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      winHeight: wx.getSystemInfoSync().windowHeight - 123
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})