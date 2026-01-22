import type { ShopeeEnvelope } from "../../services/requestApiShopee.service.js";
/**
 * Parâmetros para criação de uma campanha de desconto (promoção).
 * `start_time` e `end_time` devem estar em Unix timestamp (segundos).
 */
type AddDiscountObjParameters = {
    /** Nome da campanha (aparece no painel/gestão de promoções). */
    discount_name: string;
    /** Início da campanha (Unix timestamp em segundos). */
    start_time: number; /** Timestamp */
    /** Fim da campanha (Unix timestamp em segundos). */
    end_time: number; /** Timestamp */
};
/**
 * Resposta ao criar uma campanha de desconto.
 * Em alguns cenários o `response` pode trazer `discount_id`.
 */
export type AddDiscountResponse = ShopeeEnvelope<{
    discount_id: number;
}>;
/**
 * Cria uma campanha de desconto (promoção) na Shopee.
 *
 * Fluxo típico:
 * 1) Cria a campanha com `add_discount(...)` -> obtém `discount_id`
 * 2) Adiciona itens/váriações e preço promocional com `add_discount_item(discount_id, ...)`
 *
 * @param obj Dados da campanha (nome + janela de tempo).
 * @returns Envelope com `discount_id` (quando presente).
 * @throws {Error} Se houver erro HTTP (Axios) ou erro de negócio da Shopee.
 */
export declare function add_discount(obj: AddDiscountObjParameters): Promise<AddDiscountResponse>;
export {};
//# sourceMappingURL=add_discount.d.ts.map