import type { ShopeeEnvelope } from "../../services/requestApiShopee.service.js";
type DeleteDiscountItemResponseSuccess = ShopeeEnvelope<{
    discount_id: number;
    modify_time: number;
}>;
type DeleteDiscountItemResponse = DeleteDiscountItemResponseSuccess | ShopeeEnvelope<{}>;
export declare function delete_discount(discount_id: number): Promise<DeleteDiscountItemResponse>;
export {};
//# sourceMappingURL=delete_discount.d.ts.map