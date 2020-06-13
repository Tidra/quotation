// unit/seach/seach.js
const app = getApp()
var seach_value = ''

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    inshow: {
      type: Boolean,
      value: false
    },
    toPage: {
      type: Boolean,
      value: true
    },
    focus: {
      type: Boolean,
      value: false
    },
    type: {
      type: String,
      value: 'gupiao_data'
    },
    seach_value: {
      type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    theme: 'light',
    seachList: []
  },

  pageLifetimes: {
    show: function() {
      var that = this
      wx.getStorage({
        key: 'seachList',
        success(res) {
          // console.log(res.data)
          that.setData({
            seachList: res.data
          })
        }
      })
      seach_value = this.data.seach_value
      this.setData({
        theme: app.globalData.theme
      })
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onFocus: function() {
      this.setData({
        isFocus: true
      })
    },

    onInput: function(e) {
      // console.log(e.detail)
      seach_value = e.detail.value
      this.setData({
        seach_value
      })
    },

    clear: function() {
      seach_value = ''
      this.setData({
        seach_value
      })
    },

    seach: function(e) {
      var value = seach_value
      var type = e.currentTarget.id
      var seachList = this.data.seachList

      var n = Number(type)
      if (!isNaN(n)) {
        type = seachList[n].type
        value = seachList[n].value
        seachList.splice(n, 1)
      } else {
        for (let i = 0; i < seachList.length; i++) {
          if (value == seachList[i].value) {
            seachList.splice(i, 1)
            return
          }
        }
      }

      if (value.length == 0) {
        wx.showToast({
          title: '搜索内容不能为空！',
          icon: 'none',
          duration: 1000 //持续的时间
        })
        return
      }
      seachList.splice(0, 0, {
        value: value,
        type: type
      })
      seachList = seachList.slice(0, 5)
      wx.setStorage({
        key: "seachList",
        data: seachList
      })

      if (this.data.toPage) {
        wx.navigateTo({
          url: '/pages/seach/seach?seach_value=' + value + '&type=' + type,
        })
      } else {
        var myEventDetail = {
          seach_value: value,
          type
        } // detail对象，提供给事件监听函数
        var myEventOption = {} // 触发事件的选项
        this.triggerEvent('seach', myEventDetail, myEventOption)
        this.setData({
          seachList,
          type
        })
        return
      }

      this.closeAll()
    },

    closeAll: function() {
      this.clear()
      this.setData({
        show: false,
        isFocus: false
      })
    },

    clearList: function(e) {
      var seachList = this.data.seachList
      seachList.splice(e.currentTarget.id, 1)
      this.setData({
        seachList
      })
      wx.setStorage({
        key: "seachList",
        data: seachList
      })
    },

    clearAll: function() {
      wx.removeStorage({
        key: 'seachList',
        success(res) {
          console.log(res)
        }
      })
      this.setData({
        seachList: []
      })
    }
  }
})