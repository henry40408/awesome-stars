import React, { useContext, useState } from "react";
import { render } from "react-dom";
import { useForm } from "react-hook-form";

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
      <label>
        <strong>Access Token</strong>
      </label>{" "}
      <input
        type="text"
        placeholder="GitHub token"
        defaultValue={accessToken}
        {...register("accessToken")}
      />
      <input type="submit" value="Update" disabled={loading} />
      <p>
        You can{" "}
        <a href="https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token">
          create a personal token on GitHub
        </a>
        .
      </p>
    </form>
  );
};

const Spinner = () => (
  <>
    <span>Loading...</span>
  </>
);

const OptionsStyles = {
  margin: "1rem",
};
const Options = () => {
  const { ready } = useContext(AccessTokenContext);
  return (
    <div style={OptionsStyles}>
      <h1>Awesome Stars</h1>
      {!ready && <Spinner />}
      {ready && <OptionForm />}
      <div>{ready && <RateLimit />}</div>
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
