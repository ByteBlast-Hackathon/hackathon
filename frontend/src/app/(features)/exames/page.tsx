"use client"

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, FileCheck, AlertTriangle, Clock } from "lucide-react";
// Importa a função de API necessária
import { authorizeExamRequest } from "@/api/requests/chat-bot";

// --- Definições de Tipo ---
interface Message {
    from: 'user' | 'bot';
    text: string;
    status?: 'Autorizado' | 'Em Análise' | 'Em Análise (OPME)' | 'Falha' | 'Não Autorizado';
}

function isApiError(error: unknown): error is { response?: { data?: { message?: string } } } {
  return typeof error === "object" && error !== null && "response" in error;
}

const ExamsPage = () => {

    // --- ESTADO DO COMPONENTE ---
    const [messages, setMessages] = useState<Message[]>([
        {
            from: 'bot',
            text: 'Olá! Para iniciar a verificação, por favor, envie o seu pedido de exame em formato PDF.'
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
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
        addMessage({ from: 'bot', text: errorMessage, status: 'Falha' });
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reseta o erro de ficheiro ao tentar um novo upload
        setFileError(null);

        // Validação do tipo de ficheiro no frontend para uma resposta mais rápida
        if (file.type !== 'application/pdf') {
            setFileError('Por favor, selecione um ficheiro com o formato PDF.');
            return;
        }

        addMessage({ from: 'user', text: `Pedido enviado: ${file.name}` });
        setIsLoading(true);

        try {
            const response = await authorizeExamRequest({ file });
            addMessage({
                from: 'bot',
                text: response.message,
                status: response.status as Message['status']
            });
        } catch (error) {
            handleApiError(error);
        } finally {
            setIsLoading(false);
            // Limpa o input para permitir o envio do mesmo ficheiro novamente
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const getStatusIcon = (status?: Message['status']) => {
        switch (status) {
            case 'Autorizado':
                return <FileCheck className="text-green-500" />;
            case 'Em Análise':
            case 'Em Análise (OPME)':
                return <Clock className="text-blue-500" />;
            case 'Falha':
            case 'Não Autorizado':
                return <AlertTriangle className="text-red-500" />;
            default:
                return null;
        }
    }

    // --- RENDERIZAÇÃO ---
    return (
        <div className="flex flex-col lg:w-[65dvw] items-center lg:justify-center bg-gray-50 p-4">
            <div className="w-full h-[80dvh] lg:h-[95dvh] flex flex-col bg-white rounded-lg border overflow-hidden">
                {/* HEADER */}
                <div className="bg-green-600 text-white flex items-center justify-center px-4 py-3 flex-shrink-0">
                    <h1 className="text-xl font-bold">Sistema de Autorização de Exames</h1>
                </div>

                {/* MENSAGENS */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-100">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex items-start gap-3 ${msg.from === 'user' ? 'justify-end' : ''}`}>
                            {msg.from === 'bot' && (
                                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">U</div>
                            )}
                            <div className={`max-w-[85%] ${msg.from === 'user' ? 'text-right' : ''}`}>
                                <div className={`p-4 rounded-2xl text-sm ${
                                    msg.from === 'bot'
                                        ? 'bg-white shadow'
                                        : 'bg-green-100 text-green-900'
                                }`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        {getStatusIcon(msg.status)}
                                        <span className="font-bold">{msg.status || (msg.from === 'bot' ? "UniAI Assistente" : "Você")}</span>
                                    </div>
                                    <p className="text-gray-700">{msg.text}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0 text-lg">U</div>
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
                <div className="p-4 border-t bg-white text-black flex-shrink-0">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf"
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 disabled:bg-gray-400"
                        disabled={isLoading}
                    >
                        <UploadCloud size={20}/>
                        <span>{isLoading ? 'A Processar...' : 'Anexar Pedido de Exame (PDF)'}</span>
                    </button>
                    {fileError && <p className="text-red-500 text-sm text-center mt-2">{fileError}</p>}
                </div>
            </div>
        </div>
    );
};

export default ExamsPage;
