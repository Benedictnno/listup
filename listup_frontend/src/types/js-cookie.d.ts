declare module 'js-cookie' {
    interface CookieAttributes {
        expires?: number | Date | undefined;
        path?: string | undefined;
        domain?: string | undefined;
        secure?: boolean | undefined;
        sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None' | undefined;
        [property: string]: any;
    }

    interface CookiesStatic<T extends object = object> {
        get(name: string): string | undefined;
        get(): { [key: string]: string };
        set(name: string, value: string | T, attributes?: CookieAttributes): string | undefined;
        remove(name: string, attributes?: CookieAttributes): void;
        withAttributes(attributes: CookieAttributes): CookiesStatic<T>;
        withConverter<TConv extends object>(
            converter: {
                read?: ((value: string, name: string) => string) | undefined;
                write?: ((value: string, name: string) => string) | undefined;
            }
        ): CookiesStatic<TConv>;
    }

    const Cookies: CookiesStatic;
    export default Cookies;
}
