import React, { useCallback, useEffect, useState } from "react";
import { render } from "react-dom";
import { Octokit } from "@octokit/rest";
import { useForm } from "react-hook-form";

import "bootstrap/dist/css/bootstrap.min.css";

enum State {
  PENDING,
  READY,
  ERROR,
}

const RateLimit = ({ accessToken }) => {
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
    } finally {
    }
  }

  const handleClick = useCallback(() => fetchRateLimitAsync(), []);

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
      <div className="progress" onClick={handleClick}>
        <div
          className={classes.join(" ")}
          style={style}
          role="progressbar"
          aria-valuenow={ready ? percent : 100}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {error ? "error" : pending ? "loading..." : `${remaining} / ${limit}`}
        </div>
      </div>
      <div className="mt-2 text-muted">click to refresh</div>
    </div>
  );
};

type Options = {
  accessToken: String;
};

const Options = () => {
  const [accessToken, setAccessToken] = useState(null);
  const { register, handleSubmit } = useForm();
  const onSubmit = (data: Options) => setAccessToken(data.accessToken);
  return (
    <div className="container my-3">
      <h1>Awesome Stars</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input-group mt-4">
          <input
            type="text"
            className="form-control"
            placeholder="GitHub token"
            {...register("accessToken")}
          />
          <input type="submit" value="Update" className="btn btn-primary" />
        </div>
      </form>
      <div className="mt-4">
        <RateLimit accessToken={accessToken} />
      </div>
    </div>
  );
};

render(<Options />, document.getElementById("app"));
