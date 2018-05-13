//@flow
/**
 * Helpers to combine multiple redux containers props object (mapStateToProps/mapDispatchToProps pairs)
 * into a single props object.
 * Each individual container is identified by a key in the final object.
 */

 /**
  * mapStateToProps / mapDispatch to props pair.
  */
export type CombinedMapper = {
    mapStateToProps: (state: Map) => any,
    mapDispatchToProps: (dispatch: any, props: any) => any
};

/**
 * Simple definition of immutable.Map
 */
type Map = {
    get: (key: any) => any,
    set: (key: any, value: any) => Map
};

type ReduxAction = {
    type: string,
    data?: any
};

/**
 * Naive object reduce implementation to avoid dependencies
 */
const reduceMappers = (mappers: {[key: string]: any}, fn: (accumulator: any, value: any) => any, initialValue: any) => {
    return Object.entries(mappers).reduce(
        (acc, pair: Array<any>) => {
            return fn.call(null, acc, pair[1], pair[0]);
        },
        initialValue
    );
};

/**
 * This is essentially `combineReducers`: each sub-reducer gets his sub-state tree only.
 * 
 * Example: "document" reducer : `state.set("document", reducers.document(state.get("document"), action));`
 * 
 * If a reducer has a `global` key, this reducer will have access to the complete state tree.
 */
export const getCombinedReducer = (reducers: {[key: string]: (state: Map) => Map}) => {
    return (state: Map, action: ReduxAction): Map => {
        return reduceMappers(
            reducers,
            (curState: Map, reducer: (state: Map) => Map, key: string) => {
                if (key === "global") {
                    return reducer(curState, action);
                }
                return curState.set(key, reducer(curState.get(key), action));
            },
            state
        );
    };
};


/**
 * The returned object (the final state tree) is a combination of `globalProps` with each sub-state trees.
 * 
 * Each submodule has it's key in the state tree.  
 * `finalProps.document = mappers.document.mapStateToProps(state)`
 * 
 * `globalProps` are at the root of the state tree.
 */
export const getCombinedStateToProps = (mappers: {[key: string]: CombinedMapper}, state: Map, globalProps: any) => {
    return reduceMappers(
        mappers,
        (props: any, mapper: any, key: string) => {
            props[ key ] = props[ key ] ? props[ key ] : {};
            props[ key ] = Object.assign(props[ key ], mapper.mapStateToProps(state.get(key)));
            return props;
        },
        globalProps
    );
};
export const getCombinedDispatchToProps = (mappers: {[key: string]: CombinedMapper}, dispatch: () => void, props: any, defaultActions: any) => {
    return reduceMappers(
        mappers,
        (props: any, mapper: any, key: string) => {
            props[ key ] = props[ key ] ? props[ key ] : {};
            props[ key ] = Object.assign(props[ key ], mapper.mapDispatchToProps(dispatch));
            return props;
        },
        defaultActions
    );
};