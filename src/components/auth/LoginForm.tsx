"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { GlassInput } from "@/components/ui/glass/GlassInput";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassField, GlassError } from "@/components/ui/glass/GlassField";
import { FormHeading, GlassLink, PasswordField } from "./AuthShared";

export function LoginForm(props: any) {
    const { handleLogin, error, setTab, isLoading } = props;
    const [globalError, setGlobalError] = useState(error);

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            setGlobalError("");
            try {
                await handleLogin(value.email, value.password);
            } catch (err: any) {
                setGlobalError("Invalid email or password. Please try again.");
            }
        },
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FormHeading title="Welcome back" subtitle="Sign in to your PageCraft account" />

            <form.Field
                name="email"
                validators={{
                    onChange: ({ value }) => !value ? 'Email is required' : undefined,
                }}
                children={(field) => (
                    <GlassField label="Email" htmlFor="login-email">
                        <GlassInput
                            id="login-email"
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

            <form.Field
                name="password"
                validators={{
                    onChange: ({ value }) => !value ? 'Password is required' : undefined,
                }}
                children={(field) => (
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        <PasswordField
                            id="login-password"
                            label="Password"
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 1, marginBottom: field.state.meta.errors.length ? 8 : 0 }}>
                            <GlassLink onClick={() => { setTab("forgot-password"); }}>Forgot password?</GlassLink>
                        </div>
                        {field.state.meta.errors && field.state.meta.errors.length > 0 && <GlassError message={field.state.meta.errors[0]?.toString() || ""} />}
                    </div>
                )}
            />

            {globalError && <GlassError message={globalError} />}

            <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                    <GlassButton type="submit" variant="primary" fullWidth loading={isLoading || isSubmitting} disabled={!canSubmit} loadingLabel="Signing in…">
                        Sign in
                    </GlassButton>
                )}
            />

            <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                No account?{" "}<GlassLink onClick={() => setTab("register")}>Create one free</GlassLink>
            </p>
        </form>
    );
}
