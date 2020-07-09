import React from "react";

// Time display
const displayTime = (seconds, totalDuration) => {
  const twoDigits = (int) => {
    if (int <= 9) int = "0" + int;
    return int;
  };
  let minutes =
      totalDuration >= 600
        ? twoDigits(Math.floor(seconds / 60))
        : Math.floor(seconds / 60),
    hours;
  seconds = twoDigits(Math.floor(seconds % 60));
  if (minutes > 60) {
    hours = Math.floor(minutes / 60);
    minutes = twoDigits(Math.floor(minutes % 60));
  } else if (totalDuration > 3600) {
    hours = "0";
  }
  const timeArray = [minutes, seconds];
  hours && timeArray.unshift(hours);
  return timeArray.join(":");
};
const DisplayTime = ({ time, duration }) => {
  return (
    time && (
      <div className="time">
        <span className="current-time">{displayTime(time, duration)}</span>
        <span className="duration">{displayTime(duration)}</span>
      </div>
    )
  );
};
export default DisplayTime;
