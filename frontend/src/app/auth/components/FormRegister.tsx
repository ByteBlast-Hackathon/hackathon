"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {EyeClosedIcon, EyeIcon} from "lucide-react";
import {registerRequest} from "@/api/requests/auth";

const formSchema = z.object({
    name: z.string().min(10, {
        message: "Nome deve ter no minimo 10 caracteres",
    }),
    // exige formato de email e especificamente domínio @gmail.com
    email: z.string().email({
        message: "Email invalido",
    }).refine((val) => /@gmail\.com$/i.test(val), {
        message: "O email deve ser um Gmail (ex: usuario@gmail.com)",
    }),
    // CPF: armazenamos somente dígitos (11)
    cpf: z.string().refine((val) => /^\d{11}$/.test(val), {
        message: "CPF inválido. Deve conter 11 dígitos.",
    }),
    // data de nascimento: garantir idade >= 18
    birthDate: z.string().refine((val) => {
        // espera formato YYYY-MM-DD (input type=date)
        const d = new Date(val)
        if (Number.isNaN(d.getTime())) return false
        const today = new Date()
        let age = today.getFullYear() - d.getFullYear()
        const m = today.getMonth() - d.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
        return age >= 18
    }, {
        message: "Você deve ter pelo menos 18 anos",
    }),
    // phone: 10 ou 11 dígitos (com DDD)
    phone: z.string().refine((val) => /^\d{10,11}$/.test(val), {
        message: "Número de celular inválido (incluir DDD, 10 ou 11 dígitos)",
    }),
    // regras de complexidade para password
    password: z.string().min(8, {
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
    // campo para confirmar a senha (não exposto em backend)
    confirmPassword: z.string().min(1, {
        message: "Confirme sua senha",
    })
}).superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Senhas não coincidem',
            path: ['confirmPassword'],
        })
    }
})

// exporta o tipo do formulário para uso em outros lugares
export type FormRegisterValues = z.infer<typeof formSchema>

// Accept a toggle callback so parent can switch between login/register
const FormRegister = ({ onToggle }: { onToggle?: () => void }) => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const form = useForm<FormRegisterValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            cpf: "",
            birthDate: "",
            phone: "",
            password: "",
            confirmPassword: "",
        },
    })

    function onSubmit(values: FormRegisterValues) {
        // normalmente você não enviaria confirmPassword ao backend
        const { confirmPassword, ...payload } = values
        if (confirmPassword == payload.password) {
            const finalPayload = {
                ...payload,
                cpf: formatCPF(payload.cpf ?? ""),
                phone: formatPhone(payload.phone ?? ""),
            }

            registerRequest({...finalPayload})
        }
    }

    // helpers para formatar CPF e Phone no input visual, enquanto mantemos apenas dígitos no form state
    const formatCPF = (digits: string) => {
        const d = digits.replace(/\D/g, "").slice(0,11)
        if (!d) return ""
        if (d.length <= 3) return d
        if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`
        if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`
        return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
    }

    const formatPhone = (digits: string) => {
        const d = digits.replace(/\D/g, "").slice(0,11)
        if (!d) return ""
        if (d.length <= 2) return `(${d}`
        if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`
        if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
        return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 lg:space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                                <Input type={"text"} placeholder={"Insira seu Nome Completo"} {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gmail</FormLabel>
                                <FormControl>
                                    <Input type={"email"} placeholder={"Insira seu Melhor email"} {...field}/>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* CPF */}
                    <FormField
                        control={form.control}
                        name="cpf"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CPF</FormLabel>
                                <FormControl>
                                    <Input
                                        type={"text"}
                                        inputMode="numeric"
                                        placeholder={"000.000.000-00"}
                                        value={formatCPF(field.value ?? "")}
                                        onChange={(e) => {
                                            const digits = e.target.value.replace(/\D/g, "").slice(0,11)
                                            field.onChange(digits)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Birth date */}
                    <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data de Nascimento</FormLabel>
                                <FormControl>
                                    <Input
                                        type={"date"}
                                        max={new Date().toISOString().slice(0,10)}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Phone */}
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Celular (com DDD)</FormLabel>
                                <FormControl>
                                    <Input
                                        type={"tel"}
                                        inputMode="tel"
                                        placeholder={"(99) 99999-9999"}
                                        value={formatPhone(field.value ?? "")}
                                        onChange={(e) => {
                                            const digits = e.target.value.replace(/\D/g, "").slice(0,11)
                                            field.onChange(digits)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                                <div className="flex relative items-center w-full">
                                    <Input type={!showPassword ?"password" : "text"} placeholder={"Insira uma senha"} {...field}/>
                                    <button type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword(v => !v)} className="absolute right-3 text-sm text-[var(--primary-light-green)] underline font-semibold">
                                        {showPassword ? <EyeIcon /> : <EyeClosedIcon />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirme a Senha</FormLabel>
                            <FormControl>
                                <div className="flex relative items-center w-full">
                                    <Input type={!showConfirm ?"password" : "text"} placeholder={"Insira uma senha"} {...field}/>
                                    <button type="button" aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowConfirm(v => !v)} className="absolute right-3 text-sm text-[var(--primary-light-green)] underline font-semibold">
                                        {showConfirm ? <EyeIcon /> : <EyeClosedIcon />}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-center items-center text-lg">
                    <p>Já possui conta?</p>
                    <Button type={"button"} className={"text-[var(--primary-light-green)] underline font-bold"} onClick={() => {
                        console.log('FormRegister: toggle button clicked, onToggle:', onToggle)
                        try { onToggle?.() } catch (e) { console.error('FormRegister: onToggle error', e) }
                    }}> Login </Button>
                </div>

                <div className={"flex w-full justify-center mb-6"}>
                    <Button type="submit" variant={"auth"} size={"auth"}>Cadastrar</Button>
                </div>
            </form>
        </Form>
    )
}

export default FormRegister;
