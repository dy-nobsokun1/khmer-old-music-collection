"use client";
import { useState } from "react";
import { useTranslation } from "./LanguageProvider.js";

export default function FilePicker({ id, accept, onChange, style }) {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState("");
  return (
    <div className="file-picker" style={{ ...style, position: "relative", overflowWrap: "anywhere" }}>
      <span style={{ color: "#A65A3C", marginRight: 12 }}>{t("Choose photo")}</span>
      <span>{fileName || t("No photo selected")}</span>
      <input id={id} type="file" accept={accept}
        style={{ position: "absolute", inset: 0, width: "100%", opacity: 0, cursor: "pointer" }}
        onChange={(event) => {
          setFileName(event.target.files?.[0]?.name || "");
          onChange(event);
        }} />
    </div>
  );
}
