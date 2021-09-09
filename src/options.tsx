import React, { useContext, useEffect, useState } from "react";
import { render } from "react-dom";
import { Octokit } from "@octokit/rest";
import { useForm } from "react-hook-form";
import browser from "webextension-polyfill";

import "bootstrap/dist/css/bootstrap.min.css";

const accessToken = {
  accessToken: null,
  ready: false,
  setAccessToken: async (_value: String) => {},
};

const AccessTokenContext = React.createContext(accessToken);

const ACCESS_TOKEN_KEY = "access_token";

type AccessToken = {
  access_token?: String;
};

function useAccessToken() {
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(null);

  async function loadAsync() {
    setReady(false);
    try {
      const { access_token: accessToken }: AccessToken =
        await browser.storage.local.get([ACCESS_TOKEN_KEY]);
      setSaved(accessToken);
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    loadAsync();
    return () => {};
  }, []);

  const saveAsync = async (value: String) => {
    const values: AccessToken = {};
    values[ACCESS_TOKEN_KEY] = value;
    await browser.storage.local.set(values);
    setSaved(value);
  };

  return {
    accessToken: saved,
    setAccessToken: saveAsync,
    ready,
  };
}

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
          {error ? "error" : pending ? "loading..." : `${remaining} / ${limit}`}
        </div>
      </div>
      <div className="mt-2 text-muted">click to refresh</div>
    </div>
  );
};

type OptionFormData = {
  accessToken: String;
};

const OptionForm = () => {
  const { accessToken, setAccessToken } = useContext(AccessTokenContext);
  const { register, handleSubmit } = useForm();
  const onSubmit = (data: OptionFormData) => setAccessToken(data.accessToken);
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="input-group mt-4">
        <input
          type="text"
          className="form-control"
          placeholder="GitHub token"
          defaultValue={accessToken}
          {...register("accessToken")}
        />
        <input type="submit" value="Update" className="btn btn-primary" />
      </div>
    </form>
  );
};

const Spinner = () => (
  <div className="spinner-border" role="status">
    <span className="sr-only">Loading...</span>
  </div>
);

const Options = () => {
  const { accessToken, ready } = useContext(AccessTokenContext);
  return (
    <div className="container my-3">
      <h1>Awesome Stars</h1>
      {!ready && <Spinner />}
      {ready && <OptionForm />}
      <div className="mt-4">
        {ready && <RateLimit accessToken={accessToken} />}
      </div>
    </div>
  );
};

const OptionsInContext = () => {
  const value = useAccessToken();
  return (
    <AccessTokenContext.Provider value={value}>
      <Options />
    </AccessTokenContext.Provider>
  );
};

render(<OptionsInContext />, document.getElementById("app"));
