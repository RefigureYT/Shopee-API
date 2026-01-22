import { Pool } from "pg";
import { databaseInfos, InfoSellerConfig } from "../config.js";
const dbUrl = databaseInfos.databaseUrl;
const schema = databaseInfos.databaseSchema;
const table = databaseInfos.databaseTable;
export const _db = new Pool({
    connectionString: dbUrl,
    max: 5, // Limite de conexões no pool
    idleTimeoutMillis: 10_000, // Fecha conexões ociosas
    connectionTimeoutMillis: 3_000 // Timeout para conseguir se conectar
}); //? Cria a conexão com o banco
// Fechar pool ao encerrar o processo (evita ficar "pendurado")
let shuttingDown = false;
async function shutdownPool(signal) {
    if (shuttingDown)
        return;
    shuttingDown = true;
    try {
        console.log(`🧹 Encerrando pool do Postgres (${signal})...`);
        await _db.end();
    }
    finally {
        process.exit(0);
    }
}
process.on("SIGINT", () => void shutdownPool("SIGINT"));
process.on("SIGTERM", () => void shutdownPool("SIGTERM"));
function isTransientDbError(err) {
    const msg = String(err?.message ?? "");
    // mensagens comuns quando a conexão cai
    return (msg.includes("Connection terminated") ||
        msg.includes("terminating connection") ||
        msg.includes("ECONNRESET") ||
        msg.includes("EPIPE") ||
        msg.includes("ENET") ||
        msg.includes("timeout") ||
        msg.includes("Connection terminated unexpectedly"));
}
async function queryWithRetry(text, params, retries = 1) {
    try {
        return await _db.query(text, params);
    }
    catch (err) {
        if (retries > 0 && isTransientDbError(err)) {
            await new Promise((r) => setTimeout(r, 200));
            return await _db.query(text, params);
        }
        throw err;
    }
}
export async function getAccessToken() {
    const fullTable = `${schema}.${table}`;
    const query = `
    SELECT access_token 
    FROM ${fullTable}
    WHERE provider = $1
    LIMIT 1
    `;
    const res = await queryWithRetry(query, ["shopee"], 1);
    const token = res.rows[0]?.access_token;
    if (!token) {
        throw new Error(`Nenhum access_token encontrado em ${fullTable} para provider='shopee'`);
    }
    InfoSellerConfig.accessToken = token;
    return token;
}
