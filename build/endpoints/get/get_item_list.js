import { assertShopeeOk, shopeeGet } from "../../services/requestApiShopee.service.js";
import { InfoSellerConfig } from "../../config.js";
/**
 * Lista anúncios (itens) da loja de forma paginada.
 *
 * Normalmente é o “primeiro passo” pra:
 * 1) pegar os `item_id` da loja
 * 2) consultar detalhes com `get_item_base_info(item_id_list)`
 * 3) consultar variações com `get_model_list(item_id)` quando necessário
 *
 * @param offset Posição/página atual. Use `next_offset` retornado pela Shopee.
 * @param pageSize Tamanho da página (quantos itens por chamada).
 * @param itemStatus Filtro por status do anúncio (ex.: "NORMAL").
 * @returns Envelope padrão da Shopee com paginação e lista de `item_id`.
 * @throws {Error} Se ocorrer erro HTTP (Axios) ou erro “de negócio” (error/message preenchidos).
 *
 * @example
 * const page1 = await get_item_list(0, 50, "NORMAL");
 * const ids = page1.response.item.map(i => i.item_id);
 */
export async function get_item_list(offset = 0, pageSize = 50, itemStatus = 'NORMAL') {
    const url = InfoSellerConfig.host + "/api/v2/product/get_item_list";
    const res = await shopeeGet(url, { access_token: true, shop_id: true }, { offset, page_size: pageSize, item_status: itemStatus });
    //? Valida response
    return assertShopeeOk(res);
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
