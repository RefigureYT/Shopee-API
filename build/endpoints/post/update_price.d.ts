import type { ShopeeEnvelope } from "../../services/requestApiShopee.service.js";
/**
 * Resposta do endpoint de atualização de preço.
 * Na prática, muitos endpoints retornam `response` vazio quando OK.
 */
type UpdatePriceResponse = ShopeeEnvelope<Record<string, never>>;
/**
 * Item de alteração de preço por variação (model).
 * Use `get_model_list(item_id)` para descobrir os `model_id` válidos daquele anúncio.
 */
type UpdatePrice_PriceList = {
    /** ID da variação (model) do anúncio. */
    model_id: number;
    /** Preço “cheio/base” (não é preço de promoção). */
    original_price: number;
};
/**
 * Atualiza o preço base (“original_price”) de UM anúncio (`item_id`),
 * podendo atualizar várias variações desse anúncio de uma vez via `price_list`.
 *
 * Use isso para mudar o “preço normal”.
 * Para promoções (preço riscado -> preço promocional), use endpoints de desconto
 * como `add_discount` + `add_discount_item`.
 *
 * @param itemId ID do anúncio na Shopee.
 * @param priceList Lista de preços por variação (model_id -> original_price).
 * @returns Envelope padrão da Shopee. Em sucesso, normalmente `response` vem vazio.
 * @throws {Error} Se houver erro HTTP (Axios) ou erro de negócio da Shopee (error/message).
 */
export declare function update_price(itemId: number, priceList: UpdatePrice_PriceList[]): Promise<UpdatePriceResponse>;
export {};
//# sourceMappingURL=update_price.d.ts.map