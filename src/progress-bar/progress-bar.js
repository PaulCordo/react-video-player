import React, { useRef } from "react";
import classnames from "classnames";

const ProgressBar = ({
  currentTime,
  duration,
  progress,
  seeking,
  setSeeking,
  toggleSeek,
}) => {
  const progressBarElement = useRef();
  //Seeked
  const showSeek = (event) => {
    const progressBarRect = progressBarElement.current.getBoundingClientRect(),
      positionInBar = event.clientX - progressBarRect["left"];
    setSeeking(positionInBar / progressBarRect["width"]);
  };

  const hideSeek = () => {
    setSeeking(0);
  };

  const onSeek = () => {
    window.addEventListener("mousemove", showSeek);
    window.addEventListener("mouseup", seekChange);
    toggleSeek(true);
  };

  const seekChange = (event) => {
    const progressBarRect = progressBarElement.current.getBoundingClientRect(),
      positionInBar = event.clientX - progressBarRect["left"];
    let newCurrentTime = 0;
    if (positionInBar > progressBarRect["width"])
      newCurrentTime = duration - 0.01;
    else if (positionInBar >= 0)
      newCurrentTime = (duration * positionInBar) / progressBarRect["width"];
    window.removeEventListener("mousemove", showSeek);
    window.removeEventListener("mouseup", seekChange);
    setSeeking(0);
    toggleSeek(false, newCurrentTime);
  };
  const played = currentTime / duration;
  return (
    <div
      className={classnames("progress-bar-wrapper", { grabbing: seeking })}
      onMouseDown={onSeek}
      onClick={seekChange}
      onMouseMove={showSeek}
      onMouseLeave={hideSeek}
      ref={progressBarElement}
    >
      <div className="progress-bar">
        <div
          className="loaded"
          style={{
            width: (progress / duration) * 100 + "%",
          }}
        ></div>
        <div
          className="seeked"
          style={{
            width: (seeking && seeking > played ? seeking : played) * 100 + "%",
          }}
        ></div>
        <div
          className="played"
          style={{
            width: (seeking && seeking > played ? played : seeking) * 100 + "%",
          }}
        ></div>
      </div>
    </div>
  );
};
export default ProgressBar;
