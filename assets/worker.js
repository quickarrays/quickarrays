self.onmessage = function(e) {
    const parameters = e.data; 
    const result = build_ds(parameters[0], parameters[1]);
    self.postMessage(result);
};

