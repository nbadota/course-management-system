import React, {useEffect, useState, useRef, useContext} from 'react';
import {useNavigate} from 'react-router-dom';
import {Input, Button, Typography, message} from 'antd';
import {PhoneOutlined, CodeOutlined} from '@ant-design/icons';

import {request} from '../../common/utils/request';
import style from './login.module.css';
import {ErrCode} from '../../common/constant/errCode';
import {AuthContext} from '../../context/authContext';

const {Title} = Typography;

function Login() {
  const [phoneNum, setPhoneNum] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [isShow, setIsShow] = useState({count: 10, showText: true});
  const timer = useRef(null);
  const {authDispatch} = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(()=>{
    if (isShow.count === 0) {
      clearInterval(timer.current);
      setIsShow({
        count: 10,
        showText: true,
      });
    }
  }, [isShow.count]);

  const getVerifyCode = async function() {
    if (!isShow.showText) {
      return;
    }
    if (!(/^1[34578]\d{9}$/.test(phoneNum))) {
      message.warn('手机号格式不正确');
      return;
    }
    timer.current = setInterval(() => {
      setIsShow({count: (isShow.count--), showText: false});
    }, 1000);
    try {
      const res = await request.post('/api/user/genVerifyCode', {phoneNumber: phoneNum});
      message.success('验证码发送成功');
      console.log('res-------', res);
    } catch (e) {
      if (e.errno === ErrCode.SendVerifyCodeFailInfo) {
        message.error(e.message+',请稍后重试');
      } else {
        message.error(e.message+',请联系管理员');
      }
      clearInterval(timer.current);
      setIsShow({
        count: 60,
        showText: true,
      });
    }
  };

  const login = async function() {
    if (!(/^1[34578]\d{9}$/.test(phoneNum))) {
      message.warn('手机号格式不正确');
      return;
    }
    if (!(/\d{4}/.test(verifyCode))) {
      message.warn('验证码格式不正确');
      return;
    }
    try {
      const res = await request.post('/api/user/login', {phoneNumber: phoneNum, verifyCode});
      message.success('登录成功');
      clearInterval(timer.current);
      navigate('/home/user-list', {replace: true});
      authDispatch({
        type: 'LOGIN',
        payload: {
          user: res.data.phoneNumber,
        },
      });
    } catch (e) {
      message.error(e.message);
    }
  };
  return (
    <section className={style.Content}>
      <Title>欢迎登录LMZ后台</Title>
      <section className={style.alignCenter}>
        <Input style={{width: '300px', marginBottom: '30px'}}
          placeholder="请输入手机号"
          prefix={<PhoneOutlined />}
          onBlur={(event) => setPhoneNum(event.target.value)}
        />
        <Button type="primary" onClick={getVerifyCode}>
          {
            isShow.showText? '获取验证码' : <span style={{width: '70px'}}>{isShow.count+'s'}</span>
          }
        </Button>
        <br/>
        <Input style={{width: '300px', marginBottom: '30px'}}
          placeholder="请输入验证码"
          prefix={<CodeOutlined />}
          onBlur={(event) => setVerifyCode(event.target.value)}
        /><br/>
        <Button type="primary"
          style={{position: 'absolute', right: '80px', bottom: '20px'}}
          onClick={login}
        >登录</Button>
      </section>
    </section>
  );
}

export default Login as React.FC;
