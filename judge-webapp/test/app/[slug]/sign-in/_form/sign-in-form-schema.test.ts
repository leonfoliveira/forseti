import { signInFormSchema } from "@/app/[slug]/sign-in/_form/sign-in-form-schema";

describe("signInFormSchema", () => {
  describe("valid data", () => {
    it("should validate when both login and password are provided", () => {
      const validData = {
        login: "testuser",
        password: "testpassword",
      };

      const { error } = signInFormSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with special characters in login", () => {
      const validData = {
        login: "test.user+123@example.com",
        password: "testpassword",
      };

      const { error } = signInFormSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it("should validate with complex password", () => {
      const validData = {
        login: "testuser",
        password: "ComplexP@ssw0rd!123",
      };

      const { error } = signInFormSchema.validate(validData);
      expect(error).toBeUndefined();
    });
  });

  describe("invalid data", () => {
    it("should fail validation when login is missing", () => {
      const invalidData = {
        password: "testpassword",
      };

      const { error } = signInFormSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["login"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].sign-in._form.sign-in-form-schema.login-required",
      );
    });

    it("should fail validation when login is empty string", () => {
      const invalidData = {
        login: "",
        password: "testpassword",
      };

      const { error } = signInFormSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["login"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].sign-in._form.sign-in-form-schema.login-required",
      );
    });

    it("should fail validation when password is missing", () => {
      const invalidData = {
        login: "testuser",
      };

      const { error } = signInFormSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["password"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].sign-in._form.sign-in-form-schema.password-required",
      );
    });

    it("should fail validation when password is empty string", () => {
      const invalidData = {
        login: "testuser",
        password: "",
      };

      const { error } = signInFormSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["password"]);
      expect(error?.details[0].message).toBe(
        "app.[slug].sign-in._form.sign-in-form-schema.password-required",
      );
    });

    it("should fail validation when both login and password are missing", () => {
      const invalidData = {};

      const { error } = signInFormSchema.validate(invalidData, {
        abortEarly: false,
      });
      expect(error).toBeDefined();
      expect(error?.details).toHaveLength(2);

      const paths = error?.details.map((detail) => detail.path[0]);
      expect(paths).toContain("login");
      expect(paths).toContain("password");
    });

    it("should fail validation when both login and password are empty strings", () => {
      const invalidData = {
        login: "",
        password: "",
      };

      const { error } = signInFormSchema.validate(invalidData, {
        abortEarly: false,
      });
      expect(error).toBeDefined();
      expect(error?.details).toHaveLength(2);

      const paths = error?.details.map((detail) => detail.path[0]);
      expect(paths).toContain("login");
      expect(paths).toContain("password");
    });

    it("should not allow additional properties", () => {
      const invalidData = {
        login: "testuser",
        password: "testpassword",
        extraField: "not allowed",
      };

      const { error } = signInFormSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].message).toContain("not allowed");
    });
  });

  describe("type validation", () => {
    it("should fail validation when login is not a string", () => {
      const invalidData = {
        login: 123,
        password: "testpassword",
      };

      const { error } = signInFormSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["login"]);
    });

    it("should fail validation when password is not a string", () => {
      const invalidData = {
        login: "testuser",
        password: 123,
      };

      const { error } = signInFormSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toEqual(["password"]);
    });
  });
});
