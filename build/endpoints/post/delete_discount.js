import { InfoSellerConfig } from "../../config.js";
import { assertShopeeOk, shopeePost } from "../../services/requestApiShopee.service.js";
export async function delete_discount(discount_id) {
    const url = InfoSellerConfig.host + "/api/v2/discount/delete_discount";
    const res = await shopeePost(url, { access_token: true, shop_id: true }, { discount_id });
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
