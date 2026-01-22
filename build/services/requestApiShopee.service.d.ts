/**
 * Convenção de erros:
 * - Erro de transporte/HTTP: Axios lança e nós retornamos `HttpRequestResponseError` (ok:false)
 * - Erro de negócio: Shopee retorna HTTP 200, mas `error`/`message` vêm preenchidos
 * - Use `assertShopeeOk(...)` ou `unwrapShopee(...)` para padronizar tratamento de erro
 */
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
};
export interface HttpRequestDataObj {
    method: AxiosMethods;
    args: AxiosArgs | undefined;
    access_token: string;
    shop_id: number;
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
    ok: false;
    status: number | undefined;
    error: string;
    message: string;
    response: unknown;
};
/**
 * Resultado genérico das funções de request.
 * - Sucesso: retorna `TSuccess`
 * - Falha de transporte: retorna `HttpRequestResponseError`
 *
 * @template TSuccess Tipo retornado quando o request foi bem sucedido.
 */
export type HttpRequestResponse<TSuccess> = TSuccess | HttpRequestResponseError;
/**
 * Valida e “normaliza” o fluxo de erro:
 * 1) Se deu erro de transporte (Axios), lança Error com contexto HTTP.
 * 2) Se a Shopee respondeu HTTP 200 mas `error` veio preenchido, lança Error de negócio.
 * 3) Se estiver OK, devolve o envelope tipado.
 *
 * @template TResponse Tipo do payload em `envelope.response`.
 * @throws {Error} Quando houver erro de transporte ou erro de negócio da Shopee.
 */
export declare function assertShopeeOk<TResponse>(res: HttpRequestResponse<ShopeeEnvelope<TResponse>>): ShopeeEnvelope<TResponse>;
/**
 * Igual ao `assertShopeeOk`, mas já retorna direto o `response` do envelope.
 * É útil pra deixar os módulos de endpoint bem limpos:
 * `return unwrapShopee(res)`
 *
 * @template TResponse Tipo do payload em `envelope.response`.
 * @throws {Error} Quando houver erro de transporte ou erro de negócio da Shopee.
 */
export declare function unwrapShopee<TResponse>(res: HttpRequestResponse<ShopeeEnvelope<TResponse>>): TResponse;
interface ShopeeAuthFlags {
    access_token: boolean;
    shop_id: boolean;
}
type ShopeeGetArgs = {
    [key: string]: string | number | boolean | number[] | undefined;
    offset?: number;
    page_size?: number;
    item_status?: string;
    item_id_list?: number[];
};
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
export declare function shopeeGet<TSuccess>(urlWithPath: string, parameters: ShopeeAuthFlags, args: ShopeeGetArgs): Promise<HttpRequestResponse<TSuccess>>;
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
export declare function shopeePost<TSuccess>(urlWithPath: string, parameters: ShopeeAuthFlags, bodyOptional: Record<string, unknown>): Promise<HttpRequestResponse<TSuccess>>;
export {};
//# sourceMappingURL=requestApiShopee.service.d.ts.map