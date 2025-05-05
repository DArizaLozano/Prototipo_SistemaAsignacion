(function(window, undefined) {
  var dictionary = {
    "908f69d1-2b1b-4590-968e-0b032f1f9052": "REGISTRO DE DOCENTES",
    "86f00207-d36b-4861-93e2-0e6b371b2ca2": "CONSULTAR HORARIOS",
    "0102079a-43eb-42ed-9f31-8b6117a380db": "REPORTES GENERALES",
    "ffdd6bbd-2919-4bc7-bf55-8f42e485e22b": "ASIGNACION AUTOMATICA",
    "d79be85c-2c76-412f-868e-b0d60a8795dd": "REGISTRO DE CURSOS",
    "6d210dfc-bb4d-4c20-ab5e-8b34a0e00a2f": "DASHBOARD",
    "d12245cc-1680-458d-89dd-4f0d7fb22724": "LOGIN",
    "f39803f7-df02-4169-93eb-7547fb8c961a": "Template 1",
    "bb8abf58-f55e-472d-af05-a7d1bb0cc014": "Board 1"
  };

  var uriRE = /^(\/#)?(screens|templates|masters|scenarios)\/(.*)(\.html)?/;
  window.lookUpURL = function(fragment) {
    var matches = uriRE.exec(fragment || "") || [],
        folder = matches[2] || "",
        canvas = matches[3] || "",
        name, url;
    if(dictionary.hasOwnProperty(canvas)) { /* search by name */
      url = folder + "/" + canvas;
    }
    return url;
  };

  window.lookUpName = function(fragment) {
    var matches = uriRE.exec(fragment || "") || [],
        folder = matches[2] || "",
        canvas = matches[3] || "",
        name, canvasName;
    if(dictionary.hasOwnProperty(canvas)) { /* search by name */
      canvasName = dictionary[canvas];
    }
    return canvasName;
  };
})(window);