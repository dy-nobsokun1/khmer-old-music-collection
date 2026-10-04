import { styles } from "./contributeStyles.js";

// One labelled control, plus whatever help text and validation message belong
// to it. Presentational only: the parent owns the value, the change handler and
// the error string.
//
// Props are named explicitly rather than spread through, so a field descriptor
// can be data-driven without leaking input-only attributes (maxLength, type,
// accept) onto a <select>, where React would warn about unknown DOM props.
//
// The message is rendered as a React child, never as HTML. Khmer titles and any
// other user-supplied text are therefore always text, never markup.
export default function EntryField({
  id,
  label,
  hint,
  error,
  required = false,
  options = null,
  type = "text",
  value = "",
  onChange,
  maxLength,
  placeholder,
  inputMode,
  accept,
}) {
  // An invalid control gets a red border and a warmer background, so the state
  // is visible without relying on colour alone — the message below it also says
  // what is wrong, in words.
  const control = error
    ? { ...styles.control, ...styles.invalid }
    : styles.control;

  return (
    <div style={styles.field}>
      <label htmlFor={id} style={styles.label}>
        {label}
        {required ? (
          <span style={styles.required} aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>

      {options ? (
        <select id={id} value={value} onChange={onChange} style={control}>
          {/* A real empty option rather than a placeholder attribute, so the
              "not chosen yet" state is a value the form can actually test. */}
          <option value="">Choose…</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          placeholder={placeholder}
          inputMode={inputMode}
          accept={accept}
          style={control}
        />
      )}

      {hint ? <p style={styles.hint}>{hint}</p> : null}

      {/* role="alert" makes a screen reader announce the message the moment it
          appears. That plus the wording of the message is what makes this
          accessible rather than just coloured red. */}
      {error ? (
        <p id={`${id}-error`} style={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}