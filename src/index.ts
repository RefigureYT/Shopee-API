import { get_item_base_info } from "./API/GET/get_item_base_info.js";
import { get_item_list } from "./API/GET/get_item_list.js";

const listItens = await get_item_list(0, 50, 'NORMAL');

console.log('Itens:', listItens.response.item.length);

const itemIdList = listItens.response.item.map(item => item.item_id);
console.log(itemIdList);

const baseInfos = await get_item_base_info(itemIdList);
console.log(baseInfos);