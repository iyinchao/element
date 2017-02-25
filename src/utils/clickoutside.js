import Vue from 'vue';
import { on } from 'element-ui/src/utils/dom';
const nodeList = [];
const ctx = '@@clickoutsideContext';

/**
 * 使用use capture来先期获取click事件，避免某些子元素或document的其他
 * listener阻止事件传播使得该directive失效
 */
!Vue.prototype.$isServer && on(document, 'click', e => {
  nodeList.forEach(node => node[ctx].documentHandler(e));
}, true);

/**
 * v-clickoutside
 * @desc 点击元素外面才会触发的事件
 * @example
 * ```vue
 * <div v-element-clickoutside="handleClose">
 * ```
 */
export default {
  bind(el, binding, vnode) {
    const id = nodeList.push(el) - 1;
    const documentHandler = function(e) {
      if (!vnode.context ||
        el.contains(e.target) ||
        (vnode.context.popperElm &&
        vnode.context.popperElm.contains(e.target))) return;

      if (binding.expression &&
        el[ctx].methodName &&
        vnode.context[el[ctx].methodName]) {
        vnode.context[el[ctx].methodName]();
      } else {
        el[ctx].bindingFn && el[ctx].bindingFn();
      }
    };
    el[ctx] = {
      id,
      documentHandler,
      methodName: binding.expression,
      bindingFn: binding.value
    };
  },

  update(el, binding) {
    el[ctx].methodName = binding.expression;
    el[ctx].bindingFn = binding.value;
  },

  unbind(el) {
    let len = nodeList.length;

    for (let i = 0; i < len; i++) {
      if (nodeList[i][ctx].id === el[ctx].id) {
        nodeList.splice(i, 1);
        break;
      }
    }
  }
};
