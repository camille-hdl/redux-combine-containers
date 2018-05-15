//@flow

import { fromJS } from "immutable";
import { getCombinedReducer, getCombinedDispatchToProps, getCombinedStateToProps } from "../index.js";

test("getCombinedReducer", () => {
    const reducers = {
        firstSubState: state => {
            return state + 1;
        },
        secondSubState: state => {
            return state + 2;
        }
    };
    const combinedReducer = getCombinedReducer(reducers);
    const initialState = {
        firstSubState: 0,
        secondSubState: 0
    };
    const expected = {
        firstSubState: 1,
        secondSubState: 2
    };
    expect(combinedReducer(fromJS(initialState)).toJS()).toEqual(expected);
});

test("getCombinedStateToProps", () => {
    const mappers = {
        firstSubState: {
            mapStateToProps: (state) => {
                return {
                    firstProp1: state.get("firstProp")
                };
            }
        },
        secondSubState: {
            mapStateToProps: (state) => {
                return {
                    secondProp1: state.get("secondProp")
                };
            }
        }
    };
    const globalProps = {
        globalProp1: true
    };

    const state = {
        firstSubState: {
            firstProp: 1
        },
        secondSubState: {
            secondProp: "aze"
        }
    };

    const expected = {
        firstSubState: {
            firstProp1: 1
        },
        secondSubState: {
            secondProp1: "aze"
        },
        globalProp1: true
    };
    expect(getCombinedStateToProps(mappers, fromJS(state), globalProps)).toEqual(expected);
});


test("getCombinedDispatchToProps", () => {
    const mappers = {
        firstSubState: {
            mapDispatchToProps: (dispatch, props) => {
                return {
                    firstMethod1: () => {}
                };
            }
        },
        secondSubState: {
            mapDispatchToProps: (dispatch, props) => {
                return {
                    secondMethod1: () => dispatch
                };
            }
        }
    };
    const defaultActions = {
        globalMethod: () => {}
    };

    const props = {
        firstSubState: {
            firstProp: 1
        },
        secondSubState: {
            secondProp: "aze"
        }
    };

    // on utilise la chaine "dispatch function" pour s'assurer que la fonction est bien passee aux methodes
    // des sous-modules
    const combinedDispatchProps = getCombinedDispatchToProps(mappers, "dispatch function", props, defaultActions);
    expect(typeof combinedDispatchProps.globalMethod).toBe("function");
    expect(typeof combinedDispatchProps.firstSubState.firstMethod1).toBe("function");
    expect(typeof combinedDispatchProps.secondSubState.secondMethod1).toBe("function");
    expect(combinedDispatchProps.secondSubState.secondMethod1()).toEqual("dispatch function");
});