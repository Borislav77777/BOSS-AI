/**
 * Типы для системы авторизации через Telegram
 *
 * @module types/auth
 */
/**
 * Состояние авторизации
 */
export var AuthStatus;
(function (AuthStatus) {
    /** Не авторизован */
    AuthStatus["UNAUTHORIZED"] = "unauthorized";
    /** В процессе авторизации */
    AuthStatus["LOADING"] = "loading";
    /** Авторизован, но не принял соглашение */
    AuthStatus["NEEDS_AGREEMENT"] = "needs_agreement";
    /** Полностью авторизован */
    AuthStatus["AUTHORIZED"] = "authorized";
    /** Ошибка авторизации */
    AuthStatus["ERROR"] = "error";
})(AuthStatus || (AuthStatus = {}));
//# sourceMappingURL=auth.js.map