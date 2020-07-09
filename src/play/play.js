import React from "react";

const Play = ({ togglePlay, paused }) => {
  return (
    <div className="play" onClick={togglePlay}>
      <svg viewBox="0 0 500 500">
        {paused ? (
          <path fill="#FFF" d="M35 0v497l430-248z" />
        ) : (
          <g fill="#FFF">
            <path d="M60 0h128v499H60zM313 0h128v499H313z" />
          </g>
        )}
      </svg>
    </div>
  );
};
export default Play;
