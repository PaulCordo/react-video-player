import React, { useRef, useEffect, useState, useCallback } from "react";
import classnames from "classnames";
import Play from "./play";
import Volume from "./volume";
import FullScreen from "./fullscreen";
import ProgressBar from "./progress-bar";
import DisplayTime from "./display-time";
import "./videoPlayer.scss";
import { CSSTransition } from "react-transition-group";

const VideoPlayer = ({
  preload,
  poster,
  src,
  autoPlay,
  stop,
  forcePause,
  canPlay,
  ended,
  displayTime,
  className,
}) => {
  const [progress, setProgress] = useState(0),
    [loading, setLoading] = useState(false),
    [videoPlayerStyle, setVideoPlayerStyle] = useState({}),
    [paused, setPaused] = useState(true),
    [currentTime, setCurrentTime] = useState(0),
    [seeking, setSeeking] = useState(0),
    [duration, setDuration] = useState(0),
    [controls, setControls] = useState(false),
    [volumeChange, setVolumeChange] = useState(false),
    [unPlayed, setUnPlayed] = useState(true);

  const videoElement = useRef(),
    videoPlayerElement = useRef(),
    loaderIntervalID = useRef();

  const fourCount = useRef(0);

  // Play pause
  const play = useCallback(() => {
    setPaused(false);
    setUnPlayed(false);
    videoElement.current.play();
  }, []);

  const pause = useCallback(() => {
    setPaused(true);
    videoElement.current.pause();
  }, []);

  const changeCurrentTime = useCallback((time) => {
    setCurrentTime(time);
    videoElement.current.currentTime = time;
  }, []);

  const calculatePlayerSize = useCallback(() => {
    const boundingBox = videoPlayerElement.current.getBoundingClientRect(),
      dHeight = boundingBox.height,
      dWidth = boundingBox.width,
      vHeight = videoElement.current.videoHeight || 1080,
      vWidth = videoElement.current.videoWidth || 1920;
    if (vWidth && vHeight) {
      if (dWidth * vHeight > vWidth * dHeight) {
        // video height/width ratio is larger than wrapper, fix width
        setVideoPlayerStyle({ width: (vWidth * dHeight) / vHeight });
      } else {
        setVideoPlayerStyle({ height: (vHeight * dWidth) / vWidth });
      }
    }
  }, [videoElement]);

  const toggleControls = useCallback(() => {
    controls && window.clearTimeout(controls);
    setControls(
      window.setTimeout(() => {
        setControls(false);
      }, 3000)
    );
  }, [controls]);

  const togglePlay = useCallback(() => {
    toggleControls();
    if (paused) play();
    else pause();
  }, [toggleControls, paused, play, pause]);

  const keyboardControls = useCallback(
    (event) => {
      toggleControls();
      switch (event.key) {
        case " ":
          togglePlay();
          event.preventDefault();
          break;
        case "Escape":
          pause();
          break;
        case "ArrowLeft":
          if (currentTime >= 1) changeCurrentTime(currentTime - 1);
          break;
        case "ArrowRight":
          if (currentTime < duration - 1) changeCurrentTime(currentTime + 1);
          break;
        // no default
      }
    },
    [
      currentTime,
      duration,
      toggleControls,
      togglePlay,
      pause,
      changeCurrentTime,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", keyboardControls);
    window.addEventListener("resize", calculatePlayerSize);
    return () => {
      window.removeEventListener("keydown", keyboardControls);
      window.removeEventListener("resize", calculatePlayerSize);
    };
  }, [keyboardControls, calculatePlayerSize]);

  useEffect(() => {
    autoPlay ? play() : pause();
  }, [autoPlay, play, pause]);

  useEffect(() => {
    forcePause && pause();
  }, [forcePause, play, pause]);

  useEffect(() => {
    if (!paused) {
      calculatePlayerSize();
      setUnPlayed(false);
    }
  }, [paused, calculatePlayerSize, play]);

  useEffect(() => {
    if (videoElement.current && loading) {
      videoElement.current.load();
      calculatePlayerSize();
      loaderIntervalID.current = window.setInterval(() => {
        if (videoElement.current) {
          const duration = videoElement.current.duration,
            readyState = videoElement.current.readyState;
          if (readyState === 4) {
            fourCount.current++;
            if (progress > 0.9 * duration || fourCount.current >= 3) {
              setLoading(false);
              play();
              window.clearInterval(loaderIntervalID.current);
            }
          } else {
            fourCount.current = 0;
          }
        }
      }, 500);
    }
    return () => window.clearInterval(loaderIntervalID.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, progress, calculatePlayerSize]);

  return (
    <div
      className={classnames("video-player-wrapper", className)}
      onMouseMove={toggleControls}
      ref={videoPlayerElement}
    >
      <div className="video-player" style={videoPlayerStyle}>
        <CSSTransition in={poster && unPlayed} classNames="fade" timeout={250}>
          <div
            className="poster"
            onClick={() => (loading ? setLoading(true) : play())}
            style={{ backgroundImage: `url(${poster})` }}
          >
            <div
              className={classnames("play-launcher", {
                loading: loading,
              })}
            >
              <svg viewBox="-500 -500 1000 1000">
                <circle
                  stroke="white"
                  strokeWidth="40"
                  fill="none"
                  cx="0"
                  cy="0"
                  r="465"
                />
                <polygon fill="white" points="-101, 175 202, 0 -101 -175" />
              </svg>
            </div>
          </div>
        </CSSTransition>
        <video
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
          allowFullScreen
          preload={preload || "metadata"}
          onLoadedData={() => {
            calculatePlayerSize();
          }}
          onClick={togglePlay}
          onLoadedMetadata={() => {
            calculatePlayerSize();
            setDuration(videoElement.current.duration);
            setCurrentTime(videoElement.current.currentTime);
          }}
          onTimeUpdate={() => setCurrentTime(videoElement.current.currentTime)}
          onProgress={() =>
            setProgress(
              videoElement.current.buffered.length >= 1
                ? videoElement.current.buffered.end(
                    videoElement.current.buffered.length - 1
                  )
                : 0
            )
          }
          onCanPlay={() => {
            // Fix for webkit mobile browsers
            videoElement.current.muted = false;
            canPlay();
          }}
          onEnded={() => {
            pause();
            ended();
            changeCurrentTime(0);
          }}
          ref={videoElement}
        >
          {!stop && src && <source src={src} type="video/mp4" />}
        </video>
        <div
          className={classnames("controls", {
            hidden: !(paused || controls) || unPlayed || loading,
          })}
        >
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            progress={progress}
            seeking={seeking}
            setSeeking={setSeeking}
            toggleSeek={(on, currentTime) => {
              if (on) {
                pause();
              } else {
                changeCurrentTime(currentTime);
                toggleControls();
                play();
              }
            }}
          />
          <div className="controls-left">
            <Play togglePlay={togglePlay} paused={paused} />
            <Volume
              videoElement={videoElement}
              setVolumeChange={setVolumeChange}
              volumeChange={volumeChange}
            />
            {displayTime && (
              <DisplayTime
                time={seeking ? seeking * duration : currentTime}
                duration={duration}
              />
            )}
          </div>
          <div className="controls-right">
            <FullScreen
              videoPlayerElement={videoPlayerElement}
              videoElement={videoElement}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

VideoPlayer.defaultProps = {
  loading: () => {},
  canPlayThrough: () => {},
  canPlay: () => {},
  ended: () => {},
  qualities: [],
  time: true,
  play: false,
  stop: false,
  keyboardControls: true,
};

export default VideoPlayer;
