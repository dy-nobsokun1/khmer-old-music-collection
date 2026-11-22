import LoginForm from "../../components/LoginForm.js";

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const email = typeof params?.email === "string" ? params.email.trim().slice(0, 254) : "";
  // A different account starts a fresh form, including an empty password field.
  return <LoginForm key={email} initialEmail={email} />;
}
