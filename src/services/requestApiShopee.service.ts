import axios from "axios";
import { InfoSellerConfig } from "../config.js";
import { signPartner } from "./sign.service.js";

// ====================== TYPE AND INTERFACE =======================

export interface ShopeeEnvelope<TResponse> {
    error: string;       // "" quando OK
    message: string;     // "" quando OK
    warning?: string;    // pode vir "" ou não vir
    request_id: string;

    response: TResponse;

    debug_message?: string; /** Geralmente vem vazio quando OK */
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

export type HttpRequestResponseError = {
    ok: false,
    status: number | undefined,
    error: string,
    message: string,
    response: unknown,
}

export type HttpRequestResponse<TSuccess> = TSuccess | HttpRequestResponseError;

function isHttpRequestError<TSuccess>(res: HttpRequestResponse<TSuccess>): res is HttpRequestResponseError {
    return typeof res === "object" && res !== null && "ok" in res && (res as any).ok === false;
}

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
            const encodedValue = encodeURIComponent(JSON.stringify(val));
            url += `&${encodedKey}=${encodedValue}`;
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

export async function shopeePost<TSuccess>(urlWithPath: string, parameters: ShopeeAuthFlags, bodyOptional: Record<string, unknown>): Promise<HttpRequestResponse<TSuccess>> {
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

    const body: ShopeePostBody = {
        ...bodyOptional,
        partner_id: info.partnerId,
        timestamp,
        sign
    }
    if (parameters.access_token) body.access_token = info.accessToken;
    if (parameters.shop_id) body.shop_id = info.shopId;

    try {
        const { data: dataResponse } = await axios.post<TSuccess>(urlWithPath, body, { headers: { "Content-Type": "application/json" } });
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