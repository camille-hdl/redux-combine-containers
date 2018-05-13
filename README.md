# redux-combine-containers 
[![Build Status](https://travis-ci.org/camille-hdl/redux-combine-containers.svg?branch=master)](https://travis-ci.org/camille-hdl/redux-combine-containers)  


## Why use this package

If :  
1. you have multiple standalone react-redux modules that have their own containers,
2. you want to create a "master" module that uses your submodules but has control on all the state tree,
3. you want your submodules isolated from each-other but controllable by the "master" module,
4. you still want to be able to build / use your submodules independently,

then this package can help you.


## Dependencies

This package has no actual dependency, although it was designed to work with [react-redux](https://github.com/reduxjs/react-redux) and [immutable](https://github.com/facebook/immutable-js).

`immutable` isn't mandatory, but your state should be of the type:  
```js
//@flow
type Map = {
    get: (key: any) => any,
    set: (key: any, value: any) => Map
};
```

## Usage

Let's say we have 2 react-redux containers, `document-viewer` and `document-list`. These module can be used standalone with their own state, actions and views.  
We want to create a new `document-index` container, using these two submodules, with a single state tree, without duplicating code.

First, we export our `mapStateToProps` and `mapDispatchToProps` from our subcontainers
```js
// src/document-viewer/containers/document-viewer.jsx
export const mapStateToProps = (state) => {
    return {
        documentId: state.get("documentId")
    };
};

export const mapDispatchToProps = (dispatch) => {
    return {
        toggleDescription: (toggle) => {
            //...
        }
    };
};

// src/document-list/containers/document-list.jsx
export const mapStateToProps = (state) => {
    return {
        documents: state.get("documents")
    };
};

export const mapDispatchToProps = (dispatch) => {
    return {
        previewDocument: (document) => {
            //...
        }
    };
};
```

In our new `document-index` module:  

we combine the reducers
```js
// src/document-index/reducers/reducer.js
// assuming you exported each root reducer as default
import DocumentViewerReducer from "../../src/document-viewer/reducers/reducer.js";
import DocumentListReducer from "../../src/document-list/reducers/reducer.js";
import { getCombinedReducer } from "reduc-combine-containers";

const GlobalReducer = (state) => {
    //...
};

const reducers = {
    global: GlobalReducer,
    documentViewer: DocumentViewerReducer,
    documentList: DocumentListReducer
};
export const App = getCombinedReducer(reducers);
```

we combine the containers  
```js
// src/document-index/containers/document-index.jsx

import { getCombinedStateToProps, getCombinedDispatchToProps } from "redux-combine-containers";
import * as documentViewer from "../../src/document-viewer/containers/document-viewer.jsx";
import * as documentList from "../../src/document-list/containers/document-list.jsx";

// the keys in the `mappers` and `reducers` objects have to be the same
const mappers = {
    documentViewer, documentList
};

const mapStateToProps = (state: Map) => {
    const stateProps = getCombinedStateToProps(
        mappers,
        state,
        {
            // global props defined at the root of the state tree.
            globalProp: state.get("globalProp")
        }
    );
    return stateProps;
};

const mapDispatchToProps = (dispatch, props) => {
    const dispatchProps = getCombinedDispatchToProps(
        mappers,
        dispatch,
        props,
        {
            // global methods.
            // you can import actions from the submodules to interact with them
            globalAction: () => {
                // ...
            }
        }
    );
    return dispatchProps;
};

/**
 * we need to define `mergeProps` as the default behavior won't work.
 * Here i'm using `merge` from lodash
 */
const mergeProps = (stateProps, dispatchProps, ownProps) => {
    return _.merge({}, ownProps, _.merge(stateProps, dispatchProps));
};

export const DocumentIndexContainer = connect(
    mapStateToProps,
    mapDispatchToProps,
    mergeProps
)(DocumentIndexComponent);
```

The final state tree will look like this  
```js
{
    globalProp: "value",
    globalAction: () => {},
    documentViewer: {
        documentId: 123,
        toggleDescription: (toggle) => {}
    },
    documenList: {
        documents: [],
        previewDocument: (document) => {}
    }
}
```



In `DocumentIndexComponent`'s render method, we include each sub-component with his own props  
```jsx
import DocumentViewerComponent from "../../src/document-viewer/components/document-viewer.jsx";
import DocumentListComponent from "../../src/document-list/components/document-list.jsx";

export default class DocumentIndexComponent extends PureComponent {
    render() {
        return (
            <>
                <DocumentListComponent { ...this.props.documentList } additionnalProp={"value"} />
                <DocumentViewerComponent { ...this.props.documentViewer } />
            </>
        );
    }
}
```

## Types
`redux-combine-containers` uses [flow](https://github.com/facebook/flow).

## Running tests
`npm install`  
`npm test`

## Building
with rollup installed globally  
`npm install`  
`npm run build`

## License 
MIT