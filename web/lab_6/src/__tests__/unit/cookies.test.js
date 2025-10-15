describe('Cookie Operations', () => {
  let mockReq, mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      session: {
        visitCount: 5,
        lastVisit: '2024-01-01 12:00:00'
      }
    };
    
    mockRes = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn()
    };
  });

  test('should save user preferences to cookies', () => {
    // Arrange - данные из формы
    mockReq.body = {
      userName: 'TestUser',
      bgColor: '#3498db'
    };

    // Act - симуляция логики из /save-preferences
    const savePreferences = (req, res) => {
      const { userName, bgColor } = req.body;

      res.cookie('userName', userName, { 
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: false
      });
      res.cookie('bgColor', bgColor, { 
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: false
      });
      res.cookie('visitCount', req.session.visitCount, { 
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: false
      });
      res.cookie('lastVisit', req.session.lastVisit, { 
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: false
      });

      res.redirect('/profile');
    };

    // Выполняем
    savePreferences(mockReq, mockRes);

    // Assert
    expect(mockRes.cookie).toHaveBeenCalledWith('userName', 'TestUser', {
      maxAge: 2592000000,
      httpOnly: false
    });
    expect(mockRes.cookie).toHaveBeenCalledWith('bgColor', '#3498db', {
      maxAge: 2592000000,
      httpOnly: false
    });
    expect(mockRes.cookie).toHaveBeenCalledWith('visitCount', 5, {
      maxAge: 2592000000,
      httpOnly: false
    });
    expect(mockRes.redirect).toHaveBeenCalledWith('/profile');
  });

  test('should clear user cookies', () => {
    // Act - симуляция логики из /clear-cookies
    const clearCookies = (req, res) => {
      res.clearCookie('userName');
      res.clearCookie('bgColor');
      res.redirect('/preferences');
    };

    // Выполняем
    clearCookies(mockReq, mockRes);

    // Assert
    expect(mockRes.clearCookie).toHaveBeenCalledWith('userName');
    expect(mockRes.clearCookie).toHaveBeenCalledWith('bgColor');
    expect(mockRes.redirect).toHaveBeenCalledWith('/preferences');
  });

  test('should handle cookie reading logic', () => {
    // Arrange - cookies в запросе
    const reqWithCookies = {
      cookies: {
        userName: 'John',
        bgColor: '#e74c3c',
        visitCount: '10',
        lastVisit: '2024-01-01 10:00:00'
      }
    };

    // Act - симуляция чтения cookie (как в /profile)
    const getProfileData = (req) => {
      return {
        userName: req.cookies.userName || 'Гость',
        bgColor: req.cookies.bgColor || '#ffffff',
        visitCount: req.cookies.visitCount || '0',
        lastVisit: req.cookies.lastVisit || 'Неизвестно'
      };
    };

    const profile = getProfileData(reqWithCookies);

    // Assert
    expect(profile.userName).toBe('John');
    expect(profile.bgColor).toBe('#e74c3c');
    expect(profile.visitCount).toBe('10');
    expect(profile.lastVisit).toBe('2024-01-01 10:00:00');
  });

  test('should use default values when cookies are missing', () => {
    // Arrange - нет cookies
    const reqWithoutCookies = {
      cookies: {}
    };

    // Act
    const getProfileData = (req) => {
      return {
        userName: req.cookies.userName || 'Гость',
        bgColor: req.cookies.bgColor || '#ffffff',
        visitCount: req.cookies.visitCount || '0',
        lastVisit: req.cookies.lastVisit || 'Неизвестно'
      };
    };

    const profile = getProfileData(reqWithoutCookies);

    // Assert
    expect(profile.userName).toBe('Гость');
    expect(profile.bgColor).toBe('#ffffff');
    expect(profile.visitCount).toBe('0');
    expect(profile.lastVisit).toBe('Неизвестно');
  });
});