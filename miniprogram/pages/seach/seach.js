// miniprogram/pages/seach/seach.js
var db = require("../../unit/db.js")
const style = require("../../unit/setStyle.js")
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    theme: app.globalData.theme,
    select_id: 'gupiao_data',
    sort_by: 'comprehensive',
    sort_icon: ['up-down', 'up-down', 'up-down'],
  },

  // 类型
  selectId: function(e) {
    this.setData({
      select_id: e.currentTarget.id,
      sort_by: 'comprehensive',
      sort_icon: ['up-down', 'up-down', 'up-down'],
      reset_scroll: 0
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
      reset_scroll: 0
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
      if (this.data.select_id == 'jijin_data' || this.data.select_id == 'USA_fund_data') {
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

  seach: function(e) {
    var seach_value = e.detail.seach_value
    var select_id = e.detail.type
    this.setData({
      page: 1,
      reset_scroll: 0,
      seach_value,
      select_id,
      sort_by: 'comprehensive',
      sort_icon: ['up-down', 'up-down', 'up-down']
    });
    this.dataLoad(select_id, seach_value, 'comprehensive', 1)
  },

  //触底添加数据
  bottomReLoad: function() {
    this.dataLoad(this.data.select_id, this.data.seach_value, this.data.sort_by, this.data.page + 1);
  },

  //数据获取
  dataLoad: function (type, data, order, start) {
    if (start == 'max1') {
      return;
    }
    this.setData({
      showLoading: true
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
          if (type == 'jijin_data') {
            return {
              code: e.code,
              name: e.fundName,
              unitNetWorth: e.unitNetWorth.toFixed(3),
              cumulativeNetWorth: e.cumulativeNetWorth.toFixed(3),
              growthRate: e.growthRate.toFixed(2)
            }
          } else if (type == 'USA_fund_data') {
            return {
              code: e.code,
              name: e.fundName,
              closingPrice: e.closingPrice,
              change: e.change,
              growthRate: e.growthRate.toFixed(2)
            }
          } else {
            return {
              code: e.code,
              name: e.name,
              closingPrice: e.closingPrice,
              previousClose: e.previousClose,
              quoteChange: e.quoteChange,
              change: e.change
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
                closingPrice: e.closingPrice,
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

            console.log(value);
            this.setData({
              page: start,
              value,
              showLoading: false
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
          
          console.log(value);
          this.setData({
            page: start,
            value,
            showLoading: false
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
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    style.changeStyle(app.globalData.theme, false)
    this.setData({
      theme: app.globalData.theme,
      page: 1,
      seach_value: options.seach_value,
      select_id: options.type,
      winHeight: wx.getSystemInfoSync().windowHeight - 122
    })
    this.dataLoad(options.type, options.seach_value, 'comprehensive', 1)
  },
})