const auth = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    return next();
  }

  if (req.path === '/login' || req.path === '/auth') {
    return next();
  }

  res.redirect('/login');
};

describe('Auth Middleware', () => {
  test('should allow access for authenticated user', () => {
    const mockReq = {
      session: { authenticated: true },
      path: '/api/items'
    };
    
    const mockRes = {
      redirect: jest.fn()
    };
    
    const mockNext = jest.fn();

    auth(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.redirect).not.toHaveBeenCalled();
  });

  test('should redirect to login for unauthenticated user', () => {
    const mockReq = {
      session: { authenticated: false },
      path: '/api/items'
    };
    
    const mockRes = {
      redirect: jest.fn()
    };
    
    const mockNext = jest.fn();

    auth(mockReq, mockRes, mockNext);

    expect(mockRes.redirect).toHaveBeenCalledWith('/login');
    expect(mockNext).not.toHaveBeenCalled();
  });

  test('should allow access to login page without auth', () => {
    const mockReq = {
      session: { authenticated: false },
      path: '/login'
    };
    
    const mockRes = {
      redirect: jest.fn()
    };
    
    const mockNext = jest.fn();

    auth(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.redirect).not.toHaveBeenCalled();
  });
});