// miniprogram/pages/index/index.js
var db = require('../../unit/db.js')
const style = require("../../unit/setStyle.js")
const app = getApp()
const windowHeight = wx.getSystemInfoSync().windowHeight - 193

Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: app.globalData.theme,
    lock: false,
    showLoading: false,
    is_seach: false,
    is_sidebar: false,
    select_id: 'hushen',
    select_index: '上证',
    select_fund: 'jijin_data',
    sort_by: 'comprehensive',
    sort_icon: ['up-down', 'up-down', 'up-down'],
    page: 1,
    /**
     * code:代码
     * name:名称
     * closingPrice:当前价
     * previousClose:昨收价
     * quoteChange:涨幅 (当前-昨收)/昨收
     * change:涨跌 (当前-昨收)
     */
    value_index: {
      hushen: [{
        code: '000001',
        name: '上证指数',
        closingPrice: '-',
        previousClose: '-',
        quoteChange: '-',
        change: '-'
      }, {
        code: '000906',
        name: '中证800',
        closingPrice: '-',
        quoteChange: '-',
        change: '-'
      }, {
        code: '399004',
        name: '深证100R',
        closingPrice: '-',
        quoteChange: '-',
        change: '-'
      }, {
        code: '399005',
        name: '中小板指',
        closingPrice: '-',
        quoteChange: '-',
        change: '-'
      }],
      uss: [],
      others: []
    },
    value: {
      hushen: [],
      uss: [],
      fund: [],
      index: [],
      others: []
    }
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
      if (this.data.select_id == 'fund') {
        wx.navigateTo({
          url: '/pages/fund/fund?code=' + e.currentTarget.id + '&type=' + this.data.select_fund,
        })
      } else {
        wx.navigateTo({
          url: '/pages/details/details?code=' + e.currentTarget.id + '&type=' + this.data.select_id,
        })
      }
    }
  },

  //显示添加自选按钮
  showAddOption: function() {
    this.setData({
      lock: true
    });
    console.log('aaa')
  },

  // 排序
  sort: function(e) {
    // console.log(e.currentTarget.id);
    var id = e.currentTarget.id;
    var arr = ['closingPrice', 'quoteChange', 'change'];
    if (this.data.select_id == 'fund' && this.data.select_fund == 'jijin_data')
      arr = ['unitNetWorth', 'cumulativeNetWorth', 'growthRate'];
    else if (this.data.select_id == 'fund' && this.data.select_fund == 'USA_fund_data')
      arr = ['closingPrice', 'change', 'growthRate'];
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
        // console.log(sort_by)
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
    if (this.data.select_id == 'index') {
      this.dataLoad(this.data.select_id, this.data.sort_by, 1, this.data.select_index);
    } else {
      this.dataLoad(this.data.select_id, sort_by, 1);
    }
  },

  // 指数选择显示
  selectIndex: function(e) {
    this.setData({
      select_index: e.currentTarget.id,
      sort_by: 'comprehensive',
      sort_icon: ['up-down', 'up-down', 'up-down'],
      page: 1,
      reset_scroll: 0
    });
    this.dataLoad(this.data.select_id, 'comprehensive', 1, e.currentTarget.id);
  },

  // 基金显示
  selectFund: function(e) {
    this.setData({
      select_fund: e.currentTarget.id,
      sort_by: 'comprehensive',
      sort_icon: ['up-down', 'up-down', 'up-down'],
      page: 1,
      reset_scroll: 0
    });
    this.dataLoad(this.data.select_id, 'comprehensive', 1);
  },

  // 选择显示
  select: function(e) {
    console.log
    var winHeight = windowHeight;
    if (e.currentTarget.id == 'others') {
      this.setData({
        select_id: e.currentTarget.id
      })
      return
    } else if (e.currentTarget.id == 'index') {
      this.dataLoad(e.currentTarget.id, 'comprehensive', 1, this.data.select_index);
      winHeight = winHeight + 39;
    } else if (e.currentTarget.id == 'hushen') {
      this.dataLoad(e.currentTarget.id, 'comprehensive', 1);
      if (this.data.value_index['hushen'].length == 0) {
        this.loadIndex(e.currentTarget.id);
      }
    } else if (e.currentTarget.id == 'uss') {
      this.dataLoad(e.currentTarget.id, 'comprehensive', 1);
      winHeight = winHeight + 78;
    } else {
      this.dataLoad(e.currentTarget.id, 'comprehensive', 1);
      winHeight = winHeight + 39;
    }
    this.setData({
      select_id: e.currentTarget.id,
      sort_by: 'comprehensive',
      sort_icon: ['up-down', 'up-down', 'up-down'],
      page: 1,
      reset_scroll: 0,
      winHeight
    })
  },

  // 显示搜索框
  showSeach: function() {
    this.setData({
      is_seach: true
    })
  },

  //显示侧边栏
  showSidebar: function() {
    this.setData({
      is_sidebar: true
    })
  },

  //数据获取
  dataLoad: function(type, order, page, other) {
    if (page == 'max1') {
      return;
    }
    this.setData({
      showLoading: true
    })
    if (other == undefined)
      other = '';

    var ttype = 'other';
    if (type == 'hushen')
      ttype = 'gupiao_data';
    else if (type == 'uss')
      ttype = 'USA_stock_data';
    else if (type == 'fund')
      ttype = this.data.select_fund;
    else if (type == 'index')
      ttype = 'shangzheng_shenzheng_data';

    db.getData.selectAll(ttype, order, page, other).then(res => {
      //请求成功
      // console.log(res, typeof(res.data))
      var value = this.data.value;
      var newValue;
      if (ttype == 'jijin_data') {
        newValue = res.data.map(function(e) {
          return {
            code: e.code,
            name: e.fundName,
            unitNetWorth: e.unitNetWorth.toFixed(3),
            cumulativeNetWorth: e.cumulativeNetWorth.toFixed(3),
            growthRate: e.growthRate.toFixed(2)
          }
        });
      } else if (ttype == 'USA_fund_data') {
        newValue = res.data.map(function(e) {
          return {
            code: e.code,
            name: e.fundName,
            closingPrice: e.closingPrice,
            change: e.change,
            growthRate: e.growthRate.toFixed(2)
          }
        });
      } else {
        newValue = res.data.map(function(e) {
          return {
            code: e.code,
            name: e.name,
            closingPrice: e.closingPrice,
            previousClose: e.previousClose,
            quoteChange: e.quoteChange,
            change: e.change
          }
        });
      }
      if (page == 1) {
        value[type] = newValue;
      } else {
        value[type] = value[type].concat(newValue);
      }
      if (newValue.length == 0) {
        page = 'max'
      }

      this.setData({
        value,
        page,
        showLoading: false
      });
    }).catch(err => {
      //请求失败
      wx.showToast({
        title: '网络错误',
        icon: 'none',
        duration: 2000 //持续的时间
      });
      this.setData({
        showLoading: false
      })
    });
  },

  //指数栏加载
  loadIndex: function(type) {
    var value_index = this.data.value_index;
    value_index[type] = [];
    this.setData({
      value_index
    });

    var code = [];
    if (type == 'hushen') {
      code = ['000001', '000906', '399004', '399005'];
    }
    for (var i in code) {
      db.getData.selectByCode('shangzheng_shenzheng_data', code[i], 'day', 1, 1).then(res => {
        var value = {
          code: res.data[0].code,
          name: res.data[0].name,
          closingPrice: res.data[0].closingPrice,
          change: res.data[0].change,
          quoteChange: res.data[0].quoteChange
        }
        value_index = this.data.value_index;
        value_index[type].push(value);
        this.setData({
          value_index
        });
      }).catch(err => {
        //请求失败
      });
    }
  },

  //触底添加数据
  bottomReLoad: function() {
    if (this.data.select_id == 'index') {
      this.dataLoad(this.data.select_id, this.data.sort_by, this.data.page + 1, this.data.select_index);
    } else {
      this.dataLoad(this.data.select_id, this.data.sort_by, this.data.page + 1);
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.dataLoad('hushen', 'comprehensive', 1);
    this.loadIndex('hushen');
    this.setData({
      winHeight: windowHeight
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    style.changeStyle(app.globalData.theme, false)
    this.setData({
      theme: app.globalData.theme
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onRefresh: function() {
    // 显示顶部刷新图标
    if (this.data.select_id == 'hushen') {
      this.dataLoad(this.data.select_id, this.data.sort_by, 1);
      this.loadIndex(this.data.select_id);
    } else if (this.data.select_id == 'index') {
      this.dataLoad(this.data.select_id, this.data.sort_by, 1, this.data.select_index);
    } else {
      this.dataLoad(this.data.select_id, this.data.sort_by, 1);
    }

    this.setData({
      page: 1,
      refTri: false
    })
  }
})