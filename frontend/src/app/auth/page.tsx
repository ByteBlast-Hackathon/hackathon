import Image from "next/image";
import FormRegister from "@/app/auth/components/FormRegister";

const AuthPage = () => {
    return(
        <div className={"w-full h-screen flex flex-col items-center justify-center px-6"}>
            <div className={"block lg:hidden w-full h-12 mb-16 relative"}>
                <Image src={"/logo_unimed_verde.svg"} alt={""} className={"object-contain"} fill/>
            </div>
            <div className={"w-full px-8 lg:w-300 lg:h-200 bg-primary gap-20 flex items-center justify-between rounded-lg"}>
                <div className={"relative w-full lg:w-1/2 h-full lg:ml-12 mt-12 lg:mt-28"}>
                    <h1 className={"text-4xl max-md:justify-center font-bold mb-10 lg:mb-20"}> Cadastro </h1>
                    <FormRegister />
                </div>
                <div className={"hidden lg:block relative w-1/2 h-full mr-12"}>
                    <Image src={"/register_image.png"} alt={"Doutora tratando de um paciente"} fill  className={"py-14"}/>
                </div>
            </div>
        </div>
    )
}

export default AuthPage