import {bindingMode} from '../src/binding-mode';
import {
  createElement,
  fireEvent,
  checkDelay,
  createObserverLocator,
  getBinding
} from './shared';
import {initialize} from 'aurelia-pal-browser';
import {createScopeForTest} from '../src/scope';

describe('SelectValueObserver', () => {
  var observerLocator;

  beforeAll(() => {
    initialize();
    observerLocator = createObserverLocator();
  });

  function getElementValue(element) {
    var options = element.options, option, i, ii, count = 0, value = [];

    for(i = 0, ii = options.length; i < ii; i++) {
      option = options.item(i);
      if (!option.selected) {
        continue;
      }
      value[count] = option.hasOwnProperty('model') ? option.model : option.value;
      count++;
    }

    if (!element.multiple) {
      if (count === 0) {
        value = null;
      } else {
        value = value[0];
      }
    }
    return value;
  }

  describe('single-select strings', () => {
    var obj, el, binding;

    beforeAll(() => {
      obj = { selectedItem: 'B' };
      el = createElement(
        `<select>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>`);
      document.body.appendChild(el);
      binding = getBinding(observerLocator, obj, 'selectedItem', el, 'value', bindingMode.twoWay).binding;
    });

    it('binds', () => {
      var targetProperty = binding.targetProperty;
      spyOn(targetProperty, 'bind').and.callThrough();
      binding.bind(createScopeForTest(obj));
      expect(targetProperty.bind).toHaveBeenCalled();
      expect(el.value).toBe(obj.selectedItem);
    });

    it('responds to model change', done => {
      obj.selectedItem = 'C';
      setTimeout(() => {
        expect(el.value).toBe(obj.selectedItem);
        done();
      }, 0);
    });

    it('responds to element change', done => {
      el.value = 'A';
      fireEvent(el, 'change');
      setTimeout(() => {
        expect(el.value).toBe(obj.selectedItem);
        done();
      }, 0);
    });

    it('responds to options change', done => {
      var option = document.createElement('option');
      option.value = option.text = 'D';
      obj.selectedItem = 'D';
      el.appendChild(option);
      setTimeout(() => {
        expect(el.value).toBe(obj.selectedItem);
        el.innerHTML =
          `<option value="X">X</option>
          <option value="Y">Y</option>
          <option value="Z">Z</option>`;
        setTimeout(() => {
          expect(el.value).toBe('X');
          expect(el.value).toBe(obj.selectedItem);
          done();
        });
      }, 0);
    });

    it('unbinds', () => {
      var targetProperty = binding.targetProperty;
      spyOn(targetProperty, 'unbind').and.callThrough();
      binding.unbind();
      expect(targetProperty.unbind).toHaveBeenCalled();
    });

    afterAll(() => {
      document.body.removeChild(el);
    });
  });

  describe('multi-select strings', () => {
    var obj, el, binding, elementValueProperty;
    beforeAll(() => {
      var info;
      obj = { selectedItems: ['B', 'C'] };
      el = createElement(
        `<select multiple>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>`);
      document.body.appendChild(el);
      info = getBinding(observerLocator, obj, 'selectedItems', el, 'value', bindingMode.twoWay);
      binding = info.binding;
      elementValueProperty = info.targetProperty;
    });

    it('binds', () => {
      var targetProperty = binding.targetProperty;
      spyOn(targetProperty, 'bind').and.callThrough();
      binding.bind(createScopeForTest(obj));
      expect(targetProperty.bind).toHaveBeenCalled();
      expect(elementValueProperty.getValue()).toBe(obj.selectedItems);
      expect(getElementValue(el)).toEqual(obj.selectedItems.slice(0));
    });

    it('responds to model change', done => {
      obj.selectedItems = ['A'];
      setTimeout(() => {
        expect(elementValueProperty.getValue()).toBe(obj.selectedItems);
        expect(getElementValue(el)).toEqual(obj.selectedItems.slice(0));
        done();
      }, 0);
    });

    it('responds to model mutate', done => {
      obj.selectedItems.pop();
      setTimeout(() => {
        expect(elementValueProperty.getValue()).toBe(obj.selectedItems);
        expect(getElementValue(el)).toEqual(obj.selectedItems.slice(0));
        obj.selectedItems.push('B');
        setTimeout(() => {
          expect(elementValueProperty.getValue()).toBe(obj.selectedItems);
          expect(getElementValue(el)).toEqual(obj.selectedItems.slice(0));
          done();
        }, 0);
      }, 0);
    });

    it('responds to element change', done => {
      el.options.item(1).selected = true;
      el.options.item(2).selected = true;
      fireEvent(el, 'change');
      setTimeout(() => {
        expect(elementValueProperty.getValue()).toBe(obj.selectedItems);
        expect(getElementValue(el)).toEqual(obj.selectedItems.slice(0));
        done();
      }, 0);
    });

    it('responds to options change', done => {
      var option = document.createElement('option');
      option.value = option.text = 'D';
      obj.selectedItems = ['D'];
      el.appendChild(option);
      setTimeout(() => {
        expect(elementValueProperty.getValue()).toBe(obj.selectedItems);
        expect(getElementValue(el)).toEqual(obj.selectedItems.slice(0));
        done();
      }, 0);
    });

    it('unbinds', () => {
      var targetProperty = binding.targetProperty;
      spyOn(targetProperty, 'unbind').and.callThrough();
      binding.unbind();
      expect(targetProperty.unbind).toHaveBeenCalled();
    });

    afterAll(() => {
      document.body.removeChild(el);
    });
  });

  describe('single-select objects', () => {
    var obj, el, binding, elementValueProperty;
    beforeAll(() => {
      var option, info;
      el = createElement('<select></select>');
      option = document.createElement('option');
      option.text = 'A';
      option.model = { foo: 'A' };
      el.appendChild(option);
      option = document.createElement('option');
      option.text = 'B';
      option.model = { foo: 'B' };
      el.appendChild(option);
      option = document.createElement('option');
      option.text = 'C';
      option.model = { foo: 'C' };
      el.appendChild(option);
      document.body.appendChild(el);
      obj = { selectedItem: el.options.item(2).model };

      info = getBinding(observerLocator, obj, 'selectedItem', el, 'value', bindingMode.twoWay);
      binding = info.binding;
      elementValueProperty = info.targetProperty;
    });

    it('binds', () => {
      var targetProperty = binding.targetProperty;
      spyOn(targetProperty, 'bind').and.callThrough();
      binding.bind(createScopeForTest(obj));
      expect(targetProperty.bind).toHaveBeenCalled();
      expect(elementValueProperty.getValue()).toBe(obj.selectedItem);
      expect(getElementValue(el)).toEqual(obj.selectedItem);
    });

    it('responds to model change', done => {
      obj.selectedItem = el.options.item(0).model;
      setTimeout(() => {
        expect(elementValueProperty.getValue()).toBe(obj.selectedItem);
        expect(getElementValue(el)).toEqual(obj.selectedItem);
        done();
      }, 0);
    });

    it('responds to element change', done => {
      el.options.item(0).selected = false;
      el.options.item(1).selected = true;
      fireEvent(el, 'change');
      setTimeout(() => {
        expect(elementValueProperty.getValue()).toBe(obj.selectedItem);
        expect(getElementValue(el)).toEqual(obj.selectedItem);
        done();
      }, 0);
    });

    it('responds to options change', done => {
      var option = document.createElement('option');
      option.text = 'D';
      option.model = { foo: 'D' };
      obj.selectedItem = option.model;
      el.appendChild(option);
      setTimeout(() => {
        expect(elementValueProperty.getValue()).toBe(obj.selectedItem);
        expect(getElementValue(el)).toEqual(obj.selectedItem);
        done();
      }, 0);
    });

    it('unbinds', () => {
      var targetProperty = binding.targetProperty;
      spyOn(targetProperty, 'unbind').and.callThrough();
      binding.unbind();
      expect(targetProperty.unbind).toHaveBeenCalled();
    });

    afterAll(() => {
      document.body.removeChild(el);
    });
  });

  describe('multi-select objects', () => {
    var obj, el, binding, elementValueProperty;
    beforeAll(() => {
      var option, info;
      el = createElement('<select multiple></select>');
      option = document.createElement('option');
      option.text = 'A';
      option.model = { foo: 'A' };
      el.appendChild(option);
      option = document.createElement('option');
      option.text = 'B';
      option.model = { foo: 'B' };
      el.appendChild(option);
      option = document.createElement('option');
      option.text = 'C';
      option.model = { foo: 'C' };
      el.appendChild(option);
      document.body.appendChild(el);
      obj = { selectedItems: [el.options.item(1).model, el.options.item(2).model] };

      info = getBinding(observerLocator, obj, 'selectedItems', el, 'value', bindingMode.twoWay);
      binding = info.binding;
      elementValueProperty = info.targetProperty;
    });

    it('binds', () => {
      var targetProperty = binding.targetProperty;
      spyOn(targetProperty, 'bind').and.callThrough();
      binding.bind(createScopeForTest(obj));
      expect(targetProperty.bind).toHaveBeenCalled();
      expect(elementValueProperty.getValue()).toBe(obj.selectedItems);
      expect(getElementValue(el)).toEqual(obj.selectedItems.slice(0));
    });

    it('responds to model change', done => {
      obj.selectedItems = [el.options.item(0).model];
      setTimeout(() => {
        expect(elementValueProperty.getValue()).toBe(obj.selectedItems);
        expect(getElementValue(el)).toEqual(obj.selectedItems.slice(0));
        done();
      }, 0);
    });

    it('responds to model mutate', done => {
      while(obj.selectedItems.length) {
        obj.selectedItems.pop();
      }
      setTimeout(() => {
        expect(elementValueProperty.getValue()).toBe(obj.selectedItems);
        obj.selectedItems.push(el.options.item(1).model);
        setTimeout(() => {
          expect(elementValueProperty.getValue()).toBe(obj.selectedItems);
          expect(getElementValue(el)).toEqual(obj.selectedItems.slice(0));
          done();
        }, 0);
      }, 0);
    });

    it('responds to element change', done => {
      el.options.item(0).selected = true;
      el.options.item(1).selected = false;
      el.options.item(2).selected = true;
      fireEvent(el, 'change');
      setTimeout(() => {
        expect(elementValueProperty.getValue()).toBe(obj.selectedItems);
        expect(getElementValue(el)).toEqual(obj.selectedItems.slice(0));
        done();
      }, 0);
    });

    it('responds to options change', done => {
      var option = document.createElement('option');
      option.text = 'D';
      option.model = { foo: 'D' };
      obj.selectedItems = [option.model];
      el.appendChild(option);
      setTimeout(() => {
        expect(elementValueProperty.getValue()).toBe(obj.selectedItems);
        expect(getElementValue(el)).toEqual(obj.selectedItems.slice(0));
        done();
      }, 0);
    });

    it('unbinds', () => {
      var targetProperty = binding.targetProperty;
      spyOn(targetProperty, 'unbind').and.callThrough();
      binding.unbind();
      expect(targetProperty.unbind).toHaveBeenCalled();
    });

    afterAll(() => {
      document.body.removeChild(el);
    });
  });

  describe('option value bound after select value bound', () => {
    var obj, el, binding, binding2;

    beforeAll(() => {
      obj = { selectedItem: 'B', optionB: 'B' };
      el = createElement(
        `<select>
          <option value="A">Option A</option>
          <option          >Option B</option>
          <option value="C">Option C</option>
        </select>`);
      document.body.appendChild(el);
      binding = getBinding(observerLocator, obj, 'selectedItem', el, 'value', bindingMode.twoWay).binding;
      binding2 = getBinding(observerLocator, obj, 'optionB', el.options.item(1), 'value', bindingMode.oneWay).binding;
    });

    it('binds', done => {
      var targetProperty = binding.targetProperty;
      // select-value bind.
      binding.bind(createScopeForTest(obj));
      expect(el.options.item(1).selected).toBe(false);
      // now bind the option value.
      binding2.bind(createScopeForTest(obj));
      setTimeout(() => {
        expect(el.options.item(1).selected).toBe(true);
        done();
      }, 100);
    });

    afterAll(() => {
      document.body.removeChild(el);
    });
  });
});
