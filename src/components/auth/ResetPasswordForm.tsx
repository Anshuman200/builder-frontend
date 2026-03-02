"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { GlassInput } from "@/components/ui/glass/GlassInput";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassField, GlassError } from "@/components/ui/glass/GlassField";
import { FormHeading, GlassLink, PasswordField } from "./AuthShared";

export function ResetPasswordForm({ loginEmail, handleResetPassword, error, setTab, isLoading }: any) {
    const [globalError, setGlobalError] = useState(error);

    const form = useForm({
        defaultValues: {
            resetToken: "",
            newPassword: "",
        },
        onSubmit: async ({ value }) => {
            setGlobalError("");
            try {
                await handleResetPassword(loginEmail, value.resetToken, value.newPassword);
            } catch (err: any) {
                setGlobalError(err?.message || "Failed to reset password.");
            }
        },
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }} style={{ display: "flex", flexDirection: "column", gap: 18, animation: "tab-slide 0.2s ease" }}>
            <FormHeading
                title="Create new password"
                subtitle={`Enter the 6-digit code sent to ${loginEmail}`}
            />

            <form.Field
                name="resetToken"
                validators={{
                    onChange: ({ value }) => value.length !== 6 ? 'Token must be exactly 6 characters' : undefined,
                }}
                children={(field) => (
                    <GlassField label="Reset Code" htmlFor="resetToken">
                        <GlassInput
                            id="resetToken"
                            type="text"
                            required
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="123456"
                            maxLength={6}
                        />
                        {field.state.meta.errors && field.state.meta.errors.length > 0 && <GlassError message={field.state.meta.errors[0]?.toString() || ""} />}
                    </GlassField>
                )}
            />

            <form.Field
                name="newPassword"
                validators={{
                    onChange: ({ value }) => !value ? 'Password is required' : undefined,
                    onChangeAsyncDebounceMs: 300,
                    onChangeAsync: async ({ value }) => value.length < 8 ? 'Password must be at least 8 characters' : undefined,
                }}
                children={(field) => (
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        <PasswordField
                            id="new-password"
                            label="New Password"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                        {field.state.meta.errors && field.state.meta.errors.length > 0 && <GlassError message={field.state.meta.errors[0]?.toString() || ""} />}
                    </div>
                )}
            />

            {globalError && <GlassError message={globalError} />}

            <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                    <GlassButton type="submit" variant="primary" fullWidth loading={isLoading || isSubmitting} disabled={!canSubmit} loadingLabel="Resetting…">
                        Reset password
                    </GlassButton>
                )}
            />

            <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                <GlassLink onClick={() => setTab("login")}>← Back to login</GlassLink>
            </p>
        </form>
    );
}
