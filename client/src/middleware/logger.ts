const loggerMiddleware = (store: any) => (next: any) => (action: any) => {
    console.group(action.type);
    console.log("Current State:", store.getState());
    console.log("Action:", action);
    const result = next(action);
    console.log("Next State:", store.getState());
    console.groupEnd();
    return result;
};

export default loggerMiddleware;
