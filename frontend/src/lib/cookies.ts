import Cookies from "js-cookie";

export function setCookie(key: string, value: string, days: number = 7) {
    Cookies.set(key, value, {
        expires: days,
        secure: true,
        sameSite: "strict",
    });
}

export function getCookie(key: string): string | undefined {
    return Cookies.get(key);
}

export function removeCookie(key: string) {
    Cookies.remove(key);
}

export function hasCookie(key: string): boolean {
    return !!Cookies.get(key);
}
