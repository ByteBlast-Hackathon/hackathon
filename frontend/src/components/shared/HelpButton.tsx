"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CircleHelpIcon, X, Maximize2, Paperclip, SendHorizontal } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
// --- 1. IMPORTAR AS FUNÇÕES DE API ---
import { askGenerativeAI, authorizeExamRequest } from "@/api/requests/chat-bot";

// --- Definições de Tipo para a nossa estrutura de mensagens ---
interface Option {
    text: string;
    task: number;
}

interface Message {
    from: 'user' | 'bot';
    text?: string;
    options?: Option[];
}

const Chatbot = () => {
    // --- ESTADO DO COMPONENTE ---
    const [messages, setMessages] = useState<Message[]>([
        {
            from: 'bot',
            text: 'Olá! Sou a UniAI, a sua assistente virtual. Como posso ajudar hoje?'
        },
        {
            from: 'bot',
            options: [
                { text: 'Tarefa 1: Dúvidas sobre o Rol de Procedimentos', task: 1 },
                { text: 'Tarefa 2: Enviar Pedido de Autorização de Exame', task: 2 },
                { text: 'Tarefa 3: Agendar uma Consulta', task: 3 },
            ]
        }
    ]);
    const [input, setInput] = useState("");
    const [currentTask, setCurrentTask] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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

    // Função para tratar erros de forma genérica
    const handleApiError = (error: unknown, defaultMessage: string) => {
        const errorMessage = (error as any)?.response?.data?.message || defaultMessage;
        addMessage({ from: 'bot', text: errorMessage });
    };

    /**
     * Lida com o clique numa das opções iniciais.
     */
    const handleOptionClick = (task: number, optionText: string) => {
        addMessage({ from: 'user', text: optionText });
        setCurrentTask(task);
        setIsLoading(true);

        setTimeout(() => { // Simula um pequeno delay da IA a "pensar"
            setIsLoading(false);
            switch (task) {
                case 1:
                    addMessage({ from: 'bot', text: 'Entendido. Por favor, digite a sua dúvida sobre um procedimento para que eu possa pesquisar.' });
                    break;
                case 2:
                    addMessage({ from: 'bot', text: 'Compreendi. Por favor, anexe o seu pedido de exame em formato PDF clicando no ícone de clipe.' });
                    break;
                case 3:
                    addMessage({ from: 'bot', text: 'A funcionalidade de Agendamento de Consulta está em desenvolvimento.' });
                    setCurrentTask(null); // Reseta a tarefa
                    break;
                default:
                    addMessage({ from: 'bot', text: 'Opção inválida. Por favor, selecione uma das tarefas.' });
                    break;
            }
        }, 700);
    };

    /**
     * Lida com o envio de texto do utilizador (para a Tarefa 1).
     */
    const handleSendText = async () => {
        if (!input.trim() || currentTask !== 1) return;

        const userMessage = input;
        addMessage({ from: 'user', text: userMessage });
        setInput("");
        setIsLoading(true);

        try {
            // --- 2. CHAMADA REAL À API DA TAREFA 1 ---
            const response = await askGenerativeAI({ question: userMessage });
            addMessage({ from: 'bot', text: response.answer });
        } catch (error) {
            handleApiError(error, 'Desculpe, não consegui processar a sua dúvida. Tente novamente.');
        } finally {
            setIsLoading(false);
            setCurrentTask(null); // Reseta a tarefa após a resposta
        }
    };

    /**
     * Lida com o upload do ficheiro (para a Tarefa 2).
     */
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || currentTask !== 2) return;

        addMessage({ from: 'user', text: `Ficheiro enviado: ${file.name}` });
        setIsLoading(true);

        try {
            // --- 3. CHAMADA REAL À API DA TAREFA 2 ---
            const response = await authorizeExamRequest({ file });
            addMessage({ from: 'bot', text: response.message });
        } catch (error) {
            handleApiError(error, 'Desculpe, ocorreu um erro ao enviar o seu ficheiro. Tente novamente.');
        } finally {
            setIsLoading(false);
            setCurrentTask(null); // Reseta a tarefa
        }
    };

    // --- RENDERIZAÇÃO DO COMPONENTE (sem alterações) ---
    return (
        <div className="w-[400px] h-[500px] flex flex-col bg-white rounded-xl shadow-xl border overflow-hidden">
            {/* HEADER */}
            <div className="bg-green-600 text-white flex items-center justify-between px-4 py-2 flex-shrink-0">
                <span className="font-medium">UniAI Assistente</span>
                <div className="flex items-center gap-2">
                    <button className="hover:bg-green-700 p-1 rounded"><Maximize2 size={16}/></button>
                    <button className="hover:bg-green-700 p-1 rounded"><X size={16}/></button>
                </div>
            </div>

            {/* MENSAGENS */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-green-50">
                {messages.map((msg, idx) => (
                    <div key={idx}>
                        {msg.from === 'bot' ? (
                            <div className="flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">U</div>
                                <div>
                                    <div className="font-semibold text-sm text-gray-800">UniAI Assist</div>
                                    {msg.text && (
                                        <div className="bg-white p-3 rounded-lg shadow text-sm text-gray-700 mt-1">
                                            {msg.text}
                                        </div>
                                    )}
                                    {msg.options && !isLoading && currentTask === null && (
                                        <div className="mt-2 space-y-2">
                                            {msg.options.map((opt) => (
                                                <button
                                                    key={opt.task}
                                                    onClick={() => handleOptionClick(opt.task, opt.text)}
                                                    className="w-full text-left bg-white border border-green-200 text-green-700 p-2.5 rounded-lg hover:bg-green-50 transition-colors text-sm"
                                                >
                                                    {opt.text}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-end">
                                <div className="max-w-[80%]">
                                    <div className="bg-green-100 p-3 rounded-xl text-sm text-gray-800">
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold flex-shrink-0">U</div>
                        <div className="bg-white p-3 rounded-lg shadow text-sm text-gray-700 mt-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s] inline-block mr-1"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s] inline-block mr-1"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce inline-block"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="flex items-center gap-2 p-3 border-t bg-white flex-shrink-0">
                {currentTask === 2 && (
                    <>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf"
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                            disabled={isLoading}
                        >
                            <Paperclip size={20}/>
                        </button>
                    </>
                )}
                <input
                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    type="text"
                    placeholder={currentTask === 1 ? "Digite sua dúvida aqui..." : "Selecione uma opção acima"}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendText(); }}
                    disabled={currentTask !== 1 || isLoading}
                />
                <button
                    className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    onClick={handleSendText}
                    disabled={currentTask !== 1 || isLoading || !input.trim()}
                >
                    <SendHorizontal size={20} />
                </button>
            </div>
        </div>
    );
};


const HelpButton = () => {
    return(
        <Popover>
            <PopoverTrigger className={"bg-green-600 p-2 rounded-full fixed bottom-5 right-5 shadow-lg"}>
                <CircleHelpIcon className="text-white"/>
            </PopoverTrigger>
            <PopoverContent className="p-0 mr-4 mb-2 bg-transparent border-none shadow-none w-auto h-auto">
                <Chatbot />
            </PopoverContent>
        </Popover>
    )
}

export default HelpButton;

