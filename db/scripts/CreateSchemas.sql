USE AW_Marketing
GO

CREATE SCHEMA Promotions
CREATE TABLE ProductDiscounts
(ProductID int PRIMARY KEY,
 Discount decimal,
 Description nvarchar(50))
ON CurrentData
GO

CREATE SCHEMA Sponsorship
CREATE TABLE SponsorshipDeals
(SponsorshipID int IDENTITY PRIMARY KEY,
 Description nvarchar(200))
ON CurrentData
GO

CREATE SCHEMA PastPromotions
CREATE TABLE ProductDiscounts
(ProductID int,
 Discount decimal,
 Description nvarchar(50))
ON ArchivedData
GO

CREATE SCHEMA PastSponsorship
CREATE TABLE SponsorshipDeals
(SponsorshipID int,
 Description nvarchar(200))
ON ArchivedData
GO



