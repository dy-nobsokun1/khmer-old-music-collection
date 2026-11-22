const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const { transform } = require("next/dist/build/swc");

// Load the actual handlers with Supabase mocked. No accounts or emails are created.
async function load(file, mocks) {
  const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
  const { code } = await transform(source, {
    filename: file,
    jsc: {
      parser: { syntax: "ecmascript", jsx: true },
      transform: { react: { runtime: "automatic" } },
    },
    module: { type: "commonjs" },
  });
  const module = { exports: {} };
  vm.runInNewContext(code, {
    module, exports: module.exports, URL, process,
    console: { error() {} },
    require: (name) => {
      if (name === "react/jsx-runtime") return require(name);
      assert.ok(Object.hasOwn(mocks, name), `Unexpected import: ${name}`);
      return mocks[name];
    },
  });
  return module.exports;
}

async function confirm(query, user, { exchangeError = null, userError = null } = {}) {
  const calls = [];
  const route = await load("app/auth/confirm/route.js", {
    "next/server": { NextResponse: { redirect: (url) => new URL(url) } },
    "../../../utils/supabase/server.js": { createClient: async () => ({ auth: {
      exchangeCodeForSession: async () => {
        calls.push("exchange");
        return { error: exchangeError };
      },
      getUser: async () => {
        calls.push("getUser");
        return { data: { user }, error: userError };
      },
      signOut: async ({ scope }) => { calls.push(`signOut:${scope}`); },
    } }) },
  });
  const result = await route.GET({ url: `https://archive.example/auth/confirm${query}` });
  return { result, calls };
}

const confirmed = { email_confirmed_at: "2026-01-01T00:00:00Z" };
const failedPath = "/login?error=email_confirmation";

async function attemptLogin(response) {
  const state = [], calls = [];
  let cursor = 0;
  const form = await load("components/LoginForm.js", {
    react: { useState: (initial) => {
      const index = cursor++;
      if (!(index in state)) state[index] = initial;
      return [state[index], (value) => { state[index] = value; }];
    } },
    "next/navigation": { useRouter: () => ({
      push: () => calls.push("navigate"), refresh: () => calls.push("refresh"),
    }) },
    "./AuthCard.js": { default: () => null },
    "./LanguageProvider.js": { useTranslation: () => ({ t: (text) => text }) },
    "../utils/savedAccounts.js": { rememberAccount: () => calls.push("remember") },
    "../utils/supabase/client.js": { createClient: () => ({ auth: {
      signInWithPassword: async () => response,
      signOut: async () => { calls.push("signOut"); },
    } }) },
  });
  await form.default({}).props.onSubmit("unused@example.invalid", "");
  cursor = 0;
  return { error: form.default({}).props.error, calls };
}

test("Supabase email-not-confirmed errors cannot sign in or remember the account", async () => {
  const { error, calls } = await attemptLogin({ data: {}, error: { code: "email_not_confirmed" } });
  assert.equal(error, "Confirm your email before signing in.");
  assert.deepEqual(calls, []);
});

test("even an unexpected successful login response must contain a verified email", async () => {
  const { error, calls } = await attemptLogin({ data: { user: { email_confirmed_at: null } }, error: null });
  assert.equal(error, "Confirm your email before signing in.");
  assert.deepEqual(calls, ["signOut"]);
});

test("wrong credentials cannot sign in", async () => {
  const { error, calls } = await attemptLogin({ data: {}, error: { code: "invalid_credentials" } });
  assert.equal(error, "Invalid email or password");
  assert.deepEqual(calls, []);
});

test("a confirmed account can sign in", async () => {
  const { error, calls } = await attemptLogin({ data: { user: confirmed }, error: null });
  assert.equal(error, "");
  assert.deepEqual(calls, ["remember", "navigate", "refresh"]);
});

test("opening the callback without an email code cannot confirm an account", async () => {
  const { result, calls } = await confirm("?email_confirmed_at=true", confirmed);
  assert.equal(result.pathname + result.search, failedPath);
  assert.deepEqual(calls, []);
});

test("a rejected or reused email code cannot create a session", async () => {
  const { result, calls } = await confirm("?code=invalid", confirmed, {
    exchangeError: { code: "flow_state_not_found", message: "Invalid code" },
  });
  assert.equal(result.pathname + result.search, failedPath);
  assert.deepEqual(calls, ["exchange"]);
});

for (const user of [null, { email_confirmed_at: null }, { user_metadata: { email_verified: true } }]) {
  test(`callback rejects an unconfirmed user: ${JSON.stringify(user)}`, async () => {
    const { result, calls } = await confirm("?code=test-code", user);
    assert.equal(result.pathname + result.search, failedPath);
    assert.deepEqual(calls, ["exchange", "getUser", "signOut:local"]);
  });
}

test("callback rejects a failed server verification, even with cached user data", async () => {
  const { result, calls } = await confirm("?code=test-code", confirmed, {
    userError: { message: "User verification failed" },
  });
  assert.equal(result.pathname + result.search, failedPath);
  assert.ok(calls.includes("signOut:local"));
});

test("only a code accepted by Supabase and a confirmed user can proceed", async () => {
  const { result, calls } = await confirm("?code=test-code&next=/my-entries", confirmed);
  assert.equal(result.href, "https://archive.example/my-entries");
  assert.deepEqual(calls, ["exchange", "getUser"]);
});

for (const next of ["https://other.example", "//other.example", "@other.example", "/\\other.example", "http://["]) {
  test(`confirmation cannot redirect to another website: ${next}`, async () => {
    const { result } = await confirm(`?code=test-code&next=${encodeURIComponent(next)}`, confirmed);
    assert.equal(result.origin, "https://archive.example");
  });
}

for (const user of [null, confirmed, { email_confirmed_at: null }]) {
  test(`refresh checks confirmation: ${JSON.stringify(user)}`, async () => {
    const requestCookies = new Map([["session", "existing-session"]]);
    const responseCookies = new Map();
    let signedOut = false;
    const middleware = await load("middleware.js", {
      "@supabase/ssr": { createServerClient: (url, key, { cookies }) => ({ auth: {
        getUser: async () => ({ data: { user } }),
        signOut: async ({ scope }) => {
          assert.equal(scope, "local");
          signedOut = true;
          cookies.setAll([{ name: "session", value: "", options: { maxAge: 0 } }]);
        },
      } }) },
      "next/server": { NextResponse: { next: () => ({
        cookies: { set: (name, value) => responseCookies.set(name, value) },
      }) } },
    });
    await middleware.middleware({ cookies: {
      getAll: () => [...requestCookies].map(([name, value]) => ({ name, value })),
      set: (name, value) => requestCookies.set(name, value),
    } });
    assert.equal(signedOut, Boolean(user && !user.email_confirmed_at));
    if (signedOut) {
      assert.equal(requestCookies.get("session"), "");
      assert.equal(responseCookies.get("session"), "");
    }
  });
}
