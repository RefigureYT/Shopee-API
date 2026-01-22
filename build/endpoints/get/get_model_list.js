import { InfoSellerConfig } from "../../config.js";
import { assertShopeeOk, shopeeGet } from "../../services/requestApiShopee.service.js";
/**
 * Lista as variações (`model_id`) de UM anúncio (`item_id`).
 *
 * Esse endpoint é por item (não aceita lista).
 * Use quando:
 * - `get_item_base_info` indicar `has_model = true`
 * - você precisar atualizar preço por variação (`update_price`)
 * - você precisar aplicar promoção por variação (`add_discount_item`)
 *
 * @param itemId ID do anúncio (`item_id`) para consultar variações.
 * @returns Envelope padrão da Shopee contendo as variações (`model`) e atributos (`tier_variation`).
 * @throws {Error} Se ocorrer erro HTTP (Axios) ou erro “de negócio” (error/message preenchidos).
 *
 * @example
 * const models = await get_model_list(53553342037);
 * console.log(models.response.tier_variation?.[0]);
 * console.log(models.response.model?.[0]?.model_id);
 */
export async function get_model_list(itemId) {
    const url = InfoSellerConfig.host + "/api/v2/product/get_model_list";
    const res = await shopeeGet(url, { access_token: true, shop_id: true }, { item_id: itemId });
    //? Valida response
    return assertShopeeOk(res);
}
// curl -G 'https://partner.shopeemobile.com/api/v2/product/get_model_list' \
//   --data-urlencode 'partner_id=SEU_PARTNER_ID' \
//   --data-urlencode 'timestamp=1704182400' \
//   --data-urlencode 'access_token=SEU_ACCESS_TOKEN' \
//   --data-urlencode 'shop_id=SEU_SHOP_ID' \
//   --data-urlencode 'sign=SIGN_AQUI' \
//   --data-urlencode 'item_id=123456789'
