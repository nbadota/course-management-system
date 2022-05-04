const isPrd = process.env.NODE_ENV === 'production';
const imgHost = isPrd ? 'http://47.98.208.69:3000' : 'http://localhost:3000';

const baseUrl = isPrd ? 'http://47.98.208.69:3000' : 'http://localhost:3000';

export {
  isPrd,
  imgHost,
  baseUrl,
};
