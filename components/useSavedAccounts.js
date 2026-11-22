"use client";
import { useEffect, useState } from "react";
import { SAVED_ACCOUNTS_KEY, readSavedAccounts, rememberAccount, forgetAccount } from "../utils/savedAccounts.js";

export default function useSavedAccounts(email) {
  const [accounts, setAccounts] = useState([]);
  useEffect(() => {
    setAccounts(rememberAccount(email));
    function sync(event) {
      if (event.key === SAVED_ACCOUNTS_KEY || event.key === null) setAccounts(readSavedAccounts());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [email]);

  function forget(emailToForget) {
    setAccounts(forgetAccount(emailToForget));
  }

  const visible = email
    ? [email, ...accounts.filter((other) => other.toLowerCase() !== email.toLowerCase())]
    : accounts;
  return { accounts: visible, forget };
}
