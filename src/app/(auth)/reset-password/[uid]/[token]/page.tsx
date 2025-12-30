"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { authService } from "@/lib/api/auth.service";
import { AxiosError } from "axios";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface ResetPasswordForm {
    password: string;
}

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useParams();
    const uid = params.uid as string;
    const token = params.token as string;

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>();

    const onSubmit = async (data: ResetPasswordForm) => {
        setError("");
        setSuccess("");
        setIsLoading(true);

        try {
            const res = await authService.confirmPasswordReset(uid, token, data.password);
            setSuccess(res.message);
            setTimeout(() => router.push("/login"), 2000);
        } catch (err: unknown) {
            if (err instanceof AxiosError) {
                setError(err.response?.data?.message || "Failed to reset password.");
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Failed to reset password.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Set New Password</h2>

            {error && <Alert variant="error">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="New Password"
                    type="password"
                    placeholder="••••••••"
                    {...register("password", { required: "Password is required" })}
                    error={errors.password?.message}
                />

                <Button type="submit" isLoading={isLoading} className="w-full">
                    Reset Password
                </Button>
            </form>
        </div>
    );
}
