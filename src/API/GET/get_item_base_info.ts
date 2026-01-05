import { InfoSellerConfig } from "../../config.js"
import { assertShopeeOk, ShopeeEnvelope, shopeeGet } from "../../services/requestApiShopee.service.js";
import { GetItemListItemStatus } from "./get_item_list.js";

/**
 * Resposta do endpoint `get_item_base_info`.
 *
 * Retorna informações “base” de múltiplos anúncios de uma vez, a partir de uma lista de `item_id`.
 * Observação: vários campos podem vir ausentes dependendo do item, categoria ou permissões,
 * por isso a maioria está como opcional (`?`).
 */
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

        /** Indica se possui variações (às vezes boolean puro ou 0/1). */
        has_model?: boolean | 0 | 1;

        /** Timestamps Unix (segundos). */
        update_time?: number;
        create_time?: number;

        tag?: {
            kit?: boolean;
        };
    }>;
}>

/**
 * Busca as informações base de vários anúncios (itens) de uma vez.
 *
 * Útil pra “enriquecer” os `item_id` obtidos no `get_item_list`,
 * trazendo nome, SKU, dimensões, imagens, etc.
 *
 * @param itemIdList Lista de IDs de anúncios (`item_id`) para consultar.
 * @returns Envelope padrão da Shopee contendo `item_list`.
 * @throws {Error} Se ocorrer erro HTTP (Axios) ou erro “de negócio” (error/message preenchidos).
 *
 * @example
 * const list = await get_item_list(0, 50, "NORMAL");
 * const ids = list.response.item.map(i => i.item_id);
 * const base = await get_item_base_info(ids);
 * console.log(base.response.item_list[0]?.item_sku);
 */
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
