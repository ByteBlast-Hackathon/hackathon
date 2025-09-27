"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

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

const FormRegister = () => {
    const form = useForm<FormRegisterValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    function onSubmit(values: FormRegisterValues) {
        // normalmente você não enviaria confirmPassword ao backend
        const { confirmPassword, ...payload } = values
        if (confirmPassword == payload.password) {
            console.log(payload)
        }
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
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Senha</FormLabel>
                            <FormControl>
                                <Input type={"password"} placeholder={"Insira uma senha"} {...field}/>
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
                                <Input type={"password"} placeholder={"Confirme sua senha"} {...field}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-center items-center text-lg">
                    <p>Já possui conta?</p> <Button type={"button"} className={"text-[var(--primary-light-green)] underline font-bold"}> Login </Button>
                </div>

                <div className={"flex w-full justify-center"}>
                    <Button type="submit" variant={"auth"} size={"auth"}>Submit</Button>
                </div>
            </form>
        </Form>
    )
}

export default FormRegister;
