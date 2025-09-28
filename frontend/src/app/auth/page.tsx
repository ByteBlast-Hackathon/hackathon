"use client";
import Image from "next/image";
import FormRegister from "@/app/auth/components/FormRegister";
import {useState, useCallback} from "react";
import FormLogin from "@/app/auth/components/FormLogin";

const AuthPage = () => {
    const [route, setRoute] = useState<"login" | "register">("login");

    const goToRegister = useCallback(() => setRoute("register"), [setRoute]);
    const goToLogin = useCallback(() => setRoute("login"), [setRoute]);

    return(
        <div className={"w-full h-full lg:h-screen flex flex-col max-md:pt-12 items-center lg:justify-center px-6"}>
            <div className={"block lg:hidden w-full h-12 mb-12 relative"}>
                <Image src={"/logo_unimed_verde.svg"} alt={""} className={"object-contain"} fill/>
            </div>
            <div className={`w-full px-8 mb-6 lg:w-340 lg:h-220 bg-primary ${route == "login" && "flex-row-reverse"} gap-20 flex items-center justify-between rounded-lg duration-250 transition-all`}>
                <div className={"relative w-full lg:w-1/2 h-full lg:ml-12 mt-10 lg:mt-28"}>
                    <h1 className={"text-4xl max-md:justify-center font-bold mb-10 lg:mb-14"}> {route == "login"? "Login" : "Cadastro" } </h1>

                    {route === "login" ? (
                        <FormLogin onToggle={goToRegister} />
                    ) : (
                        <FormRegister onToggle={goToLogin} />
                    )}
                </div>
                <div className={"hidden lg:block relative w-1/2 h-full mr-12"}>
                    <Image src={"/register_image.png"} alt={"Doutora tratando de um paciente"} fill  className={"py-14"}/>
                </div>
            </div>
        </div>
    )
}

export default AuthPage