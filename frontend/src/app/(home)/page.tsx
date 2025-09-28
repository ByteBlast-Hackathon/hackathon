"use client"

import React, { useState, useRef, useEffect } from "react";
import { SendHorizontal, Bot } from "lucide-react";
// Importa a função de API necessária
import { askGenerativeAI } from "@/api/requests/chat-bot";

// --- Definições de Tipo ---
interface Message {
    from: 'user' | 'bot';
    text: string;
    suggestedQuestions?: string[];
}

function isApiError(error: unknown): error is { response?: { data?: { message?: string } } } {
    return typeof error === "object" && error !== null && "response" in error;
}

const TalkPage = () => {

    // --- ESTADO DO COMPONENTE ---
    const [messages, setMessages] = useState<Message[]>([
        {
            from: 'bot',
            text: 'Olá! Sou a UniAI. Pode perguntar-me qualquer coisa sobre os procedimentos e coberturas do seu plano.'
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Efeito para fazer scroll automático para a última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- FUNÇÕES DE LÓGICA ---
    const addMessage = (message: Message) => {
        setMessages(prev => [...prev, message]);
    };

    const handleApiError = (error: unknown) => {
        const errorMessage = isApiError(error) && error.response?.data?.message
            ? error.response.data.message
            : 'Desculpe, ocorreu um erro inesperado. Tente novamente mais tarde.';
        addMessage({ from: 'bot', text: errorMessage });
    };

    const handleSendMessage = async (messageText: string) => {
        if (!messageText.trim()) return;

        addMessage({ from: 'user', text: messageText });
        if (messageText === input) {
            setInput("");
        }
        setIsLoading(true);

        try {
            const response = await askGenerativeAI({ question: messageText });
            addMessage({
                from: 'bot',
                text: response.answer,
                suggestedQuestions: response.suggestedQuestions,
            });
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:w-[65dvw] items-center lg:justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full h-[80dvh] lg:h-[95dvh] flex flex-col bg-white rounded-lg border overflow-hidden">
                {/* HEADER */}
                <div className="bg-green-600 text-white flex items-center justify-center px-4 py-3 flex-shrink-0">
                    <h1 className="text-xl font-bold">Assistente Virtual UniAI</h1>
                </div>

                {/* MENSAGENS */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-100">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex items-start gap-3 ${msg.from === 'user' ? 'justify-end' : ''}`}>
                            {msg.from === 'bot' && (
                                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                                    <Bot size={24} />
                                </div>
                            )}
                            <div className={`max-w-[85%] ${msg.from === 'user' ? 'text-right' : ''}`}>
                                <div className={`p-4 rounded-2xl text-base ${
                                    msg.from === 'bot'
                                        ? 'bg-white shadow text-gray-800'
                                        : 'bg-green-100 text-green-900'
                                }`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                                {msg.from === 'bot' && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {msg.suggestedQuestions.map((q, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleSendMessage(q)}
                                                className="bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-sm hover:bg-green-100 transition-colors"
                                            >
                                                {q}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">
                                <Bot size={24} />
                            </div>
                            <div className="bg-white p-4 rounded-2xl shadow">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s] inline-block mr-1.5"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s] inline-block mr-1.5"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce inline-block"></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* INPUT */}
                <div className="p-4 border-t bg-white text-black flex items-center gap-3 flex-shrink-0">
                    <input
                        className="flex-1 border-2 rounded-full px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                        type="text"
                        placeholder="Digite a sua pergunta..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(input); }}
                        disabled={isLoading}
                    />
                    <button
                        className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:bg-gray-400 transition-colors flex-shrink-0"
                        onClick={() => handleSendMessage(input)}
                        disabled={isLoading || !input.trim()}
                    >
                        <SendHorizontal size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TalkPage;
