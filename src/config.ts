import { configDotenv } from "dotenv";
import chalk from "chalk";
configDotenv();

// ================= INTERFACES E TIPOS =================
interface InfoSellerConfig {
    partnerId: number;
    partnerKey: string;
    host: string;
    shopId: number;
    accessToken: string;
}
// ======================================================
const _accessToken: string = process.env.ACCESS_TOKEN || "";
const _shopId: string = process.env.SHOP_ID || "";
const _partnerKey: string = process.env.PARTNER_KEY || "";
const _partnerId: string = process.env.PARTNER_ID || "";
const _host: string = process.env.HOST || "https://partner.shopeemobile.com"; //? URL de produção como fallback

if (_accessToken === "" || _shopId === "" || _partnerKey === "" || _partnerId === "") {
    console.error(chalk.red.bold("❌ Erro: Arquivo de variáveis do ambiente está incompleto."));
    console.log(chalk.blue("Por favor siga o padrão abaixo:"));
    console.log(chalk.cyan.bold(`ACCESS_TOKEN=""
SHOP_ID=""
PARTNER_KEY=""
PARTNER_ID=""
HOST="https://partner.shopeemobile.com" # Ou https://partner.test-stable.shopeemobile.com se for teste`));
    process.exit(1);
}

export const InfoSellerConfig: Readonly<InfoSellerConfig> = {
    partnerId: parseInt(_partnerId),
    partnerKey: _partnerKey,
    host: _host,
    shopId: parseInt(_shopId),
    accessToken: _accessToken,
} as const;