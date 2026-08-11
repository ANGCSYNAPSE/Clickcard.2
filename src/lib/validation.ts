import * as Yup from "yup";

export const emailSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

export const credentialSchema = Yup.object({
  credential: Yup.string()
    .trim()
    .required("Enter your email or username"),
});

export const otpSchema = Yup.object({
  otp: Yup.string()
    .matches(/^\d{6}$/, "Enter the 6-digit code")
    .required("OTP is required"),
});

export const usernameSchema = Yup.object({
  username: Yup.string()
    .trim()
    .matches(
      /^[a-zA-Z0-9_]{3,20}$/,
      "3–20 characters, letters, numbers & underscores only",
    )
    .required("Username is required"),
  referralCode: Yup.string().trim().optional(),
});

export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
