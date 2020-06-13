/**
 * 动态设置全局样式
 */

function changeStyle(theme, ifAnimation) {
  if (theme == 'dark') {
    if (ifAnimation) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1e1e1e',
        animation: {
          duration: 400,
          timingFunc: 'easeIn'
        }
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1e1e1e',
        animation: {
          duration: 100,
          timingFunc: 'easeIn'
        }
      });
    }
    wx.setBackgroundColor({
      backgroundColor: '#000000', // 窗口的背景色为白色
    })
  } else if (theme == 'light') {
    if (ifAnimation) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#2990DC',
        animation: {
          duration: 400,
          timingFunc: 'easeIn'
        }
      });
    } else {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#2990DC',
        animation: {
          duration: 100,
          timingFunc: 'easeIn'
        }
      });
    }
    wx.setBackgroundColor({
      backgroundColor: '#ffffff', // 窗口的背景色为白色
    })
  }
}

module.exports = {
  changeStyle: changeStyle
}