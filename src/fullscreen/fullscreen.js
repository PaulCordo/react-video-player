import React, { useEffect, useState } from "react";
import classnames from "classnames";

const requestFullscreen = (() => {
  if (document.documentElement.requestFullscreen) {
    return (videoPlayerElement) => {
      videoPlayerElement.requestFullscreen();
    };
  } else if (document.documentElement.msRequestFullscreen) {
    return function (videoPlayerElement) {
      videoPlayerElement.msRequestFullscreen();
    };
  } else if (document.documentElement.mozRequestFullScreen) {
    return (videoPlayerElement) => {
      videoPlayerElement.mozRequestFullScreen();
    };
  } else if (document.documentElement.webkitRequestFullscreen) {
    return (videoPlayerElement) => {
      videoPlayerElement.webkitRequestFullscreen(
        videoPlayerElement.ALLOW_KEYBOARD_INPUT
      );
    };
  }
})();
document.exitFullscreen = (() =>
  document.exitFullscreen ||
  document.msExitFullscreen ||
  document.mozCancelFullScreen ||
  document.webkitExitFullscreen)();

const FullScreen = ({ videoPlayerElement, videoElement }) => {
  const [fullScreen, setFullScreen] = useState(false);
  const keyboardControls = (event) => {
    event.key === "f" && onFullscreen();
  };

  const onFullscreen = () => {
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      setFullScreen(true);
      requestFullscreen(videoPlayerElement.current);
    } else {
      setFullScreen(false);
      document.exitFullscreen();
    }
  };

  const onFullscreenExit = () => {
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    )
      setFullScreen(false);
  };
  useEffect(() => {
    const currentVideoElement = videoElement.current;
    if (currentVideoElement) {
      const ended = () => {
        if (
          document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
        ) {
          setFullScreen(false);
          document.exitFullscreen();
        }
      };
      currentVideoElement.addEventListener("ended", ended);
      currentVideoElement.addEventListener("dblclick", onFullscreen);
      return () => {
        currentVideoElement.removeEventListener("ended", ended);
        currentVideoElement.removeEventListener("dblclick", onFullscreen);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoElement]);

  useEffect(() => {
    window.addEventListener("keydown", keyboardControls);
    document.addEventListener("mozfullscreenchange", onFullscreenExit);
    document.addEventListener("webkitfullscreenchange", onFullscreenExit);
    document.addEventListener("fullscreenchange", onFullscreenExit);
    return () => {
      window.removeEventListener("keydown", keyboardControls);
      document.removeEventListener("mozfullscreenchange", onFullscreenExit);
      document.removeEventListener("webkitfullscreenchange", onFullscreenExit);
      document.removeEventListener("fullscreenchange", onFullscreenExit);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      className={classnames("fullscreen", { full: fullScreen })}
      onClick={onFullscreen}
    >
      <svg viewBox="294 278 611 444">
        {fullScreen ? (
          <g fill="#FFF">
            <path d="M461 278h-83v83h-83v83h166V278zM906 444v-83h-84v-83h-83v166h167zM906 639v-83H739v166h83v-83h84zM378 722h83V556H294v83h84v83z" />
          </g>
        ) : (
          <g fill="#FFF">
            <path d="M294 444h84v-83h83v-83H294v166zM739 278v83h83v83h83V278H739zM739 639v83h167V556h-84v83h-83zM378 556h-83v166h166v-83h-83v-83z" />
          </g>
        )}
      </svg>
    </div>
  );
};
export default FullScreen;
