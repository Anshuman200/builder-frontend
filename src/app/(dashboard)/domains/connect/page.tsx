"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Steps, Input, Button, Alert, Progress, Typography, Space, Card, Select, Tag } from 'antd';
import {
    RocketOutlined,
    GlobalOutlined,
    CheckCircleOutlined,
    LoadingOutlined,
    CopyOutlined,
    ClockCircleOutlined,
    ArrowLeftOutlined,
    LockOutlined,
    GlobalOutlined as GlobalIcon,
    SyncOutlined
} from '@ant-design/icons';
import { LockClosedIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { useCreateDomain, useVerifyDomain, useCreateProxy, useProxyStatus } from "@/lib/api/domainHooks";
import { useAuth } from "@/hooks/useAuth";
import { useGoLivePage, usePage, usePages } from "@/lib/api/queries";
import { useToasts } from "@/hooks/useToasts";
// Removed plain CSS import in favor of Tailwind
import { motion, AnimatePresence } from "framer-motion";

const { Title, Text } = Typography;

interface PageData {
    _id: string;
    title: string;
    thumbnail?: string;
    isPublic: boolean;
    isLive: boolean;
    slug?: string;
}

interface WorkerResult {
    workerUrl: string;
    [key: string]: any;
}

interface DomainResult {
    _id: string;
    requiresManualDns?: boolean;
    status?: string;
    [key: string]: any;
}

const DEPLOY_STEPS = [
    { id: "init", icon: "🚀", label: "Initializing Cloudflare Worker…", ms: 1000 },
    { id: "bundle", icon: "📦", label: "Bundling proxy script…", ms: 800 },
    { id: "deploy", icon: "☁️", label: "Deploying to Cloudflare edge…", ms: 1200 },
    { id: "subdomain", icon: "🌐", label: "Enabling workers.dev subdomain…", ms: 900 },
    { id: "finalise", icon: "✅", label: "Finalising edge configuration…", ms: 700 },
];

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

function ConnectDomainContent() {
    const toast = useToasts();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const goLiveMutation = useGoLivePage();
    const createProxyMutation = useCreateProxy();
    const createDomainMutation = useCreateDomain();
    const verifyMutation = useVerifyDomain();

    const pageIdFromUrl = searchParams.get("pageId") || "";
    const skipDeploy = searchParams.get("skipDeploy") === "true";

    const { data: pageData, isLoading: pageLoading } = usePage(pageIdFromUrl, !!pageIdFromUrl);
    const { data: existingProxy, isLoading: proxyLoading } = useProxyStatus(skipDeploy ? pageIdFromUrl : undefined);
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
    const [currentDeployStep, setCurrentDeployStep] = useState(-1);

    const [customDomain, setCustomDomain] = useState("");
    const [domainError, setDomainError] = useState("");
    const [domainResult, setDomainResult] = useState<any>(null);

    const [autoValidating, setAutoValidating] = useState(false);
    const [validationProgress, setValidationProgress] = useState(0);
    const [validationSuccess, setValidationSuccess] = useState(false);
    const [isSkipped, setIsSkipped] = useState(false);

    const [visibility, setVisibility] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (pageIdFromUrl) {
            const baseUrl = `https://build.solidappmaker.in`
            setTargetUrl(`${baseUrl}/preview/${pageIdFromUrl}`);
        }
    }, [pageIdFromUrl]);

    useEffect(() => {
        if (skipDeploy && existingProxy && !workerResult) {
            setWorkerResult(existingProxy);
            setCurrentStep(1);
        }
    }, [skipDeploy, existingProxy, workerResult]);

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
                setCurrentDeployStep(i);
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
                        originUrl: targetUrl,
                        visibility,
                        password: visibility === 'PRIVATE' ? password : undefined
                    });
                    setWorkerResult(result.data || result);
                }
                await delay(DEPLOY_STEPS[i].ms);
            }
        } catch (err: any) {
            setWorkerError(err.message || "Failed to deploy worker");
        } finally {
            setWorkerDeploying(false);
            setCurrentDeployStep(-1);
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
                userId: user!._id,
                pageId: pageIdToUse || undefined,
                visibility,
                password: visibility === 'PRIVATE' ? password : undefined
            });
            setDomainResult(data);

            // Trigger Go Live
            if (pageIdToUse) {
                await goLiveMutation.mutateAsync(pageIdToUse).catch(e => {
                    console.warn("Go Live failed but domain created:", e);
                    toast.info("Domain connected, but failed to mark project as 'Live'. Check your limits.");
                });
            }

            setCurrentStep(2);
        } catch (err: any) {
            setDomainError(err.message || "Failed to create domain");
        }
    };

    const handleSkipDomain = async () => {
        setIsSkipped(true);
        try {
            let pageIdToUse = pageIdFromUrl;
            if (!pageIdToUse) {
                try {
                    const parsed = new URL(targetUrl);
                    const match = parsed.pathname.match(/([0-9a-fA-F]{24})/);
                    pageIdToUse = parsed.searchParams.get("id") || (match ? match[1] : "");
                } catch (e) { }
            }

            if (pageIdToUse) {
                await goLiveMutation.mutateAsync(pageIdToUse);
                toast.success("Project is now live via proxy URL!");
            }
            router.push('/domains');
        } catch (err: any) {
            toast.error(err.message || "Failed to go live");
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
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

                    const updatedRecord: any = await verifyMutation.mutateAsync(domainResult!._id);
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
        <div className="min-h-screen bg-[#030303] text-white selection:bg-indigo-500/30 overflow-x-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 md:py-12">
                <Header onBack={() => router.push('/domains')} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                >
                    {/* Main Container Card */}
                    <div className="bg-neutral-900/40 backdrop-blur-3xl border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                        {/* Header Section */}
                        <div className="relative px-8 pt-10 pb-8 border-b border-white/5 bg-linear-to-b from-white/[0.03] to-transparent">
                            <div className="flex flex-col gap-8">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                        <RocketOutlined className="text-xs" /> Deploy & Connect
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white m-0">
                                        Publish <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">Project</span>
                                    </h2>
                                </div>
                                <div className="w-full">
                                    <Steps
                                        current={currentStep}
                                        size="small"
                                        items={[
                                            { title: <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Deploy</span> },
                                            { title: <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Domain</span> },
                                            { title: <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Live</span> },
                                        ]}
                                        className="compact-steps"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 md:p-10">
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
                                    onSkip={handleSkipDomain}
                                    isSkipping={goLiveMutation.isPending}
                                    onDeploy={handleDeployWorker}
                                    handleCopy={handleCopy}
                                    isPreFilled={!!pageIdFromUrl}
                                    disabled={pageLoading || (pageIdFromUrl && pageData?.isPublic)}
                                    projects={privateProjects}
                                    onProjectSelect={handleProjectSelect}
                                    projectsLoading={allPagesLoading}
                                    pageData={pageData}
                                    currentDeployStep={currentDeployStep}
                                    visibility={visibility}
                                    setVisibility={setVisibility}
                                    password={password}
                                    setPassword={setPassword}
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
                                    workerResult={workerResult}
                                    isSkipped={isSkipped}
                                    autoValidating={autoValidating}
                                    validationProgress={validationProgress}
                                    validationSuccess={validationSuccess}
                                    onDone={() => router.push('/domains')}
                                />
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function Header({ onBack }: { onBack: () => void }) {
    return (
        <div className="mb-10">
            <button
                onClick={onBack}
                className="group flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md"
            >
                <ArrowLeftOutlined className="text-xs group-hover:-translate-x-1 transition-transform" />
                <span className="text-[11px] font-black uppercase tracking-widest">Back to Domains</span>
            </button>
        </div>
    );
}

interface StepDeployWorkerProps {
    targetUrl: string;
    setTargetUrl: (url: string) => void;
    workerDeploying: boolean;
    deployStepLabel: string;
    deployProgress: number;
    workerError: string;
    workerResult: WorkerResult | null;
    onNext: () => void;
    onSkip: () => void;
    isSkipping: boolean;
    onDeploy: () => void;
    handleCopy: (text: string) => void;
    isPreFilled: boolean;
    disabled: boolean;
    projects: PageData[];
    onProjectSelect: (id: string) => void;
    projectsLoading: boolean;
    pageData?: PageData;
    currentDeployStep: number;
    visibility: 'PUBLIC' | 'PRIVATE';
    setVisibility: (v: 'PUBLIC' | 'PRIVATE') => void;
    password: string;
    setPassword: (v: string) => void;
}

function StepDeployWorker({
    workerDeploying, deployProgress, workerError, workerResult,
    onNext, onSkip, isSkipping, onDeploy, handleCopy, isPreFilled, disabled,
    projects, onProjectSelect, projectsLoading, pageData, currentDeployStep,
    visibility, setVisibility, password, setPassword
}: StepDeployWorkerProps) {
    return (
        <Space orientation="vertical" style={{ width: '100%' }} size="large">
            {!workerResult && (
                <Alert
                    title="Step 1: Deploy"
                    description="We need to deploy a proxy worker to Cloudflare to serve your landing page from your custom domain with SSL."
                    type="info"
                    showIcon
                    icon={<RocketOutlined />}
                    className="bg-indigo-500/10! border-indigo-500/20! text-white! rounded-md! [&_.ant-alert-message]:text-white! [&_.ant-alert-description]:text-white/70!"
                />
            )}

            {!workerResult && !workerDeploying && isPreFilled && pageData && (
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

            {!workerResult && !workerDeploying && !isPreFilled && (
                <div className="mb-10 max-w-6xl mx-auto">
                    <label className="block mb-3 font-black text-white/20 uppercase tracking-[0.2em] text-[10px] text-center">Select Destination Project</label>
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-10 group-hover:opacity-30 transition duration-1000"></div>
                        <Select
                            size="large"
                            placeholder="Choose a project to connect..."
                            className="w-full relative h-16 rounded-2xl overflow-hidden"
                            style={{ 
                                background: '#0f0f0f',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                            dropdownStyle={{ 
                                background: '#0f0f0f',
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '8px',
                                borderRadius: '16px'
                            }}
                            rootClassName="custom-dark-select [&_.ant-select-selector]:!bg-transparent! [&_.ant-select-selector]:!border-none! [&_.ant-select-selector]:!text-white! [&_.ant-select-selection-placeholder]:!text-white/20! [&_.ant-select-selection-placeholder]:!leading-[62px]! [&_.ant-select-selection-item]:!leading-[62px]!"
                            onChange={onProjectSelect}
                            loading={projectsLoading}
                            options={projects.map((p) => ({
                                label: (
                                    <div className="flex items-center gap-4 py-2 text-white group/item">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-white/10 bg-black group-hover/item:border-indigo-500/50 transition-colors">
                                            {p.thumbnail ? (
                                                <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-indigo-500/10 flex items-center justify-center">
                                                    <GlobalOutlined className="text-xs text-indigo-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm tracking-tight">{p.title}</span>
                                                {p.isLive && <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest">LIVE</span>}
                                            </div>
                                            <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-0.5">{p.slug || 'no-slug'}</span>
                                        </div>
                                    </div>
                                ),
                                value: p._id
                            }))}
                        />
                    </div>
                </div>
            )}

            {!workerResult && !workerDeploying && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4"
                >
                    <label className="block mb-4 font-black text-white/20 uppercase tracking-[0.2em] text-[10px] text-center">Set Project Access</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
                        <button
                            onClick={() => setVisibility('PUBLIC')}
                            className={`group relative flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-300 ${visibility === 'PUBLIC' ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_10px_20px_-5px_rgba(99,102,241,0.2)]' : 'bg-white/[0.02] border-white/5 opacity-50 hover:opacity-100 hover:bg-white/[0.04]'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${visibility === 'PUBLIC' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'bg-white/5 text-white/40 group-hover:scale-105'}`}>
                                <GlobeAltIcon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <span className={`block font-black uppercase tracking-widest text-[11px] transition-colors ${visibility === 'PUBLIC' ? 'text-white' : 'text-white/40'}`}>Public</span>
                                <span className="block text-[9px] font-bold text-white/20">Free access</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setVisibility('PRIVATE')}
                            className={`group relative flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-300 ${visibility === 'PRIVATE' ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_10px_20px_-5px_rgba(168,85,247,0.2)]' : 'bg-white/[0.02] border-white/5 opacity-50 hover:opacity-100 hover:bg-white/[0.04]'}`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${visibility === 'PRIVATE' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/40' : 'bg-white/5 text-white/40 group-hover:scale-105'}`}>
                                <LockClosedIcon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <span className={`block font-black uppercase tracking-widest text-[11px] transition-colors ${visibility === 'PRIVATE' ? 'text-white' : 'text-white/40'}`}>Private</span>
                                <span className="block text-[9px] font-bold text-white/20">Gated access</span>
                            </div>
                        </button>
                    </div>

                    <AnimatePresence>
                        {visibility === 'PRIVATE' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -20 }}
                                className="mt-8 max-w-6xl mx-auto"
                            >
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-linear-to-r from-purple-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                                    <Input.Password
                                        placeholder="Create a protection password..."
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="relative bg-[#0f0f0f]! border-white/10! text-white! h-16 rounded-2xl px-6! text-lg font-medium hover:border-white/20! focus:border-purple-500! transition-all shadow-2xl"
                                        prefix={<LockOutlined className="mr-3 text-purple-400" />}
                                    />
                                </div>
                                <p className="text-center text-[10px] font-bold text-white/20 uppercase tracking-widest mt-4">
                                    Users will need this to view your project
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Project Preview URL is handled internally now */}

            {workerDeploying && (
                <div className="p-8 bg-white/5 rounded-2xl border border-white/10 animate-in fade-in zoom-in duration-300">
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <LoadingOutlined className="text-indigo-400 text-xl" />
                                <Text className="text-white! font-medium">Deployment in Progress</Text>
                            </div>
                            <Text className="text-indigo-400! font-mono text-sm">{Math.floor(deployProgress)}%</Text>
                        </div>
                        <Progress
                            percent={Math.floor(deployProgress)}
                            showInfo={false}
                            strokeColor={{ '0%': '#6366f1', '100%': '#a855f7' }}
                            trailColor="rgba(255,255,255,0.05)"
                            className="m-0!"
                        />
                    </div>

                    <div className="flex flex-col gap-4">
                        {DEPLOY_STEPS.map((step, index) => {
                            const isCompleted = index < currentDeployStep;
                            const isActive = index === currentDeployStep;
                            const isPending = index > currentDeployStep;

                            return (
                                <div
                                    key={step.id}
                                    className={`flex items-center gap-4 transition-all duration-300 ${isActive ? 'opacity-100' : isCompleted ? 'opacity-70' : 'opacity-30'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border transition-all duration-500 ${isCompleted ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' :
                                        isActive ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 animate-pulse' :
                                            'bg-white/5 border-white/10 text-white/30'
                                        }`}>
                                        {isCompleted ? <CheckCircleOutlined /> : step.icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <Text className={`text-sm! font-medium! ${isActive ? 'text-white' : 'text-white/70'}`}>
                                            {step.label}
                                        </Text>
                                        {isActive && (
                                            <div className="h-0.5 w-12 bg-linear-to-r from-indigo-500 to-transparent mt-1" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {workerError && <Alert message={workerError} type="error" showIcon />}

            {workerResult && !workerDeploying && (
                <div className="p-1! rounded-2xl bg-linear-to-r from-indigo-500/20 to-purple-500/20 border border-white/10 overflow-hidden animate-in fade-in zoom-in duration-300">
                    <div className="bg-[#1a1a1a] p-5 rounded-[14px]">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <Text className="text-white/70! text-xs font-bold uppercase tracking-wider">Live Proxy Link</Text>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                <Text className="text-indigo-300! text-sm font-mono truncate block">{workerResult.workerUrl}</Text>
                            </div>
                            <Button
                                type="primary"
                                icon={<CopyOutlined />}
                                onClick={() => handleCopy(workerResult.workerUrl)}
                                className="h-[46px]! w-[46px]! flex items-center justify-center bg-indigo-600! border-0! rounded-xl! hover:scale-105! transition-transform"
                            />
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 mt-8 max-w-md mx-auto">
                {!workerResult ? (
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                        <Button
                            type="primary"
                            size="large"
                            block
                            onClick={onDeploy}
                            loading={workerDeploying}
                            disabled={disabled}
                            className="relative h-11! text-xs! font-black! uppercase! tracking-widest! bg-linear-to-r! from-indigo-600! to-purple-600! border-0! rounded-xl! hover:scale-[1.02]! active:scale-[0.98]! transition-all shadow-xl shadow-indigo-500/10"
                        >
                            🚀 Start Publishing
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            size="large"
                            onClick={onSkip}
                            loading={isSkipping}
                            className="h-11! text-[10px] font-black uppercase tracking-widest bg-white/5! border-white/10! text-white! rounded-xl! hover:bg-white/10!"
                        >
                            Skip
                        </Button>
                        <Button
                            type="primary"
                            size="large"
                            onClick={onNext}
                            className="h-11! text-[10px] font-black uppercase tracking-widest bg-linear-to-r! from-indigo-600! to-purple-600! border-0! rounded-xl! hover:scale-[1.02]! active:scale-[0.98]! transition-all shadow-lg shadow-indigo-500/10"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </Space>
    );
}

interface StepAddDomainProps {
    customDomain: string;
    setCustomDomain: (domain: string) => void;
    domainCreating: boolean;
    domainError: string;
    onBack: () => void;
    onCreate: () => void;
}

function StepAddDomain({ customDomain, setCustomDomain, domainCreating, domainError, onBack, onCreate }: StepAddDomainProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-6xl mx-auto"
        >
            <div className="mb-6 text-center">
                <div className="inline-flex p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 mb-3">
                    <GlobalOutlined className="text-xl text-indigo-400" />
                </div>
                <h3 className="text-lg font-black text-white m-0 mb-1 tracking-tight">Connect Your Domain</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">Map your project to a custom address</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="relative flex-1 group">
                    <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <Input
                        size="large"
                        placeholder="e.g. landing.yourbrand.com"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        disabled={domainCreating}
                        className="relative bg-[#0f0f0f]! border-white/10! text-white! h-11 rounded-xl px-4! text-sm font-medium hover:border-white/20! focus:border-indigo-500! transition-all shadow-xl"
                        prefix={<GlobalOutlined className="mr-2 text-indigo-400 opacity-40" />}
                    />
                </div>
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-linear-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                    <Button
                        type="primary"
                        size="large"
                        onClick={onCreate}
                        loading={domainCreating}
                        className="relative h-11! px-8! text-[10px]! font-black! uppercase! tracking-widest! bg-linear-to-r! from-indigo-600! to-purple-600! border-0! rounded-xl! hover:scale-[1.02]! active:scale-[0.98]! transition-all shadow-lg shadow-indigo-500/10"
                    >
                        {domainCreating ? 'Connecting...' : 'Finish Setup'}
                    </Button>
                </div>
            </div>

            {domainError && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                    <Alert message={domainError} type="error" showIcon className="rounded-xl! bg-red-500/10! border-red-500/20! [&_.ant-alert-message]:text-red-400! text-xs! font-bold!" />
                </motion.div>
            )}

            <div className="flex justify-center">
                <button
                    onClick={onBack}
                    disabled={domainCreating}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                    <ArrowLeftOutlined className="text-[10px]" /> Go Back
                </button>
            </div>
        </motion.div>
    );
}

interface StepCompleteProps {
    domainResult: DomainResult | null;
    workerResult: WorkerResult | null;
    isSkipped: boolean;
    autoValidating: boolean;
    validationProgress: number;
    validationSuccess: boolean;
    onDone: () => void;
}

function StepComplete({ domainResult, workerResult, isSkipped, autoValidating, validationProgress, validationSuccess, onDone }: StepCompleteProps) {
    const toast = useToasts();
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto text-center"
        >
            <div className="mb-8">
                <div className="inline-flex relative">
                    <div className="absolute -inset-2 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative p-6 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-xl">
                        <RocketOutlined className="text-5xl text-emerald-400" />
                    </div>
                </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-white m-0 mb-2 tracking-tight">
                Project <span className="text-emerald-400">Published!</span>
            </h2>
            <p className="text-white/40 text-sm font-medium mb-8 max-w-sm mx-auto">
                Your site is now live on the global edge network.
            </p>

            <div className="relative group max-w-sm mx-auto mb-10">
                <div className="absolute -inset-0.5 bg-linear-to-r from-emerald-500 to-indigo-500 rounded-2xl blur opacity-20 transition duration-500"></div>
                <div className="relative bg-neutral-950/50 backdrop-blur-xl border border-white/10 p-5 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4 justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Production URL</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:border-emerald-500/20 transition-all overflow-hidden text-left">
                            <span className="text-emerald-400 font-mono text-xs truncate block">
                                {isSkipped ? workerResult?.workerUrl : `https://${domainResult?.domain}`}
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                const url = isSkipped ? workerResult?.workerUrl : `https://${domainResult?.domain}`;
                                if (url) {
                                    navigator.clipboard.writeText(url);
                                    toast.success("Copied!");
                                }
                            }}
                            className="h-10 w-10 shrink-0 flex items-center justify-center bg-emerald-500 text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <CopyOutlined className="text-base" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto">
                <Button
                    type="primary"
                    size="large"
                    block
                    onClick={onDone}
                    className="h-11! text-[10px]! font-black! uppercase! tracking-widest! bg-white! text-black! border-0! rounded-xl! hover:bg-neutral-200! transition-all shadow-xl"
                >
                    Done
                </Button>
            </div>
        </motion.div>
    );
}

export default function ConnectDomainPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ConnectDomainContent />
        </Suspense>
    );
}
