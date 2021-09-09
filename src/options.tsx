import React, { useContext, useState } from "react";
import { render } from "react-dom";
import { useForm } from "react-hook-form";

import "bootstrap/dist/css/bootstrap.min.css";

import { AccessTokenContext } from "./components/AccessTokenContext";
import { useAccessToken } from "./components/useAccessToken";
import { RateLimit } from "./components/RateLimit";

interface FormData {
  accessToken: String;
}

const OptionForm = () => {
  const [loading, setLoading] = useState(false);
  const { accessToken, setAccessToken } = useContext(AccessTokenContext);
  const { register, handleSubmit } = useForm();
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      await setAccessToken(data.accessToken);
    } finally {
      setLoading(false);
    }
  };
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
        <input
          type="submit"
          value="Update"
          className="btn btn-primary"
          disabled={loading}
        />
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
  const { ready } = useContext(AccessTokenContext);
  return (
    <div className="container my-3">
      <h1>Awesome Stars</h1>
      {!ready && <Spinner />}
      {ready && <OptionForm />}
      <div className="mt-4">{ready && <RateLimit />}</div>
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
