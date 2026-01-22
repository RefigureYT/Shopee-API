import { InfoSellerConfig } from "../../config.js";
import { assertShopeeOk, shopeePost } from "../../services/requestApiShopee.service.js";
/**
 * Faz uma promoção no estilo “preço riscado -> preço promocional”,
 * adicionando itens (e variações) dentro de uma campanha de desconto existente.
 *
 * Importante:
 * - a campanha precisa existir (`discount_id`)
 * - para produtos com variação, envie um item por `model_id` com seu `promotion_price`
 *
 * @param discountId ID da campanha de desconto.
 * @param itemList Lista de itens/variações e seus preços promocionais.
 * @returns Envelope com listas de sucesso e falha.
 * @throws {Error} Se houver erro HTTP (Axios) ou erro de negócio da Shopee.
 */
export async function add_discount_item(discountId, itemOrItems) {
    const url = InfoSellerConfig.host + "/api/v2/discount/add_discount_item";
    const res = await shopeePost(url, { access_token: true, shop_id: true }, { discount_id: discountId, item_list: itemOrItems });
    //? Valida response
    return assertShopeeOk(res);
}
// curl -X POST 'https://partner.shopeemobile.com/api/v2/discount/add_discount_item' \
//   -H 'Content-Type: application/json' \
//   -d '{
//     "partner_id": SEU_PARTNER_ID,
//     "timestamp": 1704182400,
//     "access_token": "SEU_ACCESS_TOKEN",
//     "shop_id": SEU_SHOP_ID,
//     "sign": "SIGN_AQUI",
//     "discount_id": 11223344,
//     "item_list": [
//       { "item_id": 123456789, "model_id": 0, "promotion_price": 199.99 }
//     ]
//   }'
