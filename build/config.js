import { configDotenv } from "dotenv";
import chalk from "chalk";
configDotenv();
// ======================================================
// const _accessToken: string = process.env["ACCESS_TOKEN"] || "";
const _shopId = process.env["SHOP_ID"] || "";
const _partnerKey = process.env["PARTNER_KEY"] || "";
const _partnerId = process.env["PARTNER_ID"] || "";
const _host = process.env["HOST"] || "https://partner.shopeemobile.com"; //? URL de produção como fallback
const _databaseUrl = process.env["DATABASE_URL"] || "";
const _databaseSchema = process.env["DB_SCHEMA"] || "";
const _databaseTable = process.env["DB_TABLE"] || "";
// if (_accessToken === "" || _shopId === "" || _partnerKey === "" || _partnerId === "" || _databaseUrl === "" || _databaseSchema === "" || _databaseTable === "") {
if (_shopId === "" || _partnerKey === "" || _partnerId === "" || _databaseUrl === "" || _databaseSchema === "" || _databaseTable === "") {
    console.error(chalk.red.bold("❌ Erro: Arquivo de variáveis do ambiente está incompleto."));
    console.log(chalk.blue("Por favor siga o padrão abaixo:"));
    console.log(chalk.cyan.bold(`SHOP_ID=""
PARTNER_KEY=""
PARTNER_ID=""
HOST="https://partner.shopeemobile.com" # Ou https://partner.test-stable.shopeemobile.com se for teste
DATABASE_URL="postgres://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO
DB_SCHEMA=""
Db_TABLE=""`));
    process.exit(1);
}
export const InfoSellerConfig = {
    partnerId: parseInt(_partnerId),
    partnerKey: _partnerKey,
    host: _host,
    shopId: parseInt(_shopId),
    accessToken: "",
};
export const databaseInfos = {
    databaseTable: _databaseTable,
    databaseSchema: _databaseSchema,
    databaseUrl: _databaseUrl,
};
