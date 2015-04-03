var PolymerLifecycleMethods = [
  'created',
  'ready',
  'attached',
  'detached',
  'registered'
];

var PolymerObjectProperties = [
  'properties',
  'listeners',
  'observers',
  'hostAttributes',
  'computed'
];


function Dictionary(array) {
  return array.reduce(function(dictionary, item) {
    dictionary[item] = true;
  }, {});
}


function Extend2D(parentPrototype, extendedPrototype, nestedExtendingObjectNames) {
  var childPrototype = parentPrototype ? Object.create(parentPrototype) : {};
  
  if (nestedExtendingObjectNames) {
    nestedExtendingObjectNames.forEach(function(property) {
      childPrototype[property] = Inherit2D(
        parentPrototype[property],
        extendedPrototype[property]
      );
    });
  }
  
  Object.getOwnPropertyNames(extendedPrototype || {}).forEach(function(property) {
    if (childPrototype.hasOwnProperty(property)) {
      return;
    }
    
    Object.defineProperty(
      childPrototype,
      property,
      Object.getOwnPropertyDescriptor(
        extendedPrototype,
        property
      )
    );
  });
  
  return childPrototype;
}


function SpreadMethod(instances, method) {
  return function() {
    var args = arguments;
    
    instances && instances.forEach(function(instance) {
      if (method in instance) {
        instance[method].apply(this, args);
      }
    }, this);
  };
}


function BondsFor(prototype) {
  return prototype.bonds || [];
}


function BondedPrototype(extendedPrototype) {
  var hierarchy = BondsFor(extendedPrototype).concat(extendedPrototype);
  
  var childPrototype = hierarchy.reduce(function(childPrototype, nextExtendedPrototype) {
    return Extend2D(
      childPrototype,
      nextExtendedPrototype,
      PolymerObjectProperties
    );
  }, {});
  
  PolymerLifecycleMethods.forEach(function(method) {
    if (method in childPrototype) {
      childPrototype[method] = SpreadMethod(hierarchy, method);
    }
  });
  
  return childPrototype;
}


function BondedPolymer(prototype) {
  var molecule = BondedPrototype(prototype);
  
  if (Polymer.Base.isPrototypeOf(molecule)) {
    return document.registerElement(molecule.is, molecule);
  }
  
  return Polymer(molecule);
}