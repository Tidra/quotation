// miniprogram/pages/seach/seach.js
var db = require("../../unit/db.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_hide: 'none',
    select_id: 'gupiao_data',
    sort_by: 'comprehensive',
    sort_icon: ['up-down', 'up-down', 'up-down'],
  },

  // 类型
  selectId: function(e) {
    this.setData({
      select_id: e.currentTarget.id,
      sort_by: 'comprehensive',
      sort_icon: ['up-down', 'up-down', 'up-down']
    });
    this.dataLoad(e.currentTarget.id, this.data.seach_value, 'comprehensive', 1);
  },

  // 排序
  sort: function(e) {
    console.log(e.currentTarget.id);
    var id = e.currentTarget.id;
    var arr = ['closingPrice', 'quoteChange', 'change'];
    if (this.data.select_id == 'jijin_data')
      arr = ['unitNetWorth', 'cumulativeNetWorth', 'growthRate'];
    var i = arr.indexOf(id);
    var sort_by = this.data.sort_by;
    var sort_icon = ['up-down', 'up-down', 'up-down'];
    if (id == "comprehensive") {
      if (sort_by == id) {
        return;
      }
      sort_by = id;
    } else {
      if (sort_by == id + 'Drop') {
        console.log(sort_by)
        sort_by = id + 'Rise';
        sort_icon[i] = 'up';
      } else {
        sort_by = id + 'Drop';
        sort_icon[i] = 'down';
      }
    };
    this.setData({
      sort_by,
      sort_icon,
      page: 1,
    });
    this.dataLoad(this.data.select_id, this.data.seach_value, sort_by, 1)
  },

  //去详细页
  toDetail: function(e) {
    if (this.data.lock) {
      //开锁
      setTimeout(() => {
        this.setData({
          lock: false
        });
      }, 50);
    } else {
      if (this.data.select_id == 'jijin_data') {
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
    var seach_value = "";
    if (typeof(e.detail.value) == 'string') {
      seach_value = e.detail.value;
    } else {
      seach_value = e.detail.value.seach_value;
    }
    this.setData({
      page: 1,
      seach_value,
      sort_by: 'comprehensive',
      sort_icon: ['up-down', 'up-down', 'up-down']
    });
    this.seachIs();
    this.dataLoad(this.data.select_id, seach_value, 'comprehensive', 1)
  },

  //触底添加数据
  bottomReLoad: function() {
    this.dataLoad(this.data.select_id, this.data.seach_value, this.data.sort_by, this.data.page + 1);
  },

  //数据获取
  dataLoad: function(type, data, order, start) {
    if (start == 'max1') {
      return;
    }
    wx.showLoading({
      title: '玩命加载中',
    })

    var newData = data;
    if (type == 'shangzheng_shenzheng_data') {
      newData = '上证+' + data;
    }
    db.getData.selectFuzzy(type, newData, order, start).then(res => {
        //请求成功
        console.log(res, typeof(res.data))
        var value = this.data.value;
        var newValue = res.data.map(function(e) {
          if (type != 'jijin_data') {
            return {
              code: e.code,
              name: e.name,
              current: e.closingPrice,
              previousClose: e.previousClose,
              quoteChange: e.quoteChange,
              change: e.change
            }
          } else {
            return {
              code: e.code,
              name: e.fundName,
              unitNetWorth: e.unitNetWorth.toFixed(3),
              cumulativeNetWorth: e.cumulativeNetWorth.toFixed(3),
              growthRate: e.growthRate.toFixed(2)
            }
          }
        });
        if (type == 'shangzheng_shenzheng_data') {
          newData = '深证+' + data;
          db.getData.selectFuzzy(type, newData, order, start).then(res => {
            newValue = newValue.concat(res.data.map(function(e) {
              return {
                code: e.code,
                name: e.name,
                current: e.closingPrice,
                previousClose: e.previousClose,
                quoteChange: e.quoteChange,
                change: e.change
              }
            }));

            if (start == 1) {
              value = newValue;
            } else {
              value = value.concat(newValue);
            }
            if (newValue.length == 0) {
              start = 'max'
            }
            // 隐藏加载框
            wx.hideLoading();

            console.log(value);
            this.setData({
              page: start,
              value
            });
          }).catch(err => {
            //请求失败
            wx.showToast({
              title: '网络错误',
              icon: 'none',
              duration: 2000 //持续的时间
            })
          });
        } else {
          if (start == 1) {
            value = newValue;
          } else {
            value = value.concat(newValue);
          }
          if (newValue.length == 0) {
            start = 'max'
          }
          // 隐藏加载框
          wx.hideLoading();
          console.log(value);
          this.setData({
            page: start,
            value
          });
        }
      })
      .catch(err => {
        //请求失败
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 2000 //持续的时间
        })
      });
    setTimeout(function () {
      wx.hideLoading()
    }, 5000)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    this.setData({
      page: 1,
      seach_value: options.seach_value,
      winHeight: wx.getSystemInfoSync().windowHeight - 115
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