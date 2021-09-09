import React from "react";

const accessToken = {
  accessToken: null,
  ready: false,
  setAccessToken: async (_value: String) => {},
};

export const AccessTokenContext = React.createContext(accessToken);
