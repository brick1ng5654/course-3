USE AW_Marketing
GO

-- Удалить таблицы если они уже существуют
IF EXISTS (SELECT * FROM sys.tables t
           JOIN sys.schemas s ON t.schema_id = s.schema_id
           WHERE t.[Name] = 'SpecialOffers'
           AND s.[Name] = 'Promotions')
 DROP TABLE Promotions.SpecialOffers

IF EXISTS (SELECT * FROM sys.tables t
           JOIN sys.schemas s ON t.schema_id = s.schema_id
           WHERE t.[Name] = 'SpecialOffers'
           AND s.[Name] = 'PastPromotions')
 DROP TABLE PastPromotions.SpecialOffers
GO


-- Создать таблицу для специальных предложений. Не указано filegroup
CREATE TABLE Promotions.SpecialOffers
(OfferID int IDENTITY PRIMARY KEY,
 Description nvarchar(200),
 StartDate datetime,
 EndDate datetime, 
 DiscountPercent decimal)

-- Создать таблицу для архивных предложения по ArchivedData filegroup 
CREATE TABLE PastPromotions.SpecialOffers
(OfferID int IDENTITY PRIMARY KEY,
 Description nvarchar(200),
 StartDate datetime,
 EndDate datetime, 
 DiscountPercent decimal)
ON ArchivedData