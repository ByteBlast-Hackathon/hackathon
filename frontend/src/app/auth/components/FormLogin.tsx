"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

const formSchema = z.object({
    email: z.string().email({
        message: "Email invalido",
    }),
    password: z.string().min(6, {
        message: "Senha deve ter no minimo 6 caracteres",
    })
})

const FormRegister = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 lg:space-y-8">
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
