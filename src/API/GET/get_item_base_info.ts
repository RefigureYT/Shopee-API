import { InfoSellerConfig } from "../../config.js"
import { assertShopeeOk, ShopeeEnvelope, shopeeGet } from "../../services/requestApiShopee.service.js";
import { GetItemListItemStatus } from "./get_item_list.js";

type GetItemBaseInfoResponse = ShopeeEnvelope<{
    item_list: Array<{
        item_id: number;
        item_name?: string;
        item_sku?: string;
        item_status?: GetItemListItemStatus;
        category_id?: number;
        description?: string;

        brand?: {
            brand_id?: number;
            original_brand_name?: string;
        };

        image?: {
            image_id_list?: string[];
            image_url_list?: string[];
        };

        weight?: number;
        package_length?: number;
        package_width?: number;
        package_height?: number;
        days_to_ship?: number;

        logistic_info?: Array<{
            logistic_id?: number;
            logistic_name?: string;
            enabled?: boolean;
            is_free?: boolean;
        }>;

        has_model?: boolean | 0 | 1;

        update_time?: number;
        create_time?: number;

        tag?: {
            kit?: boolean;
        };
    }>;
}>

export async function get_item_base_info(itemIdList: number[]): Promise<GetItemBaseInfoResponse> {
    const url = InfoSellerConfig.host + "/api/v2/product/get_item_base_info";
    const res = await shopeeGet<GetItemBaseInfoResponse>(url, 
        { access_token: true, shop_id: true },
        { item_id_list: itemIdList }
    );

    //? Valida response
    return assertShopeeOk(res);
}


// curl -G 'https://partner.shopeemobile.com/api/v2/product/get_item_base_info' \
//   --data-urlencode 'partner_id=SEU_PARTNER_ID' \
//   --data-urlencode 'timestamp=1704182400' \
//   --data-urlencode 'access_token=SEU_ACCESS_TOKEN' \
//   --data-urlencode 'shop_id=SEU_SHOP_ID' \
//   --data-urlencode 'sign=SIGN_AQUI' \
//   --data-urlencode 'item_id_list=[123456789,987654321]'
