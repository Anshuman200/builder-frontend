"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { GlassInput } from "@/components/ui/glass/GlassInput";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassField, GlassError } from "@/components/ui/glass/GlassField";
import { FormHeading, GlassLink } from "./AuthShared";

export function ForgotPasswordForm({ handleForgotPassword, error, setTab, isLoading }: any) {
    const [globalError, setGlobalError] = useState(error);

    const form = useForm({
        defaultValues: {
            email: "",
        },
        onSubmit: async ({ value }) => {
            setGlobalError("");
            try {
                await handleForgotPassword(value.email);
            } catch (err: any) {
                setGlobalError(err?.message || "Failed to send reset link.");
            }
        },
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }} style={{ display: "flex", flexDirection: "column", gap: 18, animation: "tab-slide 0.2s ease" }}>
            <FormHeading
                title="Reset your password"
                subtitle="Enter your email to receive a reset code"
            />

            <form.Field
                name="email"
                validators={{
                    onChange: ({ value }) => !value ? 'Email is required' : undefined,
                    onBlur: ({ value }) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' : undefined,
                }}
                children={(field) => (
                    <GlassField label="Email" htmlFor="forgot-email">
                        <GlassInput
                            id="forgot-email"
                            type="email"
                            required
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="you@example.com"
                            icon={<EnvelopeIcon style={{ width: 15, height: 15 }} />}
                        />
                        {field.state.meta.errors && field.state.meta.errors.length > 0 && <GlassError message={field.state.meta.errors[0]?.toString() || ""} />}
                    </GlassField>
                )}
            />

            {globalError && <GlassError message={globalError} />}

            <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                    <GlassButton type="submit" variant="primary" fullWidth loading={isLoading || isSubmitting} disabled={!canSubmit} loadingLabel="Sending…">
                        Send reset code
                    </GlassButton>
                )}
            />

            <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                <GlassLink onClick={() => setTab("login")}>← Back to login</GlassLink>
            </p>
        </form>
    );
}
