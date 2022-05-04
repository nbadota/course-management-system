import axios from 'axios';
import {isPrd} from './ENV';

const request = axios.create({
  withCredentials: true,
  timeout: 600000,
  baseURL: isPrd ? 'http://47.98.208.69:3000' : '',
});

request.interceptors.response.use(function(response) {
  // 2xx 范围内的状态码都会触发该函数。
  // 对响应数据做点什么
  const {data} = response;
  if (data.errno === 0) {
    return data;
  } else {
    return Promise.reject(data);
  }
}, function(error) {
  // 超出 2xx 范围的状态码都会触发该函数。
  // 对响应错误做点什么
  return Promise.reject(error);
});

export {
  request,
};
