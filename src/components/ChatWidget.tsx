"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMessageSquare, FiX, FiSend, FiMinimize2, FiMail } from "react-icons/fi";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import apiClient from "@/lib/api/client";
import { toast } from "react-hot-toast";

interface Message {
    id: string;
    text: string;
    sender: "bot" | "user";
    timestamp: Date;
}

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

const FAQS: FAQ[] = [
    {
        id: "1",
        question: "How I register for an election?",
        answer:
            "To register, click the 'Register' button on the top right. You'll need your university email and student ID. After signing up, you must complete face verification to be eligible to vote.",
    },
    {
        id: "2",
        question: "Is my vote anonymous?",
        answer:
            "Yes, absolutely. We use advanced encryption to ensure your vote is secure and anonymous. Your identity is verified to prevent fraud, but your specific vote is never linked to your personal identity in the public results.",
    },
    {
        id: "3",
        question: "Can I run for a position?",
        answer:
            "Eligibility criteria vary by election. Generally, you need to be a registered student in good standing. Check the specific election details on the dashboard to see if you qualify to nominate yourself.",
    },
    {
        id: "4",
        question: "What if I forget my password?",
        answer:
            "You can reset your password by clicking 'Forgot Password' on the login page. We'll send a reset link to your registered university email address.",
    },
    {
        id: "5",
        question: "How does face verification work?",
        answer:
            "We use AI-powered face matching. You'll upload a reference photo (or we fetch it from university records), and before voting, you'll verify your identity via your webcam to ensure it's really you.",
    },

    {
        id: "6",
        question: "Who can see the results?",
        answer:
            "Once an election is completed and published by the administration, results are available to all registered students and staff on the 'Results' page.",
    },
    {
        id: "7",
        question: "My webcam isn't working!",
        answer:
            "Please ensure you've granted browser permissions for the camera. If it persists, try using a different browser (Chrome/Edge recommended) or device. You can email support if the issue continues.",
    },
];

const Typewriter = ({ text, onUpdate }: { text: string; onUpdate?: () => void }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < text.length) {
            const timeout = setTimeout(() => {
                setDisplayedText((prev) => prev + text[currentIndex]);
                setCurrentIndex((prev) => prev + 1);
                onUpdate?.(); // Trigger scroll on update
            }, 20); // Typing speed
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, text, onUpdate]);

    return <span>{displayedText}</span>;
};

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            text: "Hello! 👋 I'm your election assistant. Key functionalities include registration, voting, and real-time results. How can I help you today?",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Contact Form State
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const handleQuestionClick = async (faq: FAQ) => {
        // Add user question
        const userMsg: Message = {
            id: Date.now().toString(),
            text: faq.question,
            sender: "user",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsTyping(true);

        // Simulate bot thinking time
        setTimeout(() => {
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: faq.answer,
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 1000);
    };

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post("/accounts/contact/", contactForm);
            toast.success("Message sent successfully!");
            setIsContactOpen(false);
            setContactForm({ name: "", email: "", message: "" });
        } catch (err: unknown) {
            console.error('Failed to send message:', err);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (err as any).response?.data?.message || 'Failed to send message. Please try again.';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 shadow-lg shadow-primary-600/30 transition-colors hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-600/20"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <FiX className="h-6 w-6 text-white" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <FiMessageSquare className="h-6 w-6 text-white" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 z-50 flex h-[600px] max-h-[80vh] w-[380px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 sm:w-[400px]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between bg-primary-600 px-6 py-4 text-white">
                            <div>
                                <h3 className="text-lg font-semibold">Support Assistant</h3>
                                <p className="text-xs text-primary-100">Usually replies instantly</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="rounded-lg p-2 hover:bg-white/10"
                            >
                                <FiMinimize2 className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                            <div className="space-y-4">
                                {messages.map((msg, index) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.sender === "user"
                                                ? "bg-primary-600 text-white rounded-br-none"
                                                : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
                                                }`}
                                        >
                                            {msg.sender === "bot" ? (
                                                // Only animate the latest bot message
                                                index === messages.length - 1 && !isTyping ? (
                                                    <Typewriter text={msg.text} onUpdate={scrollToBottom} />
                                                ) : (
                                                    msg.text
                                                )
                                            ) : (
                                                msg.text
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex justify-start"
                                    >
                                        <div className="flex items-center space-x-1 rounded-2xl rounded-bl-none bg-white px-4 py-3 shadow-sm border border-gray-100">
                                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
                                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
                                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </div>

                        {/* Actions/Input Area */}
                        <div className="bg-white px-4 py-4 border-t border-gray-100">
                            <p className="mb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Suggested Questions
                            </p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {FAQS.map((faq) => (
                                    <button
                                        key={faq.id}
                                        onClick={() => handleQuestionClick(faq)}
                                        disabled={isTyping}
                                        className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-primary-50 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-left border border-gray-200"
                                    >
                                        {faq.question}
                                    </button>
                                ))}
                            </div>

                            {/* Support Email Footer */}
                            <div className="pt-3 border-t border-gray-100">
                                <button
                                    onClick={() => setIsContactOpen(true)}
                                    className="flex items-center justify-center w-full gap-2 rounded-xl bg-gray-900 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                                >
                                    <FiMail className="h-4 w-4" />
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Contact Modal */}
            <Modal
                isOpen={isContactOpen}
                onClose={() => setIsContactOpen(false)}
                title="Contact Support"
            >
                <form onSubmit={handleContactSubmit} className="space-y-4">
                    <Input
                        label="Name"
                        placeholder="Your Name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        placeholder="your.email@university.edu"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message
                        </label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 text-gray-700 min-h-[120px] resize-none"
                            placeholder="How can we help you?"
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsContactOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isSubmitting}
                        >
                            Send Message
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
