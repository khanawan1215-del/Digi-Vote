"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { authService } from "@/lib/api/auth.service";
import { AxiosError } from "axios";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface ForgotPasswordForm {
    email: string;
}

export default function ForgotPasswordPage() {
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordForm>();

    const onSubmit = async (data: ForgotPasswordForm) => {
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const res = await authService.requestPasswordReset(data.email);
            setSuccess(res.message);
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || "Failed to send reset email.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed to send reset email.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>

            {error && <Alert variant="error">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Email"
                    placeholder="your email"
                    {...register("email", { required: "Email is required" })}
                    error={errors.email?.message}
                />

                <Button type="submit" isLoading={isLoading} className="w-full">
                    Send Reset Link
                </Button>
            </form>
        </div>
    );
}
