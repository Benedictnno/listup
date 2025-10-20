// Mock authentication for testing
localStorage.setItem('admin_token', 'mock-token-for-testing');
localStorage.setItem('admin_user', JSON.stringify({
  id: 'admin-1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin'
}));
console.log('Mock authentication set for testing');