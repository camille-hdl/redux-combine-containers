import _Object$assign from '@babel/runtime/core-js/object/assign';
import _Object$entries from '@babel/runtime/core-js/object/entries';

/**
 * Helpers to combine multiple redux containers props object (mapStateToProps/mapDispatchToProps pairs)
 * into a single props object.
 * Each individual container is identified by a key in the final object.
 */

/**
 * mapStateToProps / mapDispatch to props pair.
 */

/**
 * Simple definition of immutable.Map
 */

/**
 * Naive object reduce implementation to avoid dependencies
 */
const reduceMappers = (mappers, fn, initialValue) => {
  return _Object$entries(mappers).reduce((acc, pair) => {
    return fn.call(null, acc, pair[1], pair[0]);
  }, initialValue);
};
/**
 * This is essentially `combineReducers`: each sub-reducer gets his sub-state tree only.
 * 
 * Example: "document" reducer : `state.set("document", reducers.document(state.get("document"), action));`
 * 
 * If a reducer has a `global` key, this reducer will have access to the complete state tree.
 */


const getCombinedReducer = reducers => {
  return (state, action) => {
    return reduceMappers(reducers, (curState, reducer, key) => {
      if (key === "global") {
        return reducer(curState, action);
      }

      return curState.set(key, reducer(curState.get(key), action));
    }, state);
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

const getCombinedStateToProps = (mappers, state, globalProps) => {
  return reduceMappers(mappers, (props, mapper, key) => {
    props[key] = props[key] ? props[key] : {};
    props[key] = _Object$assign(props[key], mapper.mapStateToProps(state.get(key)));
    return props;
  }, globalProps);
};
const getCombinedDispatchToProps = (mappers, dispatch, props, defaultActions) => {
  return reduceMappers(mappers, (props, mapper, key) => {
    props[key] = props[key] ? props[key] : {};
    props[key] = _Object$assign(props[key], mapper.mapDispatchToProps(dispatch));
    return props;
  }, defaultActions);
};

export { getCombinedReducer, getCombinedStateToProps, getCombinedDispatchToProps };
