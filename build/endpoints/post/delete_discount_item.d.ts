import type { ShopeeEnvelope } from "../../services/requestApiShopee.service.js";
type DeleteDiscountItemBody = {
    discount_id: number;
    item_id: number;
    model_id: number;
};
type DeleteDiscountItemResponseSuccess = ShopeeEnvelope<{
    discount_id: number;
    error_list: string[]; /** Geralmente vem vazio quando sucesso em geral, mas alguns podem falhar */
}>;
type DeleteDiscountItemResponse = DeleteDiscountItemResponseSuccess | ShopeeEnvelope<{}>;
export declare function delete_discount_item(body: DeleteDiscountItemBody): Promise<DeleteDiscountItemResponse>;
export {};
//# sourceMappingURL=delete_discount_item.d.ts.map