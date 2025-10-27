Use Master

-- Setup user for execution context
IF NOT EXISTS (SELECT * FROM sys.syslogins WHERE name = 'MIAMI\Adam')
	CREATE LOGIN [MIAMI\Adam]
	FROM WINDOWS
	WITH DEFAULT_DATABASE = AdventureWorks
GO

Use AdventureWorks

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'Adam' AND type = 'U')
	CREATE USER Adam FOR LOGIN [MIAMI\Adam]
GO

-- Setup data
UPDATE	Sales.SpecialOffer 
SET		StartDate = DateAdd(day, -1, GetDate()), 
		EndDate = DateAdd(day, 27, GetDate())
WHERE	SpecialOfferId IN (1,3,5,7,9,11,13,15)

UPDATE	Sales.SpecialOffer 
SET		StartDate = DateAdd(day, 28, GetDate()), 
		EndDate = DateAdd(month, 2, GetDate())
WHERE	SpecialOfferId IN (2,4,6,8,10,12,14,16)
GO
