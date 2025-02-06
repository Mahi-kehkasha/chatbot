import React, { useState, useEffect, useRef } from 'react';
import SimplePeer from 'simple-peer';
import io from 'socket.io-client';
import config from '../config';

const CallHandler = ({ selectedContact, user, onClose }) => {
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState('');
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [isVideo, setIsVideo] = useState(false);

  const userVideo = useRef();
  const partnerVideo = useRef();
  const connectionRef = useRef();
  const socket = useRef();

  useEffect(() => {
    socket.current = io(config.SOCKET_URL);

    socket.current.on('callUser', (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setIsVideo(data.isVideo);
      setCallerSignal(data.signal);
    });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  const callUser = async (isVideoCall = false) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: isVideoCall,
        audio: true,
      });
      setStream(mediaStream);
      setIsVideo(isVideoCall);

      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: mediaStream,
      });

      peer.on('signal', (data) => {
        socket.current.emit('callUser', {
          userToCall: selectedContact._id,
          signalData: data,
          from: user.id,
          isVideo: isVideoCall,
        });
      });

      peer.on('stream', (stream) => {
        partnerVideo.current.srcObject = stream;
      });

      socket.current.on('callAccepted', (signal) => {
        setCallAccepted(true);
        peer.signal(signal);
      });

      connectionRef.current = peer;
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  };

  const answerCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true,
      });
      setStream(mediaStream);

      setCallAccepted(true);

      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: mediaStream,
      });

      peer.on('signal', (data) => {
        socket.current.emit('answerCall', { signal: data, to: caller });
      });

      peer.on('stream', (stream) => {
        partnerVideo.current.srcObject = stream;
      });

      peer.signal(callerSignal);
      connectionRef.current = peer;
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  };

  const leaveCall = () => {
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {receivingCall && !callAccepted ? 'Incoming Call' : 'Call'}
          </h2>
          <button
            onClick={leaveCall}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            End Call
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stream && (
            <div className="relative">
              <video
                playsInline
                muted
                ref={userVideo}
                autoPlay
                className="w-full rounded-lg"
              />
              <p className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                You
              </p>
            </div>
          )}

          {callAccepted && !callEnded && (
            <div className="relative">
              <video
                playsInline
                ref={partnerVideo}
                autoPlay
                className="w-full rounded-lg"
              />
              <p className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                {selectedContact.username}
              </p>
            </div>
          )}
        </div>

        {receivingCall && !callAccepted && (
          <div className="mt-4 text-center">
            <h3 className="text-lg mb-2">
              {selectedContact.username} is calling...
            </h3>
            <button
              onClick={answerCall}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mr-2"
            >
              Answer
            </button>
            <button
              onClick={leaveCall}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Decline
            </button>
          </div>
        )}

        {!callAccepted && !receivingCall && (
          <div className="mt-4 text-center">
            <button
              onClick={() => callUser(false)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
            >
              Voice Call
            </button>
            <button
              onClick={() => callUser(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Video Call
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallHandler;
