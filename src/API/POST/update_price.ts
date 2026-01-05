import { InfoSellerConfig } from "../../config.js";
import { assertShopeeOk, ShopeeEnvelope, shopeePost } from "../../services/requestApiShopee.service.js";

type UpdatePriceResponse = ShopeeEnvelope<Record<string, never>>;

type UpdatePrice_PriceList = {
    model_id: number;
    original_price: number;
}

export async function update_price(itemId: number, priceList: UpdatePrice_PriceList[]): Promise<UpdatePriceResponse> {
    const url = InfoSellerConfig.host + "/api/v2/product/update_price";
    const res = await shopeePost<UpdatePriceResponse>(url,
        { access_token: true, shop_id: true }, 
        { item_id: itemId, price_list: priceList }
    );

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