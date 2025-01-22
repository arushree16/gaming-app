jest.setTimeout(10000); // Increase timeout to 10 seconds

// Clean up any open handles after all tests
afterAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for open handles
}); 