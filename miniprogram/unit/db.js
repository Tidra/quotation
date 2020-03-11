/**
 * 获取后台数据
 */
const GET = 'GET';
const POST = 'POST';
const PUT = 'PUT';
const FORM = 'FORM';
const DELETE = 'DELETE';

const baseURL = 'http://134.175.192.53:8080/gupiao_data/';

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
        // return res.data;
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
        reject(err)
        // console.log(err)
      }
    });
  })
}

const getData = {
  selectByCode: function(code, date_unit, num) {
    var url_data = 'findDataByCodeOrName/';
    url_data += code + '/1/';
    url_data += num;
    return request(GET, url_data)
  },
  selectAll: function(order, start) {
    var url_data = 'findDataByRegex/%20/';
    if (order == undefined) {
      order = 'comprehensive';
    }
    url_data += order + '/' + start.toString() + '/10';
    return request(GET, url_data)
  },
  selectFuzzy: function(data, order, start) {
    var url_data = 'findDataByRegex/';
    url_data += data.replace(/\s/, "%20") + '/';
    if (order == undefined) {
      order = 'comprehensive';
    }
    url_data += order + '/' + start.toString() + '/10';
    console.log(url_data)
    return request(GET, url_data);
  }
};

module.exports = {
  getData: getData
}