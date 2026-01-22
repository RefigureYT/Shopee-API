//TODO [ESCREVA SEU CÓDIGO AQUI]
//TODO [UTILIZE IMPORT PARA IMPORTAR AS FUNÇÕES PRONTAS]
//? [GET IMPORTS]
// import { Pool } from "pg";
// import { get_discount_list } from "shopee-api";
// import { get_item_base_info } from "shopee-api";
// import { get_item_list } from "shopee-api";
// import { get_model_list } from "shopee-api";
//? [POST IMPORTS]
// import { add_discount } from "shopee-api";
// import { add_discount_item } from "shopee-api";
// import { delete_discount } from "shopee-api";
// import { delete_discount_item } from "shopee-api";
// import { end_discount } from "shopee-api";
// import { update_price } from "shopee-api";
//? [CONFIG IMPORTS]
import { InfoSellerConfig } from "../config.js";
import { _db } from "../services/database.service.js";
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
    }
    finally {
        await _db.end();
    }
})()
    //? CONTABILIZADOR TEMPO DE EXECUÇÃO
    //* DESCOMENTE SE QUISER USAR
    .finally(() => {
    const ms = Date.now() - start;
    if (ms / 1000 > 5) {
        console.log(`⏱️ Total: ${(ms / 1000).toFixed(2)}s`);
    }
    else {
        console.log(`⏱️ Total: ${(ms / 1000).toFixed(5)}s`);
    }
});
