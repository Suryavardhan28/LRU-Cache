export interface CacheItem {
    value: string;
    expiry: string;
}

export interface SetItemFormValues {
    key: string;
    value: string;
    expiry: string;
}

export interface GetOrDeleteItemFormValues {
    key: string;
}

export interface Message {
    data: string;
    type: MessageType;
}

export enum MessageType {
    NONE = "none",
    SUCCESS = "success",
    ERROR = "error",
}
