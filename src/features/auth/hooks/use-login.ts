import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../api/auth.service";
import { LoginFormData } from "../schemas/auth.schema";
import { LoginResponse } from "../types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ROUTES } from "@/constants/routes";

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation<LoginResponse, Error, LoginFormData>({
    mutationFn: (data: LoginFormData) => Promise.resolve(authService.login(data.email, data.password, data.rememberMe)),
    onSuccess: (result: LoginResponse) => {
      if (result.success && result.user) {
        toast.success("Welcome back!", {
          description: "You have successfully logged in.",
        });
        navigate(ROUTES.DASHBOARD);
      } else {
        toast.error("Login Failed", {
          description: result.error || "Invalid credentials",
        });
      }
    },
    onError: (error: any) => {
      toast.error("An error occurred", {
        description: error.message || "Failed to connect to server",
      });
    },
  });
};
