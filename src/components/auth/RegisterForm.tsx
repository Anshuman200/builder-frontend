"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { EnvelopeIcon, UserIcon } from "@heroicons/react/24/outline";
import { GlassInput } from "@/components/ui/glass/GlassInput";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassField, GlassError } from "@/components/ui/glass/GlassField";
import { FormHeading, GlassLink, PasswordField } from "./AuthShared";

export function RegisterForm({ handleRegister, error, setTab, isLoading }: any) {
    const [globalError, setGlobalError] = useState(error);

    const form = useForm({
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
        onSubmit: async ({ value }) => {
            setGlobalError("");
            try {
                await handleRegister(value.name, value.email, value.password);
            } catch (err: any) {
                setGlobalError(err?.message || "Registration failed.");
            }
        },
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <FormHeading title="Create your account" subtitle="Start building pages for free" />

            <form.Field
                name="name"
                validators={{
                    onChange: ({ value }) => !value ? 'Full name is required' : undefined,
                }}
                children={(field) => (
                    <GlassField label="Full name" htmlFor="reg-name">
                        <GlassInput
                            id="reg-name"
                            type="text"
                            required
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            placeholder="Jane Smith"
                            icon={<UserIcon style={{ width: 15, height: 15 }} />}
                        />
                        {field.state.meta.errors && field.state.meta.errors.length > 0 && <GlassError message={field.state.meta.errors[0]?.toString() || ""} />}
                    </GlassField>
                )}
            />

            <form.Field
                name="email"
                validators={{
                    onChange: ({ value }) => !value ? 'Email is required' : undefined,
                    onBlur: ({ value }) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' : undefined,
                }}
                children={(field) => (
                    <GlassField label="Email" htmlFor="reg-email">
                        <GlassInput
                            id="reg-email"
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
                    onChangeAsyncDebounceMs: 300,
                    onChangeAsync: async ({ value }) => {
                        return value.length < 8 ? 'Password must be at least 8 characters' : undefined;
                    },
                }}
                children={(field) => (
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        <PasswordField
                            id="reg-password"
                            label="Password"
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
                    <GlassButton type="submit" variant="primary" fullWidth loading={isLoading || isSubmitting} disabled={!canSubmit} loadingLabel="Creating account…">
                        Create free account
                    </GlassButton>
                )}
            />

            <p style={{ textAlign: "center", fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", margin: 0 }}>
                Already have an account?{" "}<GlassLink onClick={() => setTab("login")}>Log in</GlassLink>
            </p>
        </form>
    );
}
