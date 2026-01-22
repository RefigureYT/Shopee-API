import { InfoSellerConfig } from "../../config.js";
import { assertShopeeOk, shopeePost } from "../../services/requestApiShopee.service.js";
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
export async function add_discount(obj) {
    const url = InfoSellerConfig.host + "/api/v2/discount/add_discount";
    const res = await shopeePost(url, { access_token: true, shop_id: true }, { discount_name: obj.discount_name, start_time: obj.start_time, end_time: obj.end_time });
    //? Valida response
    return assertShopeeOk(res);
}
// curl -X POST 'https://partner.shopeemobile.com/api/v2/discount/add_discount' \
//   -H 'Content-Type: application/json' \
//   -d '{
//     "partner_id": SEU_PARTNER_ID,
//     "timestamp": 1704182400,
//     "access_token": "SEU_ACCESS_TOKEN",
//     "shop_id": SEU_SHOP_ID,
//     "sign": "SIGN_AQUI",
//     "discount_name": "Promo Janeiro",
//     "start_time": 1704186000,
//     "end_time": 1704272400
//   }'
