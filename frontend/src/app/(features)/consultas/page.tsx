"use client"

import React, { useState, useRef, useEffect } from "react";
import { SendHorizontal, Bot } from "lucide-react";
import { bookAppointmentRequest, BookingRequestProps } from "@/api/requests/chat-bot";
import axios from "axios";
import useAuthGuard from "@/lib/useAuthGuard";

// --- Definições de Tipo ---
type ConversationStep = 'start' | 'name' | 'birthDate' | 'specialty' | 'reason' | 'confirm' | 'done';

interface Message {
    from: 'user' | 'bot';
    text: string;
}

const ConsultasPage = () => {
    useAuthGuard();

    // --- ESTADO DO COMPONENTE ---
    const [messages, setMessages] = useState<Message[]>([
        { from: 'bot', text: 'Olá! Vamos iniciar o seu agendamento. Por favor, qual é o nome completo do paciente?' }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationStep, setConversationStep] = useState<ConversationStep>('name');
    const [bookingData, setBookingData] = useState<Partial<BookingRequestProps>>({});

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Efeito para fazer scroll automático
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // --- FUNÇÕES DE LÓGICA ---
    const addMessage = (message: Message) => {
        setMessages(prev => [...prev, message]);
    };

    const handleApiError = (error: unknown) => {
        const errorMessage = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Ocorreu um erro ao comunicar com o servidor.'
            : 'Desculpe, ocorreu um erro inesperado. Tente novamente mais tarde.';
        addMessage({ from: 'bot', text: errorMessage });
    };

    const nextStep = (currentStep: ConversationStep, value: string) => {
        const updatedData = { ...bookingData, [currentStep]: value };
        setBookingData(updatedData);
        setInput("");

        let nextQuestion = '';
        let nextStepName: ConversationStep = 'done';

        switch (currentStep) {
            case 'name':
                nextQuestion = `Obrigado, ${value}. Agora, qual é a data de nascimento? (YYYY-MM-DD)`;
                nextStepName = 'birthDate';
                break;
            case 'birthDate':
                nextQuestion = 'Qual é a especialidade médica desejada? (Ex: Cardiologia)';
                nextStepName = 'specialty';
                break;
            case 'specialty':
                nextQuestion = 'Por favor, descreva brevemente o motivo da consulta.';
                nextStepName = 'reason';
                break;
            case 'reason':
                const summary = `Ótimo, vamos confirmar os dados:\n` +
                    `Nome: ${updatedData.name}\n` +
                    `Data de Nasc.: ${updatedData.birthDate}\n` +
                    `Especialidade: ${updatedData.specialty}\n` +
                    `Motivo: ${updatedData.reason}\n\n` +
                    `Se tudo estiver correto, por favor, clique em "Confirmar Agendamento".`;
                nextQuestion = summary;
                nextStepName = 'confirm';
                break;
            default:
                break;
        }

        addMessage({ from: 'bot', text: nextQuestion });
        setConversationStep(nextStepName);
    };

    const handleSendMessage = () => {
        if (!input.trim() || isLoading || conversationStep === 'confirm' || conversationStep === 'done') return;
        addMessage({ from: 'user', text: input });
        nextStep(conversationStep, input);
    };

    const handleConfirmBooking = async () => {
        if (conversationStep !== 'confirm' || !bookingData.name || !bookingData.birthDate || !bookingData.specialty || !bookingData.reason) return;

        setIsLoading(true);
        addMessage({ from: 'user', text: 'Confirmar Agendamento' });

        try {
            const response = await bookAppointmentRequest(bookingData as BookingRequestProps);
            addMessage({ from: 'bot', text: response.message });
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
            setConversationStep('done');
        }
    };

    const getPlaceholder = () => {
        switch(conversationStep) {
            case 'name': return 'Digite o nome completo...';
            case 'birthDate': return 'Digite a data de nascimento...';
            case 'specialty': return 'Digite a especialidade...';
            case 'reason': return 'Digite o motivo...';
            case 'confirm':
            case 'done': return 'Conversa finalizada.';
            default: return 'Digite a sua mensagem...';
        }
    }

    // --- RENDERIZAÇÃO ---
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-2xl h-[80vh] flex flex-col bg-white rounded-xl shadow-2xl border overflow-hidden">
                {/* HEADER */}
                <div className="bg-green-600 text-white flex items-center justify-center px-4 py-3 flex-shrink-0">
                    <h1 className="text-xl font-bold">Agendamento de Consulta</h1>
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
                                    msg.from === 'bot' ? 'bg-white shadow text-gray-800' : 'bg-green-100 text-green-900'
                                }`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
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

                {/* INPUT E BOTÃO DE CONFIRMAÇÃO */}
                <div className="p-4 border-t bg-white flex-shrink-0">
                    {conversationStep === 'confirm' ? (
                        <button
                            onClick={handleConfirmBooking}
                            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
                            disabled={isLoading}
                        >
                            Confirmar Agendamento
                        </button>
                    ) : (
                        <div className="flex items-center gap-3">
                            <input
                                className="flex-1 border-2 rounded-full px-5 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                                type={conversationStep === 'birthDate' ? 'date' : 'text'}
                                placeholder={getPlaceholder()}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                                disabled={isLoading || conversationStep === 'done'}
                            />
                            <button
                                className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:bg-gray-400 transition-colors flex-shrink-0"
                                onClick={handleSendMessage}
                                disabled={isLoading || !input.trim() || conversationStep === 'done'}
                            >
                                <SendHorizontal size={24} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConsultasPage;
