import { InfoSellerConfig } from "../../config.js";
import { isHttpRequestError, ShopeeEnvelope, shopeeGet } from "../../services/requestApiShopee.service.js";

type ShopeeBool = boolean | 0 | 1;

export type GetModelListResponse = ShopeeEnvelope<{
    tier_variation?: Array<{
        name?: string;
        option_list?: Array<{
            option?: string;
            image?: { image_url?: string; image_id?: string } | null;
        }>;
    }>;

    model: Array<{
        model_id: number;
        model_name?: string;

        promotion_id?: number;
        has_promotion?: ShopeeBool;

        tier_index?: number[]; // pode vir vazio dependendo do caso

        price_info?: Array<{
            current_price?: number;
            original_price?: number;
            inflated_price_of_current_price?: number;
            inflated_price_of_original_price?: number;
            currency?: string;
        }>;

        model_sku?: string;

        pre_order?: {
            is_pre_order?: ShopeeBool;
            days_to_ship?: number;
        };

        stock_info_v2?: {
            summary_info?: {
                total_reserved_stock?: number;
                total_available_stock?: number;
            };
            seller_stock?: Array<{
                location_id?: string;
                stock?: number;
                if_saleable?: ShopeeBool; // confira o nome exato no retorno real
            }>;
            shopee_stock?: Array<{
                location_id?: string;
                stock?: number;
            }>;
            advance_stock?: {
                sellable_advance_stock?: number;
                in_transit_advance_stock?: number;
            };
        };

        gtin_code?: string;
        model_status?: string;

        weight?: number;
        dimension?: {
            package_length?: number;
            package_width?: number;
            package_height?: number;
        };

        is_fulfillment_by_shopee?: ShopeeBool;
    }>;

    standardise_tier_variation?: Array<{
        variation_id?: number;
        variation_name?: string;
        variation_option_list?: Array<{
            variation_option_id?: number;
            variation_option_name?: string;
            image_id?: string;
            image_url?: string;
        }>;
    }>;
}>;

export async function get_model_list(itemId: number): Promise<GetModelListResponse> {
    const url = InfoSellerConfig.host + "/api/v2/product/get_model_list";
    const response = await shopeeGet<GetModelListResponse>(url, {
        access_token: true,
        shop_id: true
    }, {
        item_id: itemId
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
// curl -G 'https://partner.shopeemobile.com/api/v2/product/get_model_list' \
//   --data-urlencode 'partner_id=SEU_PARTNER_ID' \
//   --data-urlencode 'timestamp=1704182400' \
//   --data-urlencode 'access_token=SEU_ACCESS_TOKEN' \
//   --data-urlencode 'shop_id=SEU_SHOP_ID' \
//   --data-urlencode 'sign=SIGN_AQUI' \
//   --data-urlencode 'item_id=123456789'
