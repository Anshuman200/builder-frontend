"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { GlassInput } from "@/components/ui/glass/GlassInput";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassField, GlassError } from "@/components/ui/glass/GlassField";
import { FormHeading, GlassLink } from "./AuthShared";

export function VerifyOtpForm({ regEmail, handleVerify, error, setTab, isLoading }: any) {
    const [globalError, setGlobalError] = useState(error);

    const form = useForm({
        defaultValues: {
            otp: "",
        },
        onSubmit: async ({ value }) => {
            setGlobalError("");
            try {
                await handleVerify(regEmail, value.otp);
            } catch (err: any) {
                setGlobalError(err?.message || "Invalid or expired code.");
            }
        },
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }} style={{ display: "flex", flexDirection: "column", gap: 18, animation: "tab-slide 0.2s ease" }}>
            <FormHeading
                title="Check your email"
                subtitle={`We sent a 6-digit code to ${regEmail}`}
            />

            <form.Field
                name="otp"
                validators={{
                    onChange: ({ value }) => value.length !== 6 ? 'Please enter a valid 6-digit code' : undefined,
                }}
                children={(field) => (
                    <GlassField label="Verification Code" htmlFor="otp">
                        <GlassInput
                            id="otp"
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

            {globalError && <GlassError message={globalError} />}

            <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                    <GlassButton type="submit" variant="primary" fullWidth loading={isLoading || isSubmitting} disabled={!canSubmit} loadingLabel="Verifying…">
                        Verify email
                    </GlassButton>
                )}
            />

            <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                <GlassLink onClick={() => setTab("register")}>← Back to sign up</GlassLink>
            </p>
        </form>
    );
}
