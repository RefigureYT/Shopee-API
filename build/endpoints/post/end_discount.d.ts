import type { ShopeeEnvelope } from "../../services/requestApiShopee.service.js";
type ResponseSuccess = ShopeeEnvelope<{
    discount_id: number;
    modify_time: number;
}>;
type EndDiscountResponse = ResponseSuccess | ShopeeEnvelope<{}>;
export declare function end_discount(discount_id: number): Promise<EndDiscountResponse>;
export {};
//# sourceMappingURL=end_discount.d.ts.map