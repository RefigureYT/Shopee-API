/**
 * Convenção de erros:
 * - Erro de transporte/HTTP: Axios lança e nós retornamos `HttpRequestResponseError` (ok:false)
 * - Erro de negócio: Shopee retorna HTTP 200, mas `error`/`message` vêm preenchidos
 * - Use `assertShopeeOk(...)` ou `unwrapShopee(...)` para padronizar tratamento de erro
 */

import axios from "axios";
import { InfoSellerConfig } from "../config.js";
import { signPartner } from "./sign.service.js";

// ====================== TYPE AND INTERFACE =======================

/**
 * Envelope padrão de resposta da Shopee.
 *
 * Mesmo quando o HTTP é 200, a Shopee pode sinalizar erro de “negócio” preenchendo `error`/`message`.
 *
 * @template TResponse Tipo do campo `response` do endpoint específico.
 */
export interface ShopeeEnvelope<TResponse> {
    /** Vem "" quando OK. Se vier preenchido, indica erro de negócio. */
    error: string;
    /** Vem "" quando OK. Mensagem relacionada ao erro/aviso. */
    message: string;
    /** Pode vir "" ou não vir. Geralmente avisos não-bloqueantes. */
    warning?: string;
    /** ID de rastreio da requisição no backend da Shopee. */
    request_id: string;

    /** Payload real do endpoint (varia por endpoint). */
    response: TResponse;

    /** Campo extra de debug (quando existir). Normalmente "" quando OK. */
    debug_message?: string;
}

type AxiosMethods = "get" | "post";

type AxiosArgs = {
    [key: string]: Record<string, string | number | boolean | unknown[] | Record<string, unknown>>;
}

export interface HttpRequestDataObj {
    method: AxiosMethods;
    args: AxiosArgs | undefined;
    access_token: string;
    shop_id: number
}

/**
 * Erro “de transporte”/infra (Axios):
 * - falha de rede
 * - timeout
 * - HTTP != 2xx (dependendo do Axios/config)
 *
 * Observação: isso é diferente de erro “de negócio” da Shopee, que pode vir em HTTP 200.
 */
export type HttpRequestResponseError = {
    ok: false,
    status: number | undefined,
    error: string,
    message: string,
    response: unknown,
}

/**
 * Resultado genérico das funções de request.
 * - Sucesso: retorna `TSuccess`
 * - Falha de transporte: retorna `HttpRequestResponseError`
 *
 * @template TSuccess Tipo retornado quando o request foi bem sucedido.
 */
export type HttpRequestResponse<TSuccess> = TSuccess | HttpRequestResponseError;

/**
 * Type-guard para diferenciar:
 * - retorno de sucesso (`TSuccess`)
 * - retorno de erro de transporte (`HttpRequestResponseError`)
 *
 * @template TSuccess Tipo esperado no caso de sucesso.
 */
function isHttpRequestError<TSuccess>(res: HttpRequestResponse<TSuccess>): res is HttpRequestResponseError {
    return typeof res === "object" && res !== null && "ok" in res && (res as any).ok === false;
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
export function assertShopeeOk<TResponse>(
    res: HttpRequestResponse<ShopeeEnvelope<TResponse>>
): ShopeeEnvelope<TResponse> {
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
export function unwrapShopee<TResponse>(
    res: HttpRequestResponse<ShopeeEnvelope<TResponse>>
): TResponse {
    return assertShopeeOk(res).response;
}

interface ShopeeAuthFlags {
    access_token: boolean
    shop_id: boolean
}
type ShopeeGetArgs = {
    [key: string]: string | number | boolean | number[] | undefined;
    offset?: number,
    page_size?: number,
    item_status?: string,
    item_id_list?: number[]
}

type ObjSign = {
    partnerId: number,
    partnerKey: string,
    path: string,
    timestamp: number,
    accessToken?: string,
    shopId?: number
}

interface ShopeePostBody {
    partner_id: number,
    timestamp: number,
    sign: string,
    access_token?: string,
    shop_id?: number,
    [key: string]: unknown;
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
export async function shopeeGet<TSuccess>(urlWithPath: string, parameters: ShopeeAuthFlags, args: ShopeeGetArgs): Promise<HttpRequestResponse<TSuccess>> {
    //! A ideia é chamar essa função GET com shopeeGet('https://.../', { partner_id: true, o resto false para dinamicidade automatica}, { offset: 100, page_size: 50, item_status: 'NORMAL'});
    const info = InfoSellerConfig;
    const path = urlWithPath.replace(info.host, "");
    const timestamp = Math.floor(Date.now() / 1000);

    const objSign: ObjSign = {
        partnerId: info.partnerId,
        partnerKey: info.partnerKey,
        path,
        timestamp,
    }
    if (parameters.access_token) objSign.accessToken = info.accessToken;
    if (parameters.shop_id) objSign.shopId = info.shopId;

    const sign = signPartner(objSign);

    let url = `${urlWithPath}` +
        `?partner_id=${info.partnerId}` +
        `&timestamp=${timestamp}` +
        `&sign=${sign}`;

    if (parameters.access_token) url += `&access_token=${info.accessToken}`;
    if (parameters.shop_id) url += `&shop_id=${info.shopId}`;

    for (const [key, val] of Object.entries(args)) {
        if (val === undefined) continue;

        const encodedKey = encodeURIComponent(key);

        if (Array.isArray(val)) {
            // Shopee (ex.: item_id_list) NÃO aceita JSON "[1,2,3]" na query.
            // Envia como CSV "1,2,3" (sem colchetes).
            if (val.length === 0) continue;

            const hasObject = val.some((v) => typeof v === "object" && v !== null);
            const rawValue = hasObject
                ? JSON.stringify(val)               // fallback (caso algum dia você realmente passe objetos)
                : val.map((v) => String(v)).join(",");

            url += `&${encodedKey}=${encodeURIComponent(rawValue)}`;
            continue;
        }

        url += `&${encodedKey}=${encodeURIComponent(String(val))}`;
    }

    try {
        const { data: dataResponse } = await axios.get<TSuccess>(url);
        return dataResponse;
    } catch (err: unknown) {
        // Erros HTTP / rede do Axios
        if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            const body = err.response?.data;

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
            response: {}
        };
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
export async function shopeePost<TSuccess>(
    urlWithPath: string,
    parameters: ShopeeAuthFlags,
    bodyOptional: Record<string, unknown>
): Promise<HttpRequestResponse<TSuccess>> {
    const info = InfoSellerConfig;

    const rawPath = urlWithPath.replace(info.host, "");
    const path = rawPath.split("?")[0];

    const timestamp = Math.floor(Date.now() / 1000);


    if (!info.partnerId) {
        throw new Error("[Shopee][CONFIG] partnerId não definido (PARTNER_ID no .env).");
    }
    if (!info.partnerKey) {
        throw new Error("[Shopee][CONFIG] partnerKey não definido (PARTNER_KEY no .env).");
    }
    const objSign: ObjSign = {
        partnerId: info.partnerId,
        partnerKey: info.partnerKey,
        path,
        timestamp,
    }

    if (parameters.access_token) objSign.accessToken = info.accessToken;
    if (parameters.shop_id) objSign.shopId = info.shopId;

    const sign = signPartner(objSign);

    const query: Record<string, string | number> = {
        partner_id: info.partnerId,
        timestamp,
        sign
    };

    if (parameters.access_token) query.access_token = info.accessToken;
    if (parameters.shop_id) query.shop_id = info.shopId;

    try {
        console.log("POST", urlWithPath, query);
        console.log('BODY', bodyOptional);
        const { data: dataResponse } = await axios.post<TSuccess>(
            urlWithPath,
            bodyOptional,
            {
                params: query,
                headers: { "Content-Type": "application/json" }
            }
        );
        return dataResponse;
    } catch (err: unknown) {
        // Erros HTTP / rede do Axios
        if (axios.isAxiosError(err)) {
            const status = err.response?.status;
            const body = err.response?.data;

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
            response: {}
        };
    }
}