export function validate(schema, input) {
  let result = schema["~standard"].validate(input);
  if (result instanceof Promise) {
    throw new TypeError("Schema validation must be synchronous");
  }
  if (result.issues) {
    throw new ValidationError(result.issues);
  }
  return result.value;
}
export class ValidationError extends Error {
  issues;
  constructor(issues) {
    super(issues[0].message);
    this.issues = issues;
    this.name = "ValidationError";
    this.issues = issues;
  }
}
//# sourceMappingURL=validator.js.map
