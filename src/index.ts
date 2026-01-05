import { get_item_base_info } from "./API/GET/get_item_base_info.js";
import { get_item_list } from "./API/GET/get_item_list.js";
import { get_model_list } from "./API/GET/get_model_list.js";

// const listItens = await get_item_list(0, 50, 'NORMAL');

// console.log('Itens:', listItens.response.item.length);

// const itemIdList = listItens.response.item.map(item => item.item_id);
// console.log(itemIdList);

// const baseInfos = await get_item_base_info(itemIdList);
// console.log(baseInfos);
// console.log(baseInfos.response.item_list[0]);

const models = await get_model_list(53553342037);
console.log('tier_variation:', models.response.tier_variation?.[0]);
console.log('image:', models.response.tier_variation?.[0].option_list?.[0].image);

// console.log(models.response.model_list[0]);


// [
//     53553342037, 43927332845, 53853245148, 55403224955,
//     23697299497, 53802896736, 52102892472, 23993620146,
//     23693675303, 22993473363, 22898183788, 22593561721,
//     29640217267, 24992269667, 22198198617, 22093702125,
//     44001710207, 23993468277, 23393675274, 22993478411,
//     22393562359, 20298021160, 19599599803, 27441414796,
//     26888475014, 22993682980, 22193577088, 22193577042,
//     22098195288, 18598000312, 43457169636, 42401031199,
//     41551047287, 28541118982, 27389389059, 22993478366,
//     41550365204, 23698171805, 23693675338, 23593675242,
//     22098151625, 20397921423, 42351020178, 40167509147,
//     28379924373, 23296705709, 22193654858, 19799569637,
//     19199599761, 19097988985
// ]