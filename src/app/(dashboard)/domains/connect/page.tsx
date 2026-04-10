"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Steps, Input, Button, Alert, Progress, Typography, Space, App, Card, Select, Tag } from 'antd';
import {
    RocketOutlined,
    GlobalOutlined,
    CheckCircleOutlined,
    LoadingOutlined,
    CopyOutlined,
    ClockCircleOutlined,
    SyncOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { useCreateDomain, useVerifyDomain, useCreateProxy } from "@/lib/api/domainHooks";
import { useAuth } from "@/hooks/useAuth";
import { useGoLivePage, usePage, usePages } from "@/lib/api/queries";
// Removed plain CSS import in favor of Tailwind

const { Title, Text } = Typography;

const DEPLOY_STEPS = [
    { id: "init", icon: "🚀", label: "Initializing Cloudflare Worker…", ms: 1000 },
    { id: "bundle", icon: "📦", label: "Bundling proxy script…", ms: 800 },
    { id: "deploy", icon: "☁️", label: "Deploying to Cloudflare edge…", ms: 1200 },
    { id: "subdomain", icon: "🌐", label: "Enabling workers.dev subdomain…", ms: 900 },
    { id: "finalise", icon: "✅", label: "Finalising edge configuration…", ms: 700 },
];

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

function ConnectDomainContent() {
    const { message } = App.useApp();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const goLiveMutation = useGoLivePage();
    const createProxyMutation = useCreateProxy();
    const createDomainMutation = useCreateDomain();
    const verifyMutation = useVerifyDomain();
    
    const pageIdFromUrl = searchParams.get("pageId") || "";

    const { data: pageData, isLoading: pageLoading } = usePage(pageIdFromUrl, !!pageIdFromUrl);
    const { data: allPages = [], isLoading: allPagesLoading } = usePages();

    // Filter for private projects that are not yet live
    const privateProjects = Array.isArray(allPages)
        ? allPages.filter((p: any) => !p.isPublic && !p.isLive)
        : [];

    const [currentStep, setCurrentStep] = useState(0);
    const [targetUrl, setTargetUrl] = useState("");
    const [workerDeploying, setWorkerDeploying] = useState(false);
    const [deployProgress, setDeployProgress] = useState(0);
    const [deployStepLabel, setDeployStepLabel] = useState("");
    const [workerError, setWorkerError] = useState("");
    const [workerResult, setWorkerResult] = useState<any>(null);

    const [customDomain, setCustomDomain] = useState("");
    const [domainError, setDomainError] = useState("");
    const [domainResult, setDomainResult] = useState<any>(null);

    const [autoValidating, setAutoValidating] = useState(false);
    const [validationProgress, setValidationProgress] = useState(0);
    const [validationSuccess, setValidationSuccess] = useState(false);

    useEffect(() => {
        if (pageIdFromUrl) {
            const baseUrl = `https://build.solidappmaker.in`
            setTargetUrl(`${baseUrl}/preview/${pageIdFromUrl}`);
        }
    }, [pageIdFromUrl]);

    const handleProjectSelect = (id: string) => {
        const baseUrl = `https://build.solidappmaker.in`
        setTargetUrl(`${baseUrl}/preview/${id}`);
    };

    const handleDeployWorker = async () => {
        if (!targetUrl.trim()) {
            setWorkerError("Please enter a landing page URL");
            return;
        }

        setWorkerDeploying(true);
        setWorkerError("");
        setDeployProgress(0);

        try {
            const totalSteps = DEPLOY_STEPS.length;
            for (let i = 0; i < totalSteps; i++) {
                setDeployStepLabel(DEPLOY_STEPS[i].label);
                setDeployProgress(((i + 1) / totalSteps) * 100);

                if (i === Math.floor(totalSteps / 2)) {
                    let pageId: string | null = null;
                    try {
                        const parsed = new URL(targetUrl);
                        pageId = parsed.searchParams.get("id");
                        if (!pageId) {
                            const match = parsed.pathname.match(/([0-9a-fA-F]{24})/);
                            if (match) pageId = match[1];
                        }
                    } catch (e) {
                        throw new Error("Invalid URL — must be a full URL (e.g. https://...)");
                    }

                    if (!pageId) throw new Error("URL must contain an ?id= parameter or a valid 24-character ID in the path");
                    
                    const result: any = await createProxyMutation.mutateAsync({ 
                        pageId, 
                        originUrl: targetUrl 
                    });
                    setWorkerResult(result);
                }
                await delay(DEPLOY_STEPS[i].ms);
            }
            setCurrentStep(1);
        } catch (err: any) {
            setWorkerError(err.message || "Failed to deploy worker");
        } finally {
            setWorkerDeploying(false);
        }
    };

    const handleCreateDomain = async () => {
        if (!customDomain.trim()) {
            setDomainError("Please enter your custom domain");
            return;
        }

        setDomainError("");

        try {
            // Extract pageId from URL again if not set
            let pageIdToUse = pageIdFromUrl;
            if (!pageIdToUse) {
                try {
                    const parsed = new URL(targetUrl);
                    const match = parsed.pathname.match(/([0-9a-fA-F]{24})/);
                    pageIdToUse = parsed.searchParams.get("id") || (match ? match[1] : "");
                } catch (e) { }
            }

            if (!user?._id) throw new Error("Authentication required");

            const data: any = await createDomainMutation.mutateAsync({ 
                domain: customDomain, 
                targetUrl, 
                userId: user._id, 
                pageId: pageIdToUse || undefined 
            });
            setDomainResult(data);

            // Trigger Go Live
            if (pageIdToUse) {
                await goLiveMutation.mutateAsync(pageIdToUse).catch(e => {
                    console.warn("Go Live failed but domain created:", e);
                    message.warning("Domain connected, but failed to mark project as 'Live'. Check your limits.");
                });
            }

            setCurrentStep(2);
        } catch (err: any) {
            setDomainError(err.message || "Failed to create domain");
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success('Copied to clipboard!');
    };

    // Auto-validation effect
    useEffect(() => {
        if (currentStep === 2 && domainResult && domainResult._id && !autoValidating && !validationSuccess && !domainResult.requiresManualDns) {
            let mounted = true;
            let progressInterval: any;

            const startValidation = async () => {
                if (!mounted) return;
                setAutoValidating(true);
                setValidationProgress(0);

                progressInterval = setInterval(() => {
                    setValidationProgress(prev => {
                        if (prev >= 98) return 98;
                        return prev + 1;
                    });
                }, 200);

                try {
                    await delay(15000);
                    if (!mounted) return;

                    const updatedRecord: any = await verifyMutation.mutateAsync(domainResult._id);
                    if (!mounted) return;

                    if (updatedRecord && updatedRecord.status === 'active') {
                        setValidationProgress(100);
                        setValidationSuccess(true);
                    }
                } catch (err) {
                    console.error("Auto-validation failed:", err);
                } finally {
                    if (mounted) {
                        setAutoValidating(false);
                        clearInterval(progressInterval);
                    }
                }
            };
            startValidation();
            return () => { mounted = false; if (progressInterval) clearInterval(progressInterval); };
        }
    }, [currentStep, domainResult]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] px-5 py-10 flex justify-center">
            <div className="w-full max-w-7xl">
                <Header onBack={() => router.push('/domains')} />

                <div className="perspective-[1000px]">
                    <Card className="bg-[#141414]! border-white/10! rounded-2xl! overflow-hidden shadow-2xl!">
                        <div className="bg-linear-to-br from-indigo-500/20 to-purple-600/20 p-8 border-b border-white/10 rounded-md">
                            <Title level={2} className="text-white! m-0! mb-6!">
                                <RocketOutlined className="mr-3 text-indigo-400" />
                                Connect Domain
                            </Title>
                            <Steps
                                current={currentStep}
                                size="small"
                                items={[
                                    { title: <span className="text-white">Deploy Worker</span> },
                                    { title: <span className="text-white">Add Domain</span> },
                                    { title: <span className="text-white">Complete</span> },
                                ]}
                                className="[&_.ant-steps-item-title::after]:bg-white/10 [&_.ant-steps-item-icon]:bg-transparent! [&_.ant-steps-item-icon]:border-white/20! [&_.ant-steps-item-finish_.ant-steps-item-icon]:border-emerald-500!"
                            />
                        </div>

                        <div className="p-8">
                            {pageIdFromUrl && pageData?.isPublic && (
                                <Alert
                                    title="Public Templates Cannot Go Live"
                                    description="This project is currently a public template. Please make it private first in your project settings to connect a custom domain."
                                    type="error"
                                    showIcon
                                    style={{ marginBottom: '24px' }}
                                />
                            )}

                            {currentStep === 0 && (
                                <StepDeployWorker
                                    targetUrl={targetUrl}
                                    setTargetUrl={setTargetUrl}
                                    workerDeploying={workerDeploying}
                                    deployStepLabel={deployStepLabel}
                                    deployProgress={deployProgress}
                                    workerError={workerError}
                                    workerResult={workerResult}
                                    onNext={() => setCurrentStep(1)}
                                    onDeploy={handleDeployWorker}
                                    handleCopy={handleCopy}
                                    isPreFilled={!!pageIdFromUrl}
                                    disabled={pageLoading || (pageIdFromUrl && pageData?.isPublic)}
                                    projects={privateProjects}
                                    onProjectSelect={handleProjectSelect}
                                    projectsLoading={allPagesLoading}
                                    pageData={pageData}
                                />
                            )}

                            {currentStep === 1 && (
                                <StepAddDomain
                                    customDomain={customDomain}
                                    setCustomDomain={setCustomDomain}
                                    domainCreating={createDomainMutation.isPending}
                                    domainError={domainError}
                                    onBack={() => setCurrentStep(0)}
                                    onCreate={handleCreateDomain}
                                />
                            )}

                            {currentStep === 2 && (
                                <StepComplete
                                    domainResult={domainResult}
                                    autoValidating={autoValidating}
                                    validationProgress={validationProgress}
                                    validationSuccess={validationSuccess}
                                    onDone={() => router.push('/domains')}
                                />
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Header({ onBack }: { onBack: () => void }) {
    return (
        <div className="mb-6">
            <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={onBack}
                className="text-white hover:text-indigo-400"
            >
                Back to Domains
            </Button>
        </div>
    );
}

function StepDeployWorker({
    targetUrl, setTargetUrl, workerDeploying, deployStepLabel, deployProgress,
    workerError, workerResult, onNext, onDeploy, handleCopy, isPreFilled, disabled,
    projects, onProjectSelect, projectsLoading, pageData
}: any) {
    return (
        <Space orientation="vertical" style={{ width: '100%' }} size="large">
            <Alert
                title="Step 1: Deploy Landing Page Worker"
                description="We need to deploy a proxy worker to Cloudflare to serve your landing page from your custom domain with SSL."
                type="info"
                showIcon
                icon={<RocketOutlined />}
                className="bg-indigo-500/10! border-indigo-500/20! rounded-md! [&_.ant-alert-message]:text-white! [&_.ant-alert-description]:text-white/70!"
            />

            {isPreFilled && pageData && (
                <div className="mb-8">
                    <label className="block mb-2 font-semibold text-white">Selected Project</label>
                    <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-md transition-all hover:bg-white/10">
                        <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 border border-white/10 bg-black">
                            {pageData.thumbnail ? (
                                <img src={pageData.thumbnail} alt={pageData.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-indigo-500/20 flex items-center justify-center">
                                    <GlobalOutlined className="text-xs text-indigo-400" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-white font-medium">{pageData.title}</span>
                                {pageData.isLive && <Tag color="green" className="m-0! px-1! text-[10px] leading-3 uppercase font-bold bg-emerald-500/20 border-emerald-500/30 text-emerald-400">LIVE</Tag>}
                            </div>
                            <Text className="text-white/40! text-[11px]! block">{pageData.slug || 'no-slug'}</Text>
                        </div>
                    </div>
                </div>
            )}

            {!isPreFilled && (
                <div className="mb-8">
                    <label className="block mb-2 font-semibold text-white">Select Private Project</label>
                    <Select
                        size="large"
                        placeholder="Choose a project to connect..."
                        className="w-full group"
                        dropdownClassName="!bg-[#1f1f1f] !border !border-white/10 !p-1.5"
                        rootClassName="[&_.ant-select-selector]:!bg-white/5 [&_.ant-select-selector]:!border-white/10 [&_.ant-select-selector]:!text-white [&_.ant-select-selection-placeholder]:!text-white/30"
                        onChange={onProjectSelect}
                        loading={projectsLoading}
                        options={projects.map((p: any) => ({
                            label: (
                                <div className="flex items-center gap-3 py-1 text-white">
                                    <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 border border-white/10 bg-black">
                                        {p.thumbnail ? (
                                            <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-indigo-500/20 flex items-center justify-center">
                                                <GlobalOutlined className="text-[10px] text-indigo-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="font-medium truncate">{p.title}</span>
                                            {p.isLive && <Tag color="green" className="m-0! px-1! text-[9px] leading-3 uppercase font-bold bg-emerald-500/20 border-emerald-500/30 text-emerald-400">LIVE</Tag>}
                                        </div>
                                        <span className="text-white/40 text-[10px] truncate">{p.slug || 'no-slug'}</span>
                                    </div>
                                </div>
                            ),
                            value: p._id
                        }))}
                    />
                </div>
            )}

            {/* Project Preview URL is handled internally now */}

            {workerDeploying && (
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <LoadingOutlined className="text-indigo-400 text-xl" />
                        <Text className="text-white!">{deployStepLabel}</Text>
                    </div>
                    <Progress percent={Math.floor(deployProgress)} status="active" strokeColor={{ '0%': '#6366f1', '100%': '#a855f7' }} className="[&_.ant-progress-text]:text-white/50!" />
                </div>
            )}

            {workerError && <Alert message={workerError} type="error" showIcon />}

            {workerResult && !workerDeploying && (
                <Alert
                    message="Setup Successful!"
                    description={
                        <div className="flex items-center gap-2 mt-2">
                            <Text code className="flex-1 bg-indigo-500/10! border-indigo-500/20! text-indigo-300!">{workerResult.workerUrl}</Text>
                            <Button
                                size="small"
                                icon={<CopyOutlined />}
                                onClick={() => handleCopy(workerResult.workerUrl)}
                                className="bg-indigo-500/20! border-indigo-500/30! text-indigo-300! hover:bg-indigo-500/30!"
                            >
                                Copy
                            </Button>
                        </div>
                    }
                    type="success"
                    showIcon
                    className="bg-emerald-500/10! border-emerald-500/20! rounded-xl!"
                />
            )}

            <div className="flex gap-4 mt-4">
                <Button
                    type="primary"
                    size="large"
                    block
                    onClick={workerResult ? onNext : onDeploy}
                    loading={workerDeploying}
                    disabled={disabled && !workerResult}
                    className="h-14! text-lg! font-bold! bg-linear-to-r! from-indigo-600! to-purple-600! border-0! rounded-2xl! hover:scale-[1.02]! active:scale-[0.98]! transition-all"
                >
                    {workerResult ? 'Next: Add Domain →' : '🚀 Deploy Worker'}
                </Button>
            </div>
        </Space>
    );
}

function StepAddDomain({ customDomain, setCustomDomain, domainCreating, domainError, onBack, onCreate }: any) {
    return (
        <Space orientation="vertical" style={{ width: '100%' }} size="large">
            <Alert
                message="Step 2: Connect Your Domain"
                description="Enter the domain or subdomain you want to use (e.g. landing.example.com)."
                type="info"
                showIcon
                icon={<GlobalOutlined />}
                className="bg-indigo-500/10! border-indigo-500/20! rounded-md! [&_.ant-alert-message]:text-white! [&_.ant-alert-description]:text-white/70!"
            />

            <div>
                <label className="block mb-2 font-semibold text-white">Custom Domain</label>
                <Input
                    size="large"
                    placeholder="landing.yourdomain.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    disabled={domainCreating}
                    prefix={<GlobalOutlined />}
                    className="bg-white/5! border-white/10! text-white! rounded-md! h-12"
                />
            </div>

            {domainError && <Alert message={domainError} type="error" showIcon />}

            <div className="flex gap-4 mt-4">
                <Button size="large" onClick={onBack} disabled={domainCreating} className="h-14! flex-1! bg-white/5! border-white/10! text-white! rounded-2xl! hover:bg-white/10!">
                    ← Back
                </Button>
                <Button
                    type="primary"
                    size="large"
                    onClick={onCreate}
                    loading={domainCreating}
                    className="h-14! flex-2! text-lg! font-bold! bg-linear-to-r! from-indigo-600! to-purple-600! border-0! rounded-md! hover:scale-[1.02]! active:scale-[0.98]! transition-all"
                >
                    {domainCreating ? 'Connecting...' : '🌐 Connect Domain'}
                </Button>
            </div>
        </Space>
    );
}

function StepComplete({ domainResult, autoValidating, validationProgress, validationSuccess, onDone }: any) {
    return (
        <Space orientation="vertical" style={{ width: '100%' }} size="large">
            {domainResult?.requiresManualDns ? (
                <Alert
                    message="Action Required: DNS Setup"
                    description="Your domain was added, but you need to configure your DNS records to activate it."
                    type="warning"
                    showIcon
                    className="mb-4 bg-amber-500/10! border-amber-500/20! rounded-md!"
                />
            ) : (
                <Alert
                    message="Domain Ready!"
                    description="Your custom domain has been successfully added."
                    type="success"
                    showIcon
                    className="mb-4 bg-emerald-500/10! border-emerald-500/20! rounded-md!"
                />
            )}

            <div className="p-12 bg-white/3 rounded-md border border-white/5">
                {domainResult?.requiresManualDns ? (
                    <div className="text-center">
                        <ClockCircleOutlined className="text-6xl text-amber-400 mb-4" />
                        <Title level={3} className="text-white!">Manual DNS Setup Pending</Title>
                        <Text className="text-white/60! block mb-6">
                            Follow the instructions on the next screen to configure your DNS records.
                        </Text>
                    </div>
                ) : autoValidating ? (
                    <div className="text-center">
                        <Progress type="circle" percent={validationProgress} strokeColor={{ '0%': '#6366f1', '100%': '#10b981' }} className="[&_.ant-progress-text]:text-white!" />
                        <Title level={3} className="text-white! mt-8 flex items-center justify-center gap-3">
                            <SyncOutlined spin className="text-indigo-400" />
                            Validating Connection...
                        </Title>
                        <Text className="text-white/60! block">Provisioning SSL and global edge routing.</Text>
                    </div>
                ) : validationSuccess ? (
                    <div className="text-center">
                        <div className="inline-flex p-6 bg-emerald-500/10 rounded-full mb-5">
                            <CheckCircleOutlined className="text-6xl text-emerald-500" />
                        </div>
                        <Title level={3} className="text-white! mt-4">Domain is Active!</Title>
                        <Text className="text-white/60! block mb-8">Your landing page is now live at your custom domain.</Text>
                    </div>
                ) : (
                    <div className="text-center">
                        <ClockCircleOutlined className="text-6xl text-amber-400 mb-4" />
                        <Title level={3} className="text-white!">DNS Propagation Pending</Title>
                        <Text className="text-white/60! block mb-8">Validation might take a few minutes. You can check the status anytime.</Text>
                    </div>
                )}

                <Button
                    type="primary"
                    size="large"
                    block
                    onClick={onDone}
                    className="h-14 text-lg font-bold mt-4"
                    style={{ background: validationSuccess ? '#10b981' : '#6366f1', borderColor: validationSuccess ? '#10b981' : '#6366f1' }}
                >
                    {autoValidating ? 'Continue to Dashboard' : 'Finish Setup'}
                </Button>
            </div>
        </Space>
    );
}

export default function ConnectDomainPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ConnectDomainContent />
        </Suspense>
    );
}
