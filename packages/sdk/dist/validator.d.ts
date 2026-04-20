import type { StandardSchemaV1 } from "@standard-schema/spec";
export declare function validate<T extends StandardSchemaV1>(
  schema: T,
  input: StandardSchemaV1.InferInput<T>,
): StandardSchemaV1.InferOutput<T>;
export declare class ValidationError extends Error {
  issues: readonly StandardSchemaV1.Issue[];
  constructor(issues: readonly StandardSchemaV1.Issue[]);
}
//# sourceMappingURL=validator.d.ts.map
