import axios from "axios";

interface registerProps {
    name: string;
    email: string;
    password: string;
    cpf: string;
    phone: string;
    birthDate: string;
}

const register = ({name, email, password, cpf, birthDate, phone}: registerProps) => {
    axios.post("/user", {
        name,
        email,
        password,
        cpf,
        phone,
        birthDate,
    }).then((res) => {
        console.log(res);
    })
}