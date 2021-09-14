import React, { useContext, useEffect, useState } from "react";

import { Octokit } from "@octokit/rest";

import { AccessTokenContext } from "./AccessTokenContext";

enum State {
  PENDING,
  READY,
  ERROR,
}

const formatter = new Intl.NumberFormat("en-US");

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
  const error = State.ERROR === state;

  const remainingF = formatter.format(remaining);
  const limitF = formatter.format(limit);
  return (
    <p>
      <strong>Rate limit</strong>{" "}
      {error ? "error" : pending ? "loading..." : `${remainingF} / ${limitF}`}{" "}
      <a href="#" onClick={fetchRateLimitAsync}>
        refresh
      </a>
    </p>
  );
};
