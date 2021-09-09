import { useEffect, useState } from "react";
import browser from "webextension-polyfill";

interface AccessToken {
  access_token: String;
}

const ACCESS_TOKEN_KEY = "access_token";

export function useAccessToken() {
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
    const values: AccessToken = { access_token: value };
    await browser.storage.local.set(values);
    setSaved(value);
  };

  return {
    accessToken: saved,
    setAccessToken: saveAsync,
    ready,
  };
}
