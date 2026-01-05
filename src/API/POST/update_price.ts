import { InfoSellerConfig } from "../../config.js";
import { isHttpRequestError, shopeePost } from "../../services/requestApiShopee.service.js";

interface UpdatePriceResponse {
    error: string;       // "" quando OK
    message: string;     // "" quando OK
    warning?: string;    // pode vir "" ou não vir
    request_id: string;
    response: {} /** Geralmente vem vazio quando OK */
    debug_message?: string; /** Geralmente vem vazio quando OK */
}

type UpdatePrice_PriceList = {
    model_id: number;
    original_price: number;
}

export async function update_price(itemId: number, priceList: UpdatePrice_PriceList[]): Promise<UpdatePriceResponse> {
    const url = InfoSellerConfig.host + "/api/v2/product/update_price";
    const response = await shopeePost<UpdatePriceResponse>(url, {
        access_token: true,
        shop_id: true
    }, {
        item_id: itemId,
        price_list: priceList
    });

    //? Valida a resposta
    if(isHttpRequestError(response)) {
        throw new Error(
            `[Shopee][HTTP] ${response.status ?? ""} ${response.error}: ${response.message}`
        );
    }

    //? Erro "de negócio" da Shopee (HTTP 200 mas error/message preenchidos)
    if(response.error) {
        throw new Error(
            `[Shopee][API] ${response.error}: ${response.message || "Sem mensagem"}`
        );
    }

    return response;
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