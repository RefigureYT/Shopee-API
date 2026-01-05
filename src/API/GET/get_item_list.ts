import { isHttpRequestError, ShopeeEnvelope, shopeeGet } from "../../services/requestApiShopee.service.js";
import { InfoSellerConfig } from "../../config.js";

export type GetItemListItemStatus = 'NORMAL' | 'UNLIST' | 'BANNED' | 'DELETED';

type GetItemListResponse = ShopeeEnvelope<{
        has_next_page: boolean | 0 | 1;
        item: Array<{
            item_id: number,
            item_status: GetItemListItemStatus,
            update_time: number /** Unix timestamp (segundos) */
        }>;
        next_offset: number;
        total_count: number;
        next?: any /** Pode aparecer (às vezes vazio) */
}>

export async function get_item_list(offset: number = 0, pageSize: number = 50, itemStatus: GetItemListItemStatus = 'NORMAL'): Promise<GetItemListResponse> {
    const url = InfoSellerConfig.host + "/api/v2/product/get_item_list";
    const response = await shopeeGet<GetItemListResponse>(url, {
        access_token: true,
        shop_id: true
    }, {
        offset,
        page_size: pageSize,
        item_status: itemStatus
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


// curl -G 'https://partner.shopeemobile.com/api/v2/product/get_item_list' \
//   --data-urlencode 'partner_id=SEU_PARTNER_ID' \
//   --data-urlencode 'timestamp=1704182400' \
//   --data-urlencode 'access_token=SEU_ACCESS_TOKEN' \
//   --data-urlencode 'shop_id=SEU_SHOP_ID' \
//   --data-urlencode 'sign=SIGN_AQUI' \
//   --data-urlencode 'offset=0' \
//   --data-urlencode 'page_size=50' \
//   --data-urlencode 'item_status=NORMAL'