'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react';
import { useRef } from 'react';

export default function Home() {
  const [peerId, setPeerId] = useState<string>("");
  const [remotePeerIdValue, setRemotePeerIdValue] = useState<string>('');
  const remoteVideoRef = useRef<any>(null);
  const currentUserVideoRef = useRef<any>(null);
  const peerInstance = useRef<any>(null);



  useEffect(() => {
    const fn = async () => {
    const Peer = (await import("peerjs")).default;
    const peer = new Peer();
    //console.log(peer);
    peer.on('open', function (id) {
      setPeerId(id);
      console.log('My peer ID is:' + id);
    })
    peer.on("call", (call) => {
      debugger
      if (window.navigator !== undefined) {
        const getUserMedia = window.navigator.mediaDevices.getUserMedia;
        getUserMedia({ video: true, audio: true }).then((mediaStream) => {
          //call.answer(mediaStream);
          currentUserVideoRef.current.srcObject = mediaStream;
          currentUserVideoRef.current.play()
          call.answer(mediaStream)
          call.on('stream', (remoteStream) => {
            // Show stream in some video/canvas element.
            remoteVideoRef.current.srcObject = remoteStream
            remoteVideoRef.current.play()
          });
        });
      } else {
        console.log("blablablalba");
      }
    });


    peerInstance.current = peer;
  }
  fn();
  }, [])
  const call = (remotePeerId : string) => {
    const getUserMedia = window.navigator.mediaDevices.getUserMedia;

    getUserMedia({ video: true, audio: true }).then((mediaStream) => {
      //call.answer(mediaStream);
      currentUserVideoRef.current.srcObject = mediaStream;
      currentUserVideoRef.current.play()
      const call = peerInstance.current?.call(remotePeerId, mediaStream);

      call?.on("stream", (remoteStream: MediaStream) => {
        console.log(remoteStream, "remote stream");
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        }
      });
    });
  }
  return (
    <div className="App">
      <input type="text" value={remotePeerIdValue} onChange={e => setRemotePeerIdValue(e.target.value)} />
      <button onClick={() => call(remotePeerIdValue)}>Call</button>
      <div>
        <h1>Current Video</h1>
        <video ref={currentUserVideoRef} />
      </div>
      <div>
        <h1>Remote Video</h1>
        <video ref={remoteVideoRef} />
      </div>
    </div>
  )
}
