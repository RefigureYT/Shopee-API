import { InfoSellerConfig } from "../../config.js";
import { assertShopeeOk, ShopeeEnvelope, shopeePost } from "../../services/requestApiShopee.service.js";

type AddDiscountItemResponse = ShopeeEnvelope<{
    discount_id: number;

    success_item_list: Array<{
        item_id: number;
        model_id: number;
        promotion_price: number;
    }>;

    failed_item_list: Array<{
        item_id: number;
        model_id: number;
        error?: string;
        message?: string;
    }>; /** Pode vir itens falhos e itens bem sucedidos numa mesma response: {}*/
}>;

type AddDiscountItem_ItemList = {
    item_id: number;
    model_id: number;
    promotion_price: number;
}

export async function add_discount_item(discountId: number, itemList: AddDiscountItem_ItemList[]): Promise<AddDiscountItemResponse> {
    const url = InfoSellerConfig.host + "/api/v2/discount/add_discount_item";
    const res = await shopeePost<AddDiscountItemResponse>(url, 
        { access_token: true, shop_id: true },
        { discount_id: discountId, item_list: itemList }
    );

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
