import { InfoSellerConfig } from "../../config.js";
import { assertShopeeOk, shopeeGet } from "../../services/requestApiShopee.service.js";
export async function get_discount_list(parameters = {}) {
    let { page_no = 1, page_size = 100, discount_status = "all" } = parameters;
    if (page_size > 100)
        page_size = 100;
    if (page_no < 1)
        page_no = 1;
    const parametersReady = {
        discount_status,
        page_no,
        page_size
    };
    if (parameters.update_time_from)
        parametersReady.update_time_from = parameters.update_time_from;
    if (parameters.update_time_to)
        parametersReady.update_time_to = parameters.update_time_to;
    const url = InfoSellerConfig.host + "/api/v2/discount/get_discount_list";
    const res = await shopeeGet(url, { access_token: true, shop_id: true }, parametersReady);
    //? Valida response
    return assertShopeeOk(res);
}
