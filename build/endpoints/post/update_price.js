import { InfoSellerConfig } from "../../config.js";
import { assertShopeeOk, shopeePost } from "../../services/requestApiShopee.service.js";
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
export async function update_price(itemId, priceList) {
    const url = InfoSellerConfig.host + "/api/v2/product/update_price";
    const res = await shopeePost(url, { access_token: true, shop_id: true }, { item_id: itemId, price_list: priceList });
    //? Valida response
    return assertShopeeOk(res);
}
// curl -X POST 'https://partner.shopeemobile.com/api/v2/product/update_price' \
//   -H 'Content-Type: application/json' \
//   -d '{
//     "partner_id": SEU_PARTNER_ID,
//     "timestamp": 1704182400,
//     "access_token": "SEU_ACCESS_TOKEN",
//     "shop_id": SEU_SHOP_ID,
//     "sign": "SIGN_AQUI",
//     "item_id": 123456789,
//     "price_list": [
//       { "model_id": 0, "original_price": 250.00 }
//     ]
//   }'
