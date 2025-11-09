import { createExplanation } from "./controller/code.explainer.controller.js";

const mockRequest = {
  user: { id: 'test-user-123' },
  body: {
    code: 'function add(a, b) { return a + b; }',
    language: 'javascript',
    fileName: 'math.js'
  }
};

const mockResponse = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log('Status:', this.statusCode);
    console.log('Response:', data);
    return this;
  }
};

createExplanation(mockRequest, mockResponse);