import { InfoSellerConfig } from "../../config.js";
import { isHttpRequestError, ShopeeEnvelope, shopeePost } from "../../services/requestApiShopee.service.js";

type AddDiscountObjParameters = {
    discount_name: string;
    start_time: number; /** Timestamp */
    end_time: number; /** Timestamp */
}

type AddDiscountResponse = ShopeeEnvelope<{} /** Geralmente vem vazio quando OK */>;

export async function add_discount(obj: AddDiscountObjParameters): Promise<AddDiscountResponse> {
    const url = InfoSellerConfig.host + "/api/v2/discount/add_discount"
    const response = await shopeePost<AddDiscountResponse>(url, {
        access_token: true,
        shop_id: true
    }, {
        discount_name: obj.discount_name,
        start_time: obj.start_time,
        end_time: obj.end_time
    });

    //? Valida a resposta
    if (isHttpRequestError(response)) {
        throw new Error(
            `[Shopee][HTTP] ${response.status ?? ""} ${response.error}: ${response.message}`
        );
    }

    //? Erro "de negócio" da Shopee (HTTP 200 mas error/message preenchidos)
    if (response.error) {
        throw new Error(
            `[Shopee][API] ${response.error}: ${response.message || "Sem mensagem"}`
        );
    }

    return response;
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
