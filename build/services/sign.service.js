import crypto from "node:crypto";
/**
 * Gera o `sign` (assinatura) exigido pela Shopee Partner API.
 *
 * A assinatura é calculada como:
 * - baseString = `${partnerId}${path}${timestamp}` + accessToken? + shopId?
 * - sign = HMAC_SHA256(baseString, partnerKey)
 *
 * @param args Dados necessários para montar a string base e assinar.
 * @returns Assinatura em hexadecimal (string).
 *
 * @example
 * const sign = signPartner({
 *   partnerId: 123,
 *   partnerKey: "abc",
 *   path: "/api/v2/product/get_item_list",
 *   timestamp: 1700000000,
 *   accessToken: "token",
 *   shopId: 999
 * });
 */
export function signPartner({ partnerId, partnerKey, path, timestamp, accessToken, shopId }) {
    const baseString = `${partnerId}${path}${timestamp}` +
        (accessToken ?? "") +
        (shopId !== undefined ? String(shopId) : "");
    return crypto.createHmac("sha256", partnerKey.trim()).update(baseString, "utf8").digest("hex");
}
