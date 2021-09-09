import React, { useContext, useEffect, useState } from "react";

import { Octokit } from "@octokit/rest";

import { AccessTokenContext } from "./AccessTokenContext";

enum State {
  PENDING,
  READY,
  ERROR,
}

export const RateLimit = () => {
  const { accessToken } = useContext(AccessTokenContext);

  const [limit, setLimit] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [state, setState] = useState(State.PENDING);

  async function fetchRateLimitAsync() {
    setState(State.PENDING);
    const options = accessToken ? { auth: accessToken } : {};
    const octokit = new Octokit(options);
    try {
      const response = await octokit.rest.rateLimit.get();
      const { limit, remaining } = response.data.rate;
      setLimit(limit);
      setRemaining(remaining);
      setState(State.READY);
    } catch (e) {
      console.error(e);
      setState(State.ERROR);
    }
  }

  useEffect(() => {
    fetchRateLimitAsync();
    return () => {};
  }, [accessToken]);

  const pending = State.PENDING === state;
  const ready = State.READY === state;
  const error = State.ERROR === state;

  let classes = ["progress-bar"];
  if (pending) {
    classes = [
      ...classes,
      "bg-info",
      "progress-bar-striped",
      "progress-bar-animated",
    ];
  } else if (ready) {
    classes = [...classes, "bg-success"];
  } else if (error) {
    classes = [...classes, "bg-danger"];
  }

  const percent = Math.floor((remaining / limit) * 100.0);
  const style = { width: ready ? `${percent}%` : "100%" };
  return (
    <div className="mt-4">
      <div className="progress" onClick={fetchRateLimitAsync}>
        <div
          className={classes.join(" ")}
          style={style}
          role="progressbar"
          aria-valuenow={ready ? percent : 100}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {error
            ? "error"
            : pending
            ? "loading..."
            : `${remaining} / ${limit} (click to refresh)`}
        </div>
      </div>
    </div>
  );
};
