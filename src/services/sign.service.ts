import crypto from "node:crypto";

type SignPartnerArgs = {
    partnerId: number;
    partnerKey: string;
    path: string;
    timestamp: number;
    accessToken?: string;
    shopId?: number;
}

export function signPartner(
    {
        partnerId,
        partnerKey,
        path,
        timestamp,
        accessToken,
        shopId
    }: SignPartnerArgs): string {
    const baseString =
        `${partnerId}${path}${timestamp}` +
        (accessToken ?? "") +
        (shopId !== undefined ? String(shopId) : "");

    return crypto.createHmac("sha256", partnerKey.trim()).update(baseString, "utf8").digest("hex");
}