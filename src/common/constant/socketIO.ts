import {io} from 'socket.io-client';
import {baseUrl} from '../utils/ENV';

const socket = io(baseUrl);

export {
  socket,
};
