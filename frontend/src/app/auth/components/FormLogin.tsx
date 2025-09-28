"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {EyeClosedIcon, EyeIcon} from "lucide-react";
import React, {useState, useRef} from "react";
import {loginRequest} from "@/api/requests/auth";
import {useRouter} from "next/navigation";
import { toast } from "sonner";

const formSchema = z.object({
    email: z.string().email({
        message: "Email invalido",
    }).refine((val) => /@gmail\.com$/i.test(val), {
        message: "O email deve ser um Gmail (ex: usuario@gmail.com)",
    }),
    // regras de complexidade para password
    pass: z.string().min(8, {
        message: "Senha deve ter no minimo 8 caracteres",
    })
        .refine((val) => /[A-Z]/.test(val), {
            message: "Deve conter ao menos uma letra maiúscula",
        })
        .refine((val) => /[a-z]/.test(val), {
            message: "Deve conter ao menos uma letra minúscula",
        })
        .refine((val) => /\d/.test(val), {
            message: "Deve conter ao menos um número",
        })
        .refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
            message: "Deve conter ao menos um caractere especial",
        }),
})


const FormRegister = ({ onToggle }: { onToggle: () => void }) => {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()
    const emailRef = useRef<HTMLInputElement>(null)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            pass: "",
        },
    })

    // Foco automático no email
    React.useEffect(() => {
        emailRef.current?.focus()
    }, [])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        setError("")
        try {
            const res = await loginRequest({...values})
            toast.success("Login realizado com sucesso!")
            router.push("/")
        } catch (e: any) {
            setError(e?.message || "Erro ao logar. Verifique suas credenciais.")
            toast.error(e?.message || "Erro ao logar. Verifique suas credenciais.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 lg:space-y-8 animate-fade-in">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input ref={emailRef} type={"email"} placeholder={"Insira seu Melhor email"} {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="pass"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                                <div className="flex relative items-center w-full">
                                    <Input type={!showPassword ? "password" : "text"} placeholder={"Insira uma senha"} {...field}/>
                                    <button type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword(v => !v)} className="absolute right-3 text-sm text-[var(--primary-light-green)] underline font-semibold">
                                        {showPassword ? <EyeIcon /> : <EyeClosedIcon />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {error && <div className="text-red-500 text-center text-sm animate-shake">{error}</div>}
                <div className="flex justify-center items-center text-lg">
                    <p>Não possui conta?</p> <Button type={"button"} onClick={() => onToggle()} className={"text-[var(--primary-light-green)] underline font-bold"}> Registrar </Button>
                </div>
                <div className={"flex w-full justify-center mb-6"}>
                    <Button type="submit" variant={"auth"} size={"auth"} disabled={loading}>
                        {loading ? <span className="loader mr-2"></span> : null}
                        LOGAR
                    </Button>
                </div>
            </form>
        </Form>
    )
}

export default FormRegister;
