"use client"

import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {CircleHelpIcon, X, Maximize2} from "lucide-react";
import React, { useState } from "react";

const Chatbot = () => {
    const [messages, setMessages] = useState<{from: 'user'|'bot', text: string}[]>([
        {from: 'bot', text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.'},
        {from: 'user', text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.'},
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages([...messages, {from: 'user', text: input}]);
        setTimeout(() => {
            setMessages(msgs => [...msgs, {from: 'bot', text: 'Olá! Como posso ajudar?'}]);
        }, 500);
        setInput("");
    };

    return (
        <div className="w-[400px] h-[500px] flex flex-col bg-white rounded-xl shadow-xl border overflow-hidden">
            {/* HEADER */}
            <div className="bg-green-600 text-white flex items-center justify-between px-4 py-2">
                <span className="font-medium">Retire suas duvidas com nossa IA</span>
                <div className="flex items-center gap-2">
                    <button className="hover:bg-green-700 p-1 rounded"><Maximize2 size={16}/></button>
                    <button className="hover:bg-green-700 p-1 rounded"><X size={16}/></button>
                </div>
            </div>

            {/* MENSAGENS */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-green-50">
                {messages.map((msg, idx) => (
                    msg.from === 'bot' ? (
                        <div key={idx} className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                            <div>
                                <div className="font-semibold text-sm">UniAI Assist</div>
                                <div className="bg-white p-3 rounded-xl shadow text-sm text-gray-700 max-w-[80%]">
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div key={idx} className="flex justify-end">
                            <div className="max-w-[80%]">
                                <div className="text-right font-semibold text-sm mb-1">Usuario</div>
                                <div className="bg-green-100 p-3 rounded-xl text-sm text-gray-800">
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>

            {/* INPUT */}
            <div className="flex items-center gap-2 p-3 border-t bg-white">
                <button className="p-2 text-green-600 hover:bg-green-100 rounded-full">📎</button>
                <input
                    className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    type="text"
                    placeholder="Digite sua mensagem..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                />
                <button
                    className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 text-sm"
                    onClick={handleSend}
                >➤</button>
            </div>
        </div>
    );
};

const HelpButton = () => {
    return(
        <Popover>
            <PopoverTrigger className={"bg-green-600 p-2 rounded-full"}><CircleHelpIcon className="text-white"/></PopoverTrigger>
            <PopoverContent className="p-0 mr-34 bg-transparent border-none shadow-none">
                <Chatbot />
            </PopoverContent>
        </Popover>
    )
}

export default HelpButton;
