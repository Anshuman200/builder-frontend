"use client";

import { CommonContainer } from "@/components/layout/CommonContainer";
import ContactForm from "@/components/landing/ContactForm";
import { EnvelopeIcon, MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export default function ContactPage() {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full flex-1 flex flex-col pt-32 pb-24"
        >
            <CommonContainer>
                <div className="text-center mb-16 relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/70 mb-6 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                        Get in Touch
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Let&apos;s Talk About Your Next Big Idea.
                    </h1>
                    <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
                        Have a question, need help with your project, or want to explore enterprise options? We&apos;re here to help you succeed.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-12 lg:gap-20">
                    <div className="md:col-span-2 space-y-10">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6">Contact Information</h3>
                            <p className="text-white/50 leading-relaxed mb-8">
                                Fill out the form and our team will get back to you within 24 hours. We aim to provide exceptional support for all our users.
                            </p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                                    <EnvelopeIcon className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">Email Us</h4>
                                    <p className="text-white/50 text-sm">support@pagecraft.com</p>
                                    <p className="text-white/50 text-sm">sales@pagecraft.com</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <PhoneIcon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">Call Us</h4>
                                    <p className="text-white/50 text-sm">+1 (555) 123-4567</p>
                                    <p className="text-white/50 text-sm text-xs mt-1">Mon-Fri from 9am to 6pm EST</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
                                    <MapPinIcon className="w-6 h-6 text-rose-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold mb-1">Visit Us</h4>
                                    <p className="text-white/50 text-sm">123 Builder Avenue<br/>Innovation District<br/>San Francisco, CA 94103</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="md:col-span-3">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl -z-10 rounded-full opacity-50" />
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </CommonContainer>
        </motion.div>
    );
}
