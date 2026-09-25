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
}

export async function getClients(search?: string): Promise<Client[]> {
    const { data } = await api.get<Client[]>("/api/v1/clients", {
        params: search ? { search } : undefined,
    });
    return data;
}