import { styles } from "./contributeStyles.js";

// One labelled control, plus whatever help text and validation message belong
// to it. Presentational only: the parent owns the value, the change handler and
// the error string. Keeping the markup here means every field on the form is
// wired up the same way, and the error message always lands directly under the
// input it refers to.
//
// The message is rendered as a React child, never as HTML. Khmer titles and
// any other user-supplied text are therefore always text, never markup.
export default function EntryField({
  id,
  label,
  hint,
  error,
  required = false,
  options = null,
  ...inputProps
}) {
  // Controls share one style; an invalid one gets a red border and a warmer
  // background so the state is visible without relying on colour alone — the
  // message below it says what is wrong in words too.
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
        <select id={id} style={control} {...inputProps}>
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
        <input id={id} style={control} {...inputProps} />
      )}

      {hint ? <p style={styles.hint}>{hint}</p> : null}

      {/* role="alert" makes a screen reader announce the message the moment it
          appears, and aria-invalid tells assistive tech the control is in
          error. The two together are what make this accessible rather than
          just coloured red. */}
      {error ? (
        <p id={`${id}-error`} style={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}