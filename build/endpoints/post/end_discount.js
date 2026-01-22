import { InfoSellerConfig } from "../../config.js";
import { assertShopeeOk, shopeePost } from "../../services/requestApiShopee.service.js";
export async function end_discount(discount_id) {
    const url = InfoSellerConfig.host + "/api/v2/discount/end_discount";
    const res = await shopeePost(url, { access_token: true, shop_id: true }, { discount_id });
    //? Valida response
    return assertShopeeOk(res);
}
