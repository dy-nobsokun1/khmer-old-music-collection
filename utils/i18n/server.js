import { cookies } from "next/headers";
import { translate } from "./translate.js";

export async function getLanguage() {
  return (await cookies()).get("archive-language")?.value === "km" ? "km" : "en";
}

export async function getTranslation() {
  const language = await getLanguage();
  return { language, t: (text, values) => translate(text, language, values) };
}
