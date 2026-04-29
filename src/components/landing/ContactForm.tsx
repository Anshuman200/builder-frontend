"use client";

import { Form, Input, Button } from "antd";
import { useSubmitForm } from "@/lib/api/queries";
import { useToasts } from "@/hooks/useToasts";

export default function ContactForm() {
    const [form] = Form.useForm();
    const submitMut = useSubmitForm();
    const { success: toastSuccess, error: toastError } = useToasts();

    const onFinish = async (values: { name: string; email: string; message: string }) => {
        try {
            await submitMut.mutateAsync({
                receiverEmail: "admin@pagecraft.com",
                subject: "New Contact Inquiry from Solario Forge Form",
                fields: values
            });
            toastSuccess("Thank you! Your message has been sent successfully. We'll be in touch soon.");
            form.resetFields();
        } catch (error) {
            const err = error as Error;
            console.error("Form submission error:", err);
            toastError(err?.message || "Something went wrong.");
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-lg mx-auto bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-xl">

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                className="contact-antd-form"
            >
                <Form.Item
                    name="name"
                    label={<span className="text-sm font-bold text-white/70">Your Name</span>}
                    rules={[{ required: true, message: "Please enter your name" }]}
                >
                    <Input
                        size="large"
                        placeholder="John Doe"
                        disabled={submitMut.isPending}
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/30 hover:border-indigo-500 focus:border-indigo-500"
                        style={{ background: "rgba(0,0,0,0.4)", color: "white", borderColor: "rgba(255,255,255,0.1)" }}
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    label={<span className="text-sm font-bold text-white/70">Email Address</span>}
                    rules={[
                        { required: true, message: "Please enter your email" },
                        { type: "email", message: "Please enter a valid email" }
                    ]}
                >
                    <Input
                        size="large"
                        placeholder="john@example.com"
                        disabled={submitMut.isPending}
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/30 hover:border-indigo-500 focus:border-indigo-500"
                        style={{ background: "rgba(0,0,0,0.4)", color: "white", borderColor: "rgba(255,255,255,0.1)" }}
                    />
                </Form.Item>

                <Form.Item
                    name="message"
                    label={<span className="text-sm font-bold text-white/70">Message</span>}
                    rules={[{ required: true, message: "Please enter your message" }]}
                >
                    <Input.TextArea
                        size="large"
                        rows={5}
                        placeholder="How can we help you?"
                        disabled={submitMut.isPending}
                        className="bg-black/40 border-white/10 text-white placeholder:text-white/30 hover:border-indigo-500 focus:border-indigo-500 resize-none"
                        style={{ background: "rgba(0,0,0,0.4)", color: "white", borderColor: "rgba(255,255,255,0.1)" }}
                    />
                </Form.Item>

                <Form.Item className="mb-0 mt-4">
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={submitMut.isPending}
                        className="w-full font-bold bg-indigo-500 hover:bg-indigo-600 border-none h-12 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all"
                    >
                        {submitMut.isPending ? "Sending..." : "Send Message"}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
