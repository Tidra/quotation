// unit/work/work.js
var db = require("../db.js")
import * as echarts from '../../ec-canvas/echarts'
import '../../ec-canvas/dark'
import '../../ec-canvas/light'
const app = getApp()

var chart = {}
var gData = {}
var title = {
  secondTypeCount: '职位需求热度',
  cityCount: '职位所在城市比例',
  educationCount: '应聘所需教育要求'
}

function getOption(item) {
  if (item == "secondTypeCount") {
    return {
      title: {
        text: '拉勾网就业信息',
        subtext: title[item],
        x: 'center',
        top: 10
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}'
      },
      series: {
        center: ['50%', '60%'],
        radius: [0, '95%'],
        type: 'sunburst',
        data: gData[item],
        highlightPolicy: 'ancestor',
        label: {
          rotate: 'radial'
        },
        levels: [{}, {
          r0: '15%',
          r: '35%',
          itemStyle: {
            borderWidth: 2
          },
          label: {
            rotate: 'tangential'
          }
        }, {
          r0: '35%',
          r: '70%',
          label: {
            align: 'left'
          }
        }, {
          r0: '70%',
          r: '75%',
          label: {
            position: 'outside',
            padding: 3,
            silent: false
          },
          itemStyle: {
            borderWidth: 3
          }
        }]
      }
    }
  } else {
    return {
      title: {
        subtext: title[item],
        x: 'center'
      },
      dataset: {
        dimensions: ['_id', 'count'],
        source: gData[item]
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {d}%'
      },
      series: [{
        label: {
          normal: {
            fontSize: 14
          }
        },
        type: 'pie',
        minShowLabelAngle: 10,
        // roseType: 'radius',
        center: ['50%', '50%'],
        radius: ['35%', '70%'],
      }]
    }
  }
}

function typeChart(canvas, width, height, dpr) {
  chart["secondTypeCount"] = echarts.init(canvas, app.globalData.theme, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  })
  canvas.setChart(chart["secondTypeCount"])

  getData("secondTypeCount")
  return chart["secondTypeCount"]
}

function cityChart(canvas, width, height, dpr) {
  chart["cityCount"] = echarts.init(canvas, app.globalData.theme, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart["cityCount"])
  getData("cityCount")
  return chart["cityCount"]
}

function educationChart(canvas, width, height, dpr) {
  chart["educationCount"] = echarts.init(canvas, app.globalData.theme, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(chart["educationCount"])

  getData("educationCount")
  return chart["educationCount"]
}

function getData(item) {
  db.getData.selectWork(item).then(res => {
    if (item == "secondTypeCount") {
      gData[item] = [{
        name: '前10',
        children: res.data.slice(0, 10).map(e => {
          return {
            name: e._id,
            value: e.count
          }
        })
      }]
      gData[item] = gData[item].concat({
        name: '前10-20',
        children: res.data.slice(10, 20).map(e => {
          return {
            name: e._id,
            value: e.count
          }
        }).concat({
          name: '前21-30',
          children: res.data.slice(20, 30).map(e => {
            return {
              name: e._id,
              value: e.count
            }
          })
        })
      })
    } else {
      gData[item] = res.data
    }
    chart[item].setOption(getOption(item))
    // console.log(gData)
  })
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    theme: app.globalData.theme,
    city: {
      onInit: cityChart
    },
    education: {
      onInit: educationChart
    },
    type: {
      onInit: typeChart
    },
    winHeight: wx.getSystemInfoSync().windowHeight - 85
  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})