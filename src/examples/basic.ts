//TODO [ESCREVA SEU CÓDIGO AQUI]
//TODO [UTILIZE IMPORT PARA IMPORTAR AS FUNÇÕES PRONTAS]

//? [GET IMPORTS]
import { Pool } from "pg";
import { get_discount_list } from "./API/GET/get_discount_list.js";
import { get_item_base_info } from "./API/GET/get_item_base_info.js";
import { get_item_list } from "./API/GET/get_item_list.js";
import { get_model_list } from "./API/GET/get_model_list.js";

//? [POST IMPORTS]
import { add_discount } from "./API/POST/add_discount.js";
import { add_discount_item } from "./API/POST/add_discount_item.js";
import { delete_discount } from "./API/POST/delete_discount.js";
import { delete_discount_item } from "./API/POST/delete_discount_item.js";
import { end_discount } from "./API/POST/end_discount.js";
import { update_price } from "./API/POST/update_price.js";

//? [CONFIG IMPORTS]
import { InfoSellerConfig } from "./config.js";
import { _db } from "./services/database.service.js";

//! FUNÇÕES DISPONÍVEIS:
//? [GET]
//* get_item_base_info
//* get_item_list
//* get_model_list
//* get_discount_list

//? [POST]
//* add_discount_item
//* add_discount
//* update_price
//* delete_discount_item
//* delete_discount
//* end_discount

//? CONTABILIZADOR TEMPO DE EXECUÇÃO
//* DESCOMENTE SE QUISER USAR
const start = Date.now();

//? Função auto executável com encerrador de sessão do pool (Database)
(async () => {
    try {
        console.log(InfoSellerConfig);
    } finally {
        await _db.end();
    }
})()

//? CONTABILIZADOR TEMPO DE EXECUÇÃO
//* DESCOMENTE SE QUISER USAR
.finally(() => {
    const ms = Date.now() - start;
    if (ms / 1000 > 5) { console.log(`⏱️ Total: ${(ms / 1000).toFixed(2)}s`); }
    else { console.log(`⏱️ Total: ${(ms / 1000).toFixed(5)}s`); }
});