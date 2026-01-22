import { InfoSellerConfig } from "../../config.js";
import { assertShopeeOk, shopeeGet } from "../../services/requestApiShopee.service.js";
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
export async function get_item_base_info(itemIdList) {
    const url = InfoSellerConfig.host + "/api/v2/product/get_item_base_info";
    const res = await shopeeGet(url, { access_token: true, shop_id: true }, { item_id_list: itemIdList });
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
