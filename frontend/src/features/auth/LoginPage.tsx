// LoginPage.tsx (replacement component body)
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// import api from "../../lib/api/axios";

import { getApiErrorMessage } from "../../lib/api/getApiErrorMessage";
import { login } from "../../lib/api/auth";

const LoginSchema = z.object({
  // ensure that user enters a valid email
  email: z.string().trim().email("Please enter a valid email address."),
  // password must be at least 6 characters long
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type LoginValues = z.infer<typeof LoginSchema>;

export default function LoginForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      const res = await login(values.email, values.password, "local");
      // const res = await api.post("/api/auth/login", {
      //   ...values,
      //   provider: "local",
      // });

      // console.log("LoginPage: res = ", res);
      /*
      Structure of the response
      res = {
        "message": "User has been logged in.",
        "user": {
          "id": 1,
          "name": "Test User",
          "email": "testuser@gmail.com",
          "password_hash": "$2b$10$W4VUa/AexEfINvm4jnmdrOS.k/An48JU9bJIQ/zS.81nnI50t6QUq",
          "provider": "local",
          "provider_id": "",
          "created_at": "2025-07-25T20:01:06.398Z",
          "updated_at": "2025-07-25T20:01:06.398Z"
        },
        "token": "example token here"
      }
      */
      localStorage.setItem("token", res.token);
      navigate("/dashboard");
    } catch (err: any) {
      // Retreive custom error message from backend
      setError("root", { message: getApiErrorMessage(err) });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 px-4">
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-lg rounded-xl bg-white/5 p-6 shadow-xl ring-1 ring-white/10"
      >
        <h1 className="text-3xl font-bold text-white mb-4">Login</h1>

        {/* Server/global error */}
        {"root" in errors && errors.root?.message && (
          <div
            role="alert"
            aria-live="assertive"
            className="rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 mb-4 text-sm shadow-sm"
          >
            <strong className="font-semibold">There was a problem:</strong>
            <div className="mt-1">{errors.root.message}</div>
          </div>
        )}

        {/* Email */}
        <div className="field">
          <label
            style={{ color: "white" }}
            className="label"
            htmlFor="login-email"
          >
            Email
          </label>
          <input
            id="login-email"
            style={{ color: "#111827" }}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="e.g., john.doe@email.com"
            className={`input ${errors.email ? "input--error" : ""}`}
            {...register("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "login-email-error" : undefined}
          />
          {errors.email && (
            <div id="login-email-error" className="error">
              {errors.email.message?.toString()}
            </div>
          )}
        </div>

        {/* Password */}
        <div className="field">
          <label
            style={{ color: "white" }}
            className="label"
            htmlFor="login-password"
          >
            Password
          </label>
          <input
            id="login-password"
            style={{ color: "#111827" }}
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            className={`input ${errors.password ? "input--error" : ""}`}
            {...register("password")}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
          />
          {errors.password && (
            <div id="login-password-error" className="error">
              {errors.password.message?.toString()}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-5 w-full px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
