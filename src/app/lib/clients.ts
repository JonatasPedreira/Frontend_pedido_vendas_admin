import { api } from "./api";

export interface Client {
    CLI_CODIGO: number;
    CLI_SITUACAO: "A" | "I";
    CLI_NOME: string;
    CLI_FANTASIA: string;
    CLI_SEXO: "M" | "F";
    CLI_ENDERECO: string;
    CLI_FONE: string;
    CLI_EMAIL: string;
    CLI_DATANASC: string;

    CLI_COMPL_ENDERECO: string;
    CLI_CEP: string;
    CLI_BAIRRO: string;
    MUN_CODIGO: number;
    MUN_NOME: string;
    CLI_UF: string;
    CLI_CPF_CNPJ: string;
    CLI_IDENTIDADE: string;
    CLI_MAE: string;
    CLI_PAI: string;
    CLI_ESTADOCIVIL: string;
    CLI_NATURALIDADE: string;

    ROT_CODIGO: number;
    ROT_NOME: string;
}

export async function getClients(search?: string): Promise<Client[]> {
    const { data } = await api.get<Client[]>("/api/v1/clients", {
        params: search ? { search } : undefined,
    });

    console.log("CLIENTES RECEBIDOS:", data.length);
    console.log("ÚLTIMO CLIENTE:", data[data.length - 1]);

    return data;
}

export async function getClientById(id: number): Promise<Client> {
    const { data } = await api.get<Client>(`/api/v1/clients/${id}`);

    console.log("CLIENTE COMPLETO RECEBIDO: ", data);

    return data;
}