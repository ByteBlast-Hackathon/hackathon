"use client"

import React, { useState, useRef, useEffect } from "react";
import { SendHorizontal, Bot, Calendar, Clock, User, Stethoscope, FileText, Trash2, RefreshCw, MapPin } from "lucide-react";
import { bookAppointmentRequest, BookingRequestProps, getMyAppointments, Appointment } from "@/api/requests/chat-bot";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// --- Definições de Tipo ---
type ConversationStep = 'start' | 'name' | 'birthDate' | 'specialty' | 'reason' | 'confirm' | 'done';
type ActiveTab = 'agendar' | 'minhas-consultas';

interface Message {
    from: 'user' | 'bot';
    text: string;
}

const ConsultasPage = () => {
    // --- ESTADO DO COMPONENTE ---
    const [messages, setMessages] = useState<Message[]>([
        { from: 'bot', text: 'Olá! Vamos iniciar o seu agendamento. Por favor, qual é o nome completo do paciente?' }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationStep, setConversationStep] = useState<ConversationStep>('name');
    const [bookingData, setBookingData] = useState<Partial<BookingRequestProps>>({});
    const [activeTab, setActiveTab] = useState<ActiveTab>('agendar');
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Efeito para fazer scroll automático
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Carregar consultas quando a aba for alterada
    useEffect(() => {
        if (activeTab === 'minhas-consultas') {
            loadMyAppointments();
        }
    }, [activeTab]);

    // --- FUNÇÕES DE LÓGICA ---
    const loadMyAppointments = async () => {
        setIsLoadingAppointments(true);
        try {
            const response = await getMyAppointments();
            // Agora usamos response.data que é o array de appointments
            setAppointments(response.data || []);
        } catch (error) {
            console.error("Erro ao carregar consultas:", error);
            // Mensagem de erro para o usuário
            addMessage({ from: 'bot', text: 'Erro ao carregar suas consultas. Tente novamente.' });
        } finally {
            setIsLoadingAppointments(false);
        }
    };

    const addMessage = (message: Message) => {
        setMessages(prev => [...prev, message]);
    };

    const handleApiError = (error: unknown) => {
        const errorMessage = axios.isAxiosError(error)
            ? error.response?.data?.message || 'Ocorreu um erro ao comunicar com o servidor.'
            : error instanceof Error 
            ? error.message
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
                nextQuestion = `Obrigado, ${value}. Agora, qual é a data de nascimento? (Formato: YYYY-MM-DD)`;
                nextStepName = 'birthDate';
                break;
            case 'birthDate':
                // Validação simples da data
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
                    addMessage({ from: 'bot', text: 'Por favor, use o formato YYYY-MM-DD (ex: 1990-05-15). Qual é a data de nascimento?' });
                    return;
                }
                nextQuestion = 'Qual é a especialidade médica desejada? (Ex: Cardiologia, Dermatologia, Pediatria)';
                nextStepName = 'specialty';
                break;
            case 'specialty':
                nextQuestion = 'Por favor, descreva brevemente o motivo da consulta.';
                nextStepName = 'reason';
                break;
            case 'reason':
                const summary = `✅ **Resumo do Agendamento:**\n\n` +
                    `👤 **Nome:** ${updatedData.name}\n` +
                    `🎂 **Data de Nascimento:** ${updatedData.birthDate}\n` +
                    `🎯 **Especialidade:** ${updatedData.specialty}\n` +
                    `📝 **Motivo:** ${updatedData.reason}\n\n` +
                    `Se todas as informações estiverem corretas, clique em "Confirmar Agendamento".`;
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
        
        const userMessage = input;
        addMessage({ from: 'user', text: userMessage });
        nextStep(conversationStep, userMessage);
    };

    const handleConfirmBooking = async () => {
        if (conversationStep !== 'confirm' || !bookingData.name || !bookingData.birthDate || !bookingData.specialty || !bookingData.reason) return;

        setIsLoading(true);
        addMessage({ from: 'user', text: '✅ Confirmar Agendamento' });

        try {
            const response = await bookAppointmentRequest(bookingData as BookingRequestProps);
            
            if (response.success) {
                addMessage({ 
                    from: 'bot', 
                    text: `🎉 ${response.message}\n\n📋 **Protocolo:** ${response.protocol}\n\nSua consulta foi agendada com sucesso! Você pode acompanhar o status na aba "Minhas Consultas".` 
                });
                
                // Limpar dados do agendamento
                setBookingData({});
                
                // Recarregar a lista de consultas se estiver na aba correta
                if (activeTab === 'minhas-consultas') {
                    loadMyAppointments();
                }
            } else {
                addMessage({ from: 'bot', text: `❌ ${response.message || 'Erro ao agendar consulta.'}` });
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
            setConversationStep('done');
        }
    };

    const resetConversation = () => {
        setMessages([
            { from: 'bot', text: 'Olá! Vamos iniciar o seu agendamento. Por favor, qual é o nome completo do paciente?' }
        ]);
        setInput("");
        setConversationStep('name');
        setBookingData({});
    };

    const getPlaceholder = () => {
        switch(conversationStep) {
            case 'name': return 'Digite o nome completo...';
            case 'birthDate': return 'YYYY-MM-DD (ex: 1990-05-15)';
            case 'specialty': return 'Ex: Cardiologia, Dermatologia...';
            case 'reason': return 'Descreva o motivo da consulta...';
            case 'confirm':
            case 'done': return 'Conversa finalizada.';
            default: return 'Digite a sua mensagem...';
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const formatTime = (timeString: string) => {
        return timeString; // Você pode formatar o tempo se necessário
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'scheduled': return 'Agendada';
            case 'completed': return 'Concluída';
            case 'cancelled': return 'Cancelada';
            default: return status;
        }
    };

    // --- RENDERIZAÇÃO ---
    return (
        <div className="flex flex-col lg:w-full items-center lg:justify-center bg-gray-50 lg:mx-20 p-4 min-h-screen">
            <div className="w-full max-w-6xl h-[80dvh] lg:h-[85vh] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                {/* HEADER COM TABS */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                    <div className="flex items-center justify-between px-6 py-4">
                        <h1 className="text-2xl font-bold">Agendamento de Consultas</h1>
                        <div className="flex space-x-1 bg-white/20 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('agendar')}
                                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 ${
                                    activeTab === 'agendar' 
                                        ? 'bg-white text-emerald-700 shadow-lg' 
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                Agendar Consulta
                            </button>
                            <button
                                onClick={() => setActiveTab('minhas-consultas')}
                                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 ${
                                    activeTab === 'minhas-consultas' 
                                        ? 'bg-white text-emerald-700 shadow-lg' 
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                Minhas Consultas
                            </button>
                        </div>
                    </div>
                </div>

                {/* CONTEÚDO DAS TABS */}
                <div className="flex-1 overflow-hidden">
                    <AnimatePresence mode="wait">
                        {activeTab === 'agendar' ? (
                            <motion.div
                                key="agendar"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="h-full flex flex-col"
                            >
                                {/* BOTÃO DE REINICIAR CONVERSA */}
                                {conversationStep === 'done' && (
                                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                                        <button
                                            onClick={resetConversation}
                                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors duration-300 text-sm"
                                        >
                                            ↗ Iniciar Novo Agendamento
                                        </button>
                                    </div>
                                )}

                                {/* MENSAGENS DO CHAT */}
                                <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gradient-to-b from-gray-50 to-white">
                                    {messages.map((msg, idx) => (
                                        <motion.div 
                                            key={idx} 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={`flex items-start gap-3 ${msg.from === 'user' ? 'justify-end' : ''}`}
                                        >
                                            {msg.from === 'bot' && (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                                                    <Bot size={20} />
                                                </div>
                                            )}
                                            <div className={`max-w-[85%] ${msg.from === 'user' ? 'text-right' : ''}`}>
                                                <div className={`p-4 rounded-2xl text-base shadow-sm ${
                                                    msg.from === 'bot' 
                                                        ? 'bg-white border border-emerald-100 text-gray-800' 
                                                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                                                }`}>
                                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                                                <Bot size={20} />
                                            </div>
                                            <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* INPUT E BOTÃO DE CONFIRMAÇÃO */}
                                <div className="p-4 border-t bg-white text-black border-gray-200 flex-shrink-0">
                                    {conversationStep === 'confirm' ? (
                                        <div className="flex gap-3">
                                            <motion.button
                                                initial={{ scale: 0.9, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                onClick={handleConfirmBooking}
                                                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                        Confirmando...
                                                    </div>
                                                ) : (
                                                    '✅ Confirmar Agendamento'
                                                )}
                                            </motion.button>
                                            <button
                                                onClick={resetConversation}
                                                className="px-6 py-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-300"
                                            >
                                                ↻ Recomeçar
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <input
                                                className="flex-1 border-2 border-gray-200 rounded-full px-6 py-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 transition-all duration-300"
                                                type={conversationStep === 'birthDate' ? 'date' : 'text'}
                                                placeholder={getPlaceholder()}
                                                value={input}
                                                onChange={e => setInput(e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                                                disabled={isLoading || conversationStep === 'done'}
                                            />
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-full hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl"
                                                onClick={handleSendMessage}
                                                disabled={isLoading || !input.trim() || conversationStep === 'done'}
                                            >
                                                <SendHorizontal size={20} />
                                            </motion.button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="minhas-consultas"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="h-full flex flex-col"
                            >
                                {/* HEADER DAS CONSULTAS */}
                                <div className="p-6 border-b border-gray-200 bg-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-800">Minhas Consultas</h2>
                                            <p className="text-gray-600 mt-1">Acompanhe todos os seus agendamentos</p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={loadMyAppointments}
                                            disabled={isLoadingAppointments}
                                            className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 disabled:bg-gray-400 transition-colors duration-300"
                                        >
                                            <RefreshCw size={16} className={isLoadingAppointments ? 'animate-spin' : ''} />
                                            Atualizar
                                        </motion.button>
                                    </div>
                                </div>

                                {/* LISTA DE CONSULTAS */}
                                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                                    {isLoadingAppointments ? (
                                        <div className="flex items-center justify-center h-32">
                                            <div className="flex items-center gap-3 text-gray-600">
                                                <RefreshCw size={20} className="animate-spin" />
                                                <span>Carregando consultas...</span>
                                            </div>
                                        </div>
                                    ) : appointments.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                            <Calendar size={64} className="mb-4 text-gray-300" />
                                            <h3 className="text-xl font-semibold mb-2">Nenhuma consulta agendada</h3>
                                            <p className="text-center mb-4">Você ainda não possui consultas agendadas.</p>
                                            <button
                                                onClick={() => setActiveTab('agendar')}
                                                className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors duration-300"
                                            >
                                                Agendar Primeira Consulta
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {appointments.map((appointment, index) => (
                                                <motion.div
                                                    key={appointment.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                                                                {getStatusText(appointment.status)}
                                                            </div>
                                                            <span className="text-sm text-gray-500 font-mono">
                                                                Protocolo: {appointment.protocol}
                                                            </span>
                                                        </div>
                                                        
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                                        {/* Data e Hora */}
                                                        <div className="flex items-center gap-3">
                                                            <Calendar size={18} className="text-emerald-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-600">Data</p>
                                                                <p className="font-semibold text-gray-800">
                                                                    {appointment.date ? formatDate(appointment.date) : 'A definir'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        
                                                        {appointment.time && (
                                                            <div className="flex items-center gap-3">
                                                                <Clock size={18} className="text-emerald-500" />
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Horário</p>
                                                                    <p className="font-semibold text-gray-800">{appointment.time}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Médico */}
                                                        {appointment.doctor && (
                                                            <div className="flex items-center gap-3">
                                                                <User size={18} className="text-emerald-500" />
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Médico</p>
                                                                    <p className="font-semibold text-gray-800">{appointment.doctor.name}</p>
                                                                    <p className="text-sm text-gray-600">{appointment.doctor.specialty}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Localização */}
                                                    {appointment.doctor?.city && (
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <MapPin size={16} className="text-emerald-500" />
                                                            <span className="text-sm text-gray-600">{appointment.doctor.city}</span>
                                                        </div>
                                                    )}

                                                    {/* Notas */}
                                                    {appointment.notes && (
                                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                                            <p className="text-sm text-gray-600 mb-1">Observações:</p>
                                                            <p className="text-gray-800 text-sm">{appointment.notes}</p>
                                                        </div>
                                                    )}

                                                    {/* Motivo do Cancelamento */}
                                                    {appointment.cancellationReason && (
                                                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                                            <p className="text-sm text-red-600 mb-1">Motivo do cancelamento:</p>
                                                            <p className="text-red-800 text-sm">{appointment.cancellationReason}</p>
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                                        <span className="text-sm text-gray-500">
                                                            Criado em: {formatDate(appointment.createdAt)}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ConsultasPage;