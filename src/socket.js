// import { io } from 'socket.io-client';

// export const initSocket = async () => {
//     const options = {
//         'force new connection': true,
//         reconnectionAttempt: 'Infinity',
//         timeout: 10000,
//         transports: ['websocket'],
//     };
//     return io(process.env.REACT_APP_BACKEND_URL, options);
// };

import { io } from 'socket.io-client';

let socket = null;

export const initSocket = async () => {
    if (!socket) {
        const options = {
            'force new connection': true,
            reconnectionAttempts: Infinity,
            timeout: 10000,
            transports: ['websocket'],
        };
        socket = io(process.env.REACT_APP_BACKEND_URL, options);
    }
    return socket;
};
