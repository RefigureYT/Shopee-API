/**
 * Convenção de erros:
 * - Erro de transporte/HTTP: Axios lança e nós retornamos `HttpRequestResponseError` (ok:false)
 * - Erro de negócio: Shopee retorna HTTP 200, mas `error`/`message` vêm preenchidos
 * - Use `assertShopeeOk(...)` ou `unwrapShopee(...)` para padronizar tratamento de erro
 */
import axios from "axios";
import { InfoSellerConfig } from "../config.js";
import { signPartner } from "./sign.service.js";
import { getAccessToken } from "./database.service.js";
/**
 * Type-guard para diferenciar:
 * - retorno de sucesso (`TSuccess`)
 * - retorno de erro de transporte (`HttpRequestResponseError`)
 *
 * @template TSuccess Tipo esperado no caso de sucesso.
 */
function isHttpRequestError(res) {
    return typeof res === "object" && res !== null && "ok" in res && res.ok === false;
}
/**
 * Valida e “normaliza” o fluxo de erro:
 * 1) Se deu erro de transporte (Axios), lança Error com contexto HTTP.
 * 2) Se a Shopee respondeu HTTP 200 mas `error` veio preenchido, lança Error de negócio.
 * 3) Se estiver OK, devolve o envelope tipado.
 *
 * @template TResponse Tipo do payload em `envelope.response`.
 * @throws {Error} Quando houver erro de transporte ou erro de negócio da Shopee.
 */
export function assertShopeeOk(res) {
    if (isHttpRequestError(res)) {
        throw new Error(`[Shopee][HTTP] ${res.status ?? ""} ${res.error}: ${res.message}`);
    }
    if (res.error) {
        throw new Error(`[Shopee][API] ${res.error}: ${res.message || "Sem mensagem"}`);
    }
    return res;
}
/**
 * Igual ao `assertShopeeOk`, mas já retorna direto o `response` do envelope.
 * É útil pra deixar os módulos de endpoint bem limpos:
 * `return unwrapShopee(res)`
 *
 * @template TResponse Tipo do payload em `envelope.response`.
 * @throws {Error} Quando houver erro de transporte ou erro de negócio da Shopee.
 */
export function unwrapShopee(res) {
    return assertShopeeOk(res).response;
}
const MAX_AUTH_REFRESH_TRIES = 3;
// 10 minutos somados no total de espera por 429
const MAX_429_TOTAL_WAIT_MS = 10 * 60 * 1000;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Tenta ler Retry-After (segundos) de um AxiosResponse (quando a API fornece).
 * Retorna `undefined` se não existir/for inválido.
 */
function parseRetryAfterSeconds(headers) {
    if (!headers || typeof headers !== "object")
        return undefined;
    // Axios normaliza headers como objeto (geralmente lower-case)
    const h = headers;
    const ra = h["retry-after"] ?? h["Retry-After"];
    if (typeof ra === "number" && Number.isFinite(ra) && ra >= 0)
        return ra;
    if (typeof ra === "string") {
        const n = Number(ra);
        if (Number.isFinite(n) && n >= 0)
            return n;
    }
    return undefined;
}
function isAuthError(status) {
    return status === 401 || status === 403;
}
function isTooManyRequests(status) {
    return status === 429;
}
function formatAxiosErrPrefix(status, code) {
    const s = status ? String(status) : "";
    const c = code ? String(code) : "AXIOS_ERROR";
    return `[Shopee][HTTP] ${s} ${c}`.trim();
}
/**
 * Evita "thundering herd": se vários requests baterem 401/403 ao mesmo tempo,
 * só um faz o refresh e os outros aguardam a mesma Promise.
 */
let refreshTokenInFlight = null;
async function refreshAccessTokenOnce() {
    if (!refreshTokenInFlight) {
        refreshTokenInFlight = (async () => {
            try {
                return await getAccessToken();
            }
            finally {
                refreshTokenInFlight = null;
            }
        })();
    }
    return await refreshTokenInFlight;
}
// =================================================================
/**
 * Executa um GET assinado na Shopee Partner API.
 *
 * O fluxo é:
 * - extrair `path` a partir do `urlWithPath` (removendo o host)
 * - gerar `timestamp` (segundos)
 * - montar `sign` via `signPartner`
 * - montar query base: partner_id, timestamp, sign
 * - incluir access_token/shop_id dependendo das flags
 * - incluir `args` extras na query string
 *
 * Observação sobre arrays nos args:
 * alguns endpoints esperam listas no formato JSON (ex.: `[1,2,3]`),
 * então é comum serializar `number[]` com `JSON.stringify`.
 *
 * @template TSuccess Tipo esperado do `data` retornado pela Shopee (ex.: `ShopeeEnvelope<...>`).
 * @param urlWithPath URL completa (host + path).
 * @param parameters Flags dizendo se deve enviar `access_token` e `shop_id`.
 * @param args Parâmetros adicionais do endpoint (query string).
 * @returns `TSuccess` em sucesso, ou `HttpRequestResponseError` em erro de transporte.
 */
export async function shopeeGet(urlWithPath, parameters, args) {
    //! A ideia é chamar essa função GET com shopeeGet('https://.../', { partner_id: true, o resto false para dinamicidade automatica}, { offset: 100, page_size: 50, item_status: 'NORMAL'});
    const info = InfoSellerConfig;
    // Importante: o `path` usado na assinatura não pode conter query string
    const rawPath = urlWithPath.replace(info.host, "");
    const path = rawPath.split("?")[0];
    if (!path) {
        throw new Error(`[requestApiShopee][GET] Ocorreu um erro ao definir o path. rawPath: ${rawPath}, urlWithPath: ${urlWithPath}, info.host: ${info.host}`);
    }
    const retry = {
        tooManyRequestsTries: 0,
        tooManyRequestsWaitedMs: 0,
        authRefreshTries: 0,
    };
    while (true) {
        const timestamp = Math.floor(Date.now() / 1000);
        const objSign = {
            partnerId: info.partnerId,
            partnerKey: info.partnerKey,
            path,
            timestamp,
        };
        if (parameters.access_token)
            objSign.accessToken = info.accessToken;
        if (parameters.shop_id)
            objSign.shopId = info.shopId;
        const sign = signPartner(objSign);
        // Monta a URL com segurança via URLSearchParams (evita bugs com ? / &)
        const u = new URL(urlWithPath);
        u.searchParams.set("partner_id", String(info.partnerId));
        u.searchParams.set("timestamp", String(timestamp));
        u.searchParams.set("sign", sign);
        if (parameters.access_token)
            u.searchParams.set("access_token", String(info.accessToken));
        if (parameters.shop_id)
            u.searchParams.set("shop_id", String(info.shopId));
        for (const [key, val] of Object.entries(args)) {
            if (val === undefined)
                continue;
            if (Array.isArray(val)) {
                // Shopee (ex.: item_id_list) NÃO aceita JSON "[1,2,3]" na query.
                // Envia como CSV "1,2,3" (sem colchetes).
                if (val.length === 0)
                    continue;
                const hasObject = val.some((v) => typeof v === "object" && v !== null);
                const rawValue = hasObject
                    ? JSON.stringify(val) // fallback (caso algum dia você realmente passe objetos)
                    : val.map((v) => String(v)).join(",");
                u.searchParams.set(key, rawValue);
                continue;
            }
            u.searchParams.set(key, String(val));
        }
        try {
            const { data: dataResponse } = await axios.get(u.toString());
            return dataResponse;
        }
        catch (err) {
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const body = err.response?.data;
                const headers = err.response?.headers;
                // -------- 401/403: tenta buscar um novo token e repetir (máx 3 vezes consecutivas)
                if (isAuthError(status)) {
                    retry.authRefreshTries += 1;
                    if (retry.authRefreshTries > MAX_AUTH_REFRESH_TRIES) {
                        return {
                            ok: false,
                            status,
                            error: err.code ?? "AUTH_ERROR",
                            message: `${formatAxiosErrPrefix(status, err.code)}: ${err.message} (refresh token excedeu ${MAX_AUTH_REFRESH_TRIES} tentativa(s))`,
                            response: body,
                        };
                    }
                    // evita vários refresh simultâneos
                    await refreshAccessTokenOnce();
                    continue;
                }
                // status diferente de 401/403 zera o contador (regra de "consecutivo")
                retry.authRefreshTries = 0;
                // -------- 429: backoff linear 1,2,3... até permitir ou estourar 10min somados
                if (isTooManyRequests(status)) {
                    retry.tooManyRequestsTries += 1;
                    const retryAfter = parseRetryAfterSeconds(headers);
                    const linearSeconds = retry.tooManyRequestsTries; // 1..N
                    const waitSeconds = retryAfter !== undefined ? Math.max(retryAfter, linearSeconds) : linearSeconds;
                    const waitMs = waitSeconds * 1000;
                    const nextTotal = retry.tooManyRequestsWaitedMs + waitMs;
                    if (nextTotal > MAX_429_TOTAL_WAIT_MS) {
                        return {
                            ok: false,
                            status,
                            error: err.code ?? "TOO_MANY_REQUESTS",
                            message: `${formatAxiosErrPrefix(status, err.code)}: ${err.message} (429 aguardou ${Math.round(retry.tooManyRequestsWaitedMs / 1000)}s no total; limite=600s)`,
                            response: body,
                        };
                    }
                    retry.tooManyRequestsWaitedMs = nextTotal;
                    await sleep(waitMs);
                    continue;
                }
                // -------- outros erros HTTP / rede do Axios (sem retry aqui)
                return {
                    ok: false,
                    status,
                    error: err.code ?? "AXIOS_ERROR",
                    message: err.message,
                    response: body,
                };
            }
            // Erros não relacionados ao Axios
            return {
                ok: false,
                status: undefined,
                error: "UNKNOWN_ERROR",
                message: err instanceof Error ? err.message : String(err),
                response: {},
            };
        }
    }
}
/**
 * Executa um POST assinado na Shopee Partner API (JSON body).
 *
 * O corpo sempre contém:
 * - partner_id
 * - timestamp
 * - sign
 * E opcionalmente:
 * - access_token
 * - shop_id
 * Além de campos específicos do endpoint (via `bodyOptional`).
 *
 * Dica de segurança:
 * use `Record<string, unknown>` (em vez de `{}` ou `unknown`) para garantir
 * que o spread `...bodyOptional` seja sempre um objeto indexável.
 *
 * @template TSuccess Tipo esperado do retorno (`data`) do endpoint.
 * @param urlWithPath URL completa (host + path).
 * @param parameters Flags dizendo se deve enviar `access_token` e `shop_id`.
 * @param bodyOptional Campos específicos do endpoint (ex.: item_id, price_list, discount_id...).
 * @returns `TSuccess` em sucesso, ou `HttpRequestResponseError` em erro de transporte.
 */
export async function shopeePost(urlWithPath, parameters, bodyOptional) {
    const info = InfoSellerConfig;
    const rawPath = urlWithPath.replace(info.host, "");
    const path = rawPath.split("?")[0];
    if (!path) {
        throw new Error(`[requestApiShopee][POST] Ocorreu um erro ao definir o path. rawPath: ${rawPath}, urlWithPath: ${urlWithPath}, info.host: ${info.host}`);
    }
    if (!info.partnerId) {
        throw new Error("[Shopee][CONFIG] partnerId não definido (PARTNER_ID no .env).");
    }
    if (!info.partnerKey) {
        throw new Error("[Shopee][CONFIG] partnerKey não definido (PARTNER_KEY no .env).");
    }
    const retry = {
        tooManyRequestsTries: 0,
        tooManyRequestsWaitedMs: 0,
        authRefreshTries: 0,
    };
    while (true) {
        const timestamp = Math.floor(Date.now() / 1000);
        const objSign = {
            partnerId: info.partnerId,
            partnerKey: info.partnerKey,
            path,
            timestamp,
        };
        if (parameters.access_token)
            objSign.accessToken = info.accessToken;
        if (parameters.shop_id)
            objSign.shopId = info.shopId;
        const sign = signPartner(objSign);
        const query = {
            partner_id: info.partnerId,
            timestamp,
            sign,
        };
        if (parameters.access_token)
            query["access_token"] = info.accessToken;
        if (parameters.shop_id)
            query["shop_id"] = info.shopId;
        try {
            // console.log("POST", urlWithPath, query); //TODO [DEBUG]
            // console.log('BODY', bodyOptional); //TODO [DEBUG]
            const { data: dataResponse } = await axios.post(urlWithPath, bodyOptional, {
                params: query,
                headers: { "Content-Type": "application/json" },
            });
            return dataResponse;
        }
        catch (err) {
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const body = err.response?.data;
                const headers = err.response?.headers;
                // -------- 401/403: tenta buscar um novo token e repetir (máx 3 vezes consecutivas)
                if (isAuthError(status)) {
                    retry.authRefreshTries += 1;
                    if (retry.authRefreshTries > MAX_AUTH_REFRESH_TRIES) {
                        return {
                            ok: false,
                            status,
                            error: err.code ?? "AUTH_ERROR",
                            message: `${formatAxiosErrPrefix(status, err.code)}: ${err.message} (refresh token excedeu ${MAX_AUTH_REFRESH_TRIES} tentativa(s))`,
                            response: body,
                        };
                    }
                    await refreshAccessTokenOnce();
                    continue;
                }
                retry.authRefreshTries = 0;
                // -------- 429: backoff linear 1,2,3... até permitir ou estourar 10min somados
                // ⚠️ Atenção: retry automático em POST pode duplicar efeito se o endpoint não for idempotente.
                if (isTooManyRequests(status)) {
                    retry.tooManyRequestsTries += 1;
                    const retryAfter = parseRetryAfterSeconds(headers);
                    const linearSeconds = retry.tooManyRequestsTries; // 1..N
                    const waitSeconds = retryAfter !== undefined ? Math.max(retryAfter, linearSeconds) : linearSeconds;
                    const waitMs = waitSeconds * 1000;
                    const nextTotal = retry.tooManyRequestsWaitedMs + waitMs;
                    if (nextTotal > MAX_429_TOTAL_WAIT_MS) {
                        return {
                            ok: false,
                            status,
                            error: err.code ?? "TOO_MANY_REQUESTS",
                            message: `${formatAxiosErrPrefix(status, err.code)}: ${err.message} (429 aguardou ${Math.round(retry.tooManyRequestsWaitedMs / 1000)}s no total; limite=600s)`,
                            response: body,
                        };
                    }
                    retry.tooManyRequestsWaitedMs = nextTotal;
                    await sleep(waitMs);
                    continue;
                }
                return {
                    ok: false,
                    status,
                    error: err.code ?? "AXIOS_ERROR",
                    message: err.message,
                    response: body,
                };
            }
            return {
                ok: false,
                status: undefined,
                error: "UNKNOWN_ERROR",
                message: err instanceof Error ? err.message : String(err),
                response: {},
            };
        }
    }
}
