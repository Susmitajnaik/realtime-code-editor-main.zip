import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true); // ✅ new state

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();

            
            // socketRef.current.on('connect_error', (err) => handleErrors(err));
            // socketRef.current.on('connect_failed', (err) => handleErrors(err));

            socketRef.current.on('connect_error', handleErrors);
        socketRef.current.on('connect_failed', handleErrors);

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

             // Prevent duplicate listeners
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });





        // 🔁 Handle when someone joins
socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
 
    const currentUsername = location.state?.username;

    // // ✅ Show toast only if another user joined
    // if (username !== currentUsername) {
    //     toast.success(`${username} joined the room.`);
    // }

    // ✅ Always update client
    const uniqueClients = Array.from(
        new Map(clients.map(c => [c.socketId, c])).values()
    );
    setClients(uniqueClients);
    
    if (username !== currentUsername) {
        toast.success(`${username} joined the room.`);
    }

   

     if (socketRef.current.id !== socketId) {
        setTimeout(() => {
            socketRef.current.emit(ACTIONS.SYNC_CODE, {
                socketId,
                code: codeRef.current,
            });
        }, 500);
    }
});



            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                });
        };
        init();

        // return () => {
        //     socketRef.current.disconnect();
        //     socketRef.current.off(ACTIONS.JOINED);
        //     socketRef.current.off(ACTIONS.DISCONNECTED);
        // };
        return () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        }
    };
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }



    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img
                            className="logoImage"
                            src="/code-sync.png"
                            alt="logo"
                        />
                    </div>
                    <h3>Connected</h3>{clients.length === 1 && (
    <div className="aloneMessage">
        <p>You are alone in the room 👤</p>
        <p style={{ fontSize: '0.8rem', color: '#aaa' }}>
            Invite a friend using the Room ID to collaborate together!
        </p>
    </div>
)}

                    <div className="clientsList">
                        {clients.map((client) => (
                            <Client
                                key={client.socketId}
                                username={client.username}
                            />
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>

            <div className="editorWrap">
                <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={(code) => {
                        codeRef.current = code;
                    }}
                />
            </div>
        </div>
    );
};

export default EditorPage;



