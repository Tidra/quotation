/**
 * 获取后台数据
 */
const GET = 'GET';
const POST = 'POST';
const PUT = 'PUT';
const FORM = 'FORM';
const DELETE = 'DELETE';

const baseURL = 'http://134.175.192.53:8080/';

function request(method, url, data) {
  return new Promise(function(resolve, reject) {
    let header = {
      'content-type': 'application/json',
    };
    var result = wx.request({
      url: baseURL + url,
      method: method,
      data: method === POST ? JSON.stringify(data) : data,
      header: header,
      success(res) {
        //请求成功
        if (data && data.type) {
          res.data[0].type = data.type
        }
        resolve(res);

        //判断状态码---errCode状态根据后端定义来判断
        // if (res.data.errCode == 0) {
        //   resolve(res);
        // } else {
        //   //其他异常
        //   reject('运行时错误,请稍后再试');
        // }
      },
      fail(err) {
        //请求失败
        console.log(data)
        reject([err, data])
        // console.log(err)
      }
    });
  })
}

const getData = {
  // 单支股票全部数据
  selectByCode: function(type, code, date_unit, page, num, sec_data) {
    var url_data = type + '/findDataByCodeOrName/';
    url_data += code + '/';
    url_data += page + '/';
    url_data += num;
    // console.log(url_data)
    return request(GET, url_data, sec_data)
  },
  // 单类型全部数据
  selectAll: function(type, order, start, other) {
    if (other == undefined) {
      other = '';
    }
    var url_data = type + '/findDataByRegex/' + other + '+/';
    if (order == undefined) {
      order = 'comprehensive';
    }
    url_data += order + '/' + start.toString() + '/15';
    return request(GET, url_data)
  },
  // 模糊查询
  selectFuzzy: function(type, data, order, start) {
    var url_data = type + '/findDataByRegex/';
    url_data += data.replace(/\s/, "%20") + '/';
    if (order == undefined) {
      order = 'comprehensive';
    }
    url_data += order + '/' + start.toString() + '/12';
    return request(GET, url_data);
  },
  // 职业信息
  selectWork: function(item) {
    var url_data = 'jobs/' + item
    return request(GET, url_data);
  }
};

module.exports = {
  getData: getData
}