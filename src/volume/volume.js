import React, { useRef, useEffect, useState } from "react";
import classnames from "classnames";

const Volume = ({ videoElement, volumeChange, setVolumeChange }) => {
  const [volume, setVolume] = useState(1),
    [muted, setMuted] = useState(false);
  const volumeBarElement = useRef();

  const keyboardControls = (event) => {
    switch (event.key) {
      case "m":
        toggleMute();
        break;
      case "ArrowUp":
        changeVolume(0.05);
        event.preventDefault();
        break;
      case "ArrowDown":
        changeVolume(-0.05);
        event.preventDefault();
        break;
      // no default
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", keyboardControls);
    return () => {
      window.removeEventListener("keydown", keyboardControls);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (videoElement.current) {
      const onLoadedMetadata = () => setVolume(videoElement.current.volume);
      const currentVideoElement = videoElement.current;
      videoElement.current.addEventListener("loadedmetadata", onLoadedMetadata);
      return () => {
        currentVideoElement.removeEventListener(
          "loadedmetadata",
          onLoadedMetadata
        );
      };
    }
  }, [videoElement]);
  useEffect(() => {
    videoElement.current.volume = volume;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume]);
  useEffect(() => {
    videoElement.current.muted = muted;
  }, [muted, videoElement]);

  const toggleMute = () => {
    setMuted(!muted);
  };

  const changeVolume = (arg) => {
    let newVolume;
    if (arg.clientX) {
      const volumeBarRect = volumeBarElement.current.getBoundingClientRect();
      newVolume =
        (arg.clientX - volumeBarRect["left"]) / volumeBarRect["width"];
    } else {
      newVolume = newVolume + arg;
    }

    if (newVolume < 0) newVolume = 0;
    else if (newVolume > 1) newVolume = 1;
    setVolume(newVolume);
    setMuted(newVolume <= 0);
  };

  const onVolumeChange = () => {
    window.addEventListener("mousemove", changeVolume);
    window.addEventListener("mouseup", volumeChanged);
    setVolumeChange(true);
  };
  const volumeChanged = () => {
    window.removeEventListener("mousemove", changeVolume);
    window.removeEventListener("mouseup", volumeChanged);
    setVolumeChange(false);
  };
  return (
    <div className={classnames("volume", { active: volumeChange })}>
      <div className="volume-logo" onClick={toggleMute}>
        <svg viewBox="0 0 500 500">
          {muted ? (
            <g fill="#FFF">
              <path d="M72 330H2V165h70L214-1v497zM451 358l-67-72-66 72-35-38 67-72-67-71 35-38 66 72 67-72 35 38-67 71 67 72z" />
            </g>
          ) : (
            <g fill="#FFF">
              <path d="M72 330H2V165h70L214-1v497zM271 137c57 0 103 49 103 111s-46 111-103 111V137z" />
              <path d="M267 497v-59c97 0 176-85 176-190S364 58 267 58V-1c62 0 120 25 163 73a263 263 0 0 1 0 352c-43 48-101 73-163 73z" />
            </g>
          )}
        </svg>
      </div>
      <div
        className="volume-bar-wrapper"
        onMouseDown={onVolumeChange}
        onClick={changeVolume}
        ref={volumeBarElement}
      >
        <div className="volume-bar">
          <div
            className="volume-level"
            style={{
              width: "calc(0.65em + " + volume * 100 + "%)",
            }}
          >
            <div className="volume-level-grabber"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Volume;
