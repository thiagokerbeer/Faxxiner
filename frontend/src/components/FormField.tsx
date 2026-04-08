import { cloneElement, isValidElement, type ReactElement } from "react";

type ControlProps = {
  id?: string;
  className?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  optional?: boolean;
  invalid?: boolean;
  children: ReactElement<ControlProps>;
};

export function FormField({ id, label, hint, optional, invalid, children }: FormFieldProps) {
  if (!isValidElement(children)) {
    throw new Error("FormField requires a single input or textarea child");
  }
  const hintId = `${id}-hint`;
  const prevClass = typeof children.props.className === "string" ? children.props.className : "";
  const control = cloneElement(children, {
    id,
    className: ["field-input", prevClass].filter(Boolean).join(" "),
    "aria-describedby": hint ? hintId : undefined,
    "aria-invalid": invalid ? true : undefined,
  });

  return (
    <div className="field">
      <div className="field-label-row">
        <label htmlFor={id} className="field-label-text">
          {label}
        </label>
        {optional ? (
          <span className="field-optional-badge" aria-hidden>
            Opcional
          </span>
        ) : null}
      </div>
      {hint ? (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      ) : null}
      {control}
    </div>
  );
}
