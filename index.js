import React from 'react'

const isProduction = process.env.NODE_ENV === 'production';

const changeDisplayName = (Item, ReactNested, parentNames) => (
  props,
  context
) => {
  let item = Item(props, context);
  // Clone the object, since the 'type' property is not configurable
  item = { ...item };
  const fn = item.type;
  const name = fn.name || 'Anonymous';
  // Clone original function (We need to lose reference since we are going to modify the 'name' property)
  item.type = fn.bind(fn);
  // Change display name of the instance
  Object.defineProperty(item.type, 'name', {
    value: name + '_hidden_',
  });
  // Change display name of ReactNested wrapper
  parentNames.push(name);
  Object.defineProperty(ReactNested, 'name', {
    value: `Nested: [${parentNames.join(', ')}]`,
  });
  return item;
};

const getterObject = {
  get getReactNested() {
    function ReactNestedCore(props) {
      const parentNames = [];
      const parents = [...props.parents].reverse();
      const Wrapper = parents.reduce((Acc, Item) => {
        if (!isProduction) {
          Item = changeDisplayName(Item, ReactNestedCore, parentNames);
          // Change the display name of anonymous instances
          Object.defineProperty(Item, 'name', {
            value: 'Wrapper_hidden_',
          });
        }
        return React.createElement(Item, null, Acc);
      }, props.children);
      return Wrapper;
    }
    return ReactNestedCore;
  },
};

const ReactNested = getterObject.getReactNested;

export default ReactNested